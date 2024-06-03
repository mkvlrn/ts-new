import { exec as _exec } from 'node:child_process';
import { readFile, rm, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import chalk from 'chalk';
import ora from 'ora';
import { ProjectError } from '#/project-error.ts';

const exec: (
  command: string,
  options?: ExecOptions,
) => Promise<{ stdout: string; stderr: string }> = promisify(_exec);

const spinner = ora();

async function sayHello(): Promise<void> {
  const packageDirectory = path.resolve(path.dirname(fileURLToPath(new URL(import.meta.url))));
  const packageJsonPath = path.resolve(packageDirectory, '../package.json');
  const packageJsonFile = await readFile(packageJsonPath, 'utf8');
  const packageJsonContents = JSON.parse(packageJsonFile) as { name: string; version: string };
  const thisProject = chalk.cyanBright.bold(packageJsonContents.name);
  const version = chalk.greenBright.bold(packageJsonContents.version);

  // eslint-disable-next-line no-console
  console.info(`🤖 ${thisProject} v${version}`);
}

function sayGoodbye(projectPath: string | false | null = null): void {
  if (projectPath === null) {
    // eslint-disable-next-line no-console
    console.info(chalk.cyanBright('👋 Goodbye!'));
    return;
  }

  if (projectPath === false) {
    // eslint-disable-next-line no-console
    console.info(chalk.cyanBright('👋 Goodbye. 😞'));
    return;
  }

  // eslint-disable-next-line no-console
  console.info(chalk.cyanBright(`🚀 Your project is ready at ${chalk.yellowBright(projectPath)}`));
}

async function checkForGitInstallation(): Promise<string | null> {
  try {
    spinner.start('checking for git installation');
    await exec('git --version', { stdio: 'ignore' });

    const gitName = await exec('git config user.name', { stdio: 'ignore' }).catch(() => ({
      stdout: '',
    }));
    const gitEmail = await exec('git config user.email', { stdio: 'ignore' }).catch(() => ({
      stdout: '',
    }));

    const gitInfo =
      !gitName.stdout.trim() || !gitEmail.stdout.trim()
        ? null
        : `${gitName.stdout.trim()} <${gitEmail.stdout.trim()}>`;

    spinner.succeed();

    return gitInfo;
  } catch {
    spinner.fail();
    throw new Error('git is needed to create a new project; unable to continue');
  }
}

async function getAvailablePackageManagers(): Promise<string[]> {
  const availablePackageManagers: string[] = [];

  try {
    spinner.start('checking for available package managers');
    for await (const pm of ['npm', 'yarn', 'pnpm']) {
      try {
        await exec(`${pm} --version`, { stdio: 'ignore' });
        availablePackageManagers.push(pm);
      } catch {
        continue;
      }
    }
    if (availablePackageManagers.length === 0) {
      throw new Error('no available package managers found');
    }
    spinner.succeed();
  } catch (error) {
    spinner.fail();
    throw new Error(`failed to check for available package managers (${(error as Error).message})`);
  }

  return availablePackageManagers;
}

async function getTemplateList(): Promise<GithubRepoResponse[]> {
  try {
    spinner.start('fetching template list');
    const response = await fetch('https://api.github.com/users/mkvlrn/repos?type=public');
    const repos = (await response.json()) as GithubRepoResponse[];
    spinner.succeed();

    return repos.filter((repo) => repo.is_template);
  } catch (error) {
    spinner.fail();
    throw new Error(`failed to fetch template list (${(error as Error).message})`);
  }
}

async function cloneTemplate(templateName: string, projectName: string): Promise<void> {
  try {
    spinner.start('cloning template');
    const command = `git clone https://github.com/mkvlrn/${templateName}.git ${projectName}`;
    await exec(command, { stdio: 'ignore' });
    spinner.succeed();
  } catch (error) {
    spinner.fail();
    throw new Error(`failed to clone template (${(error as Error).message})`);
  }
}

async function cleanupTemplate(
  projectName: string,
  projectPath: string,
  packageManager: string,
  gitInfo: string | null,
): Promise<void> {
  try {
    spinner.start('cleaning up template');

    // remove .git folder
    await rm(path.resolve(projectPath, '.git'), { recursive: true, force: true });

    // remove extraneous files
    await unlink(path.resolve(projectPath, '.github', 'dependabot.yml'));
    await unlink(path.resolve(projectPath, 'readme.md'));
    await unlink(path.resolve(projectPath, 'sonar-project.properties'));
    await unlink(path.resolve(projectPath, 'package-lock.json')).catch(() => ({}));
    await unlink(path.resolve(projectPath, 'yarn.lock')).catch(() => ({}));
    await unlink(path.resolve(projectPath, 'pnpm-lock.yaml')).catch(() => ({}));

    // remove extraneous lines from ci workflow
    const ciWorkflowPath = path.resolve(projectPath, '.github', 'workflows', 'checks.yml');
    const ciWorkflowFile = await readFile(ciWorkflowPath, 'utf8');
    // eslint-disable-next-line prefer-const
    let ciWorkflowLines = ciWorkflowFile.split('\n');
    const testCovIndex = ciWorkflowLines.findIndex((line) => line.includes('test:cov'));
    ciWorkflowLines[testCovIndex] = ciWorkflowLines[testCovIndex].replace('test:cov', 'test');
    await writeFile(ciWorkflowPath, ciWorkflowLines.splice(0, testCovIndex + 1).join('\n') + '\n');

    // replace package manage in husky hooks with the one selected
    const newPackageManager = packageManager === `npm` ? 'npx' : `${packageManager}`;
    const huskyPath = path.resolve(projectPath, '.husky');
    const preCommitContents = `${newPackageManager} tsc --noemit\n${newPackageManager} lint-staged\n${newPackageManager} vitest --run\n`;
    await writeFile(path.resolve(huskyPath, 'pre-commit'), preCommitContents);
    const commitMessageContents = `${newPackageManager} commitlint --edit $1\n`;
    await writeFile(path.resolve(huskyPath, 'commit-msg'), commitMessageContents);

    // update package.json
    await exec(`npm pkg set name="${projectName}"`, { stdio: 'ignore', cwd: projectPath });
    await exec(`npm pkg set description="${projectName}"`, { stdio: 'ignore', cwd: projectPath });
    if (!gitInfo) {
      await exec(`npm pkg delete author`, { stdio: 'ignore', cwd: projectPath });
    }
    await exec('npm pkg delete repository', { stdio: 'ignore', cwd: projectPath });
    await exec('npm pkg delete keywords ', { stdio: 'ignore', cwd: projectPath });

    spinner.succeed();
  } catch (error) {
    spinner.fail();
    throw new Error(`failed to clean up template (${(error as Error).message})`);
  }
}

async function installDependencies(projectPath: string, packageManager: string): Promise<void> {
  try {
    spinner.start(`installing dependencies using ${packageManager}`);
    await exec(`${packageManager} install`, { stdio: 'ignore', cwd: projectPath });
    spinner.succeed();
  } catch (error) {
    spinner.fail();
    throw new Error(`failed to install dependencies (${(error as Error).message})`);
  }
}

async function initializeGitRepository(gitInit: boolean): Promise<void> {
  if (!gitInit) {
    return;
  }

  try {
    spinner.start('initializing git repository');
    await exec('git init', { stdio: 'ignore' });
    spinner.succeed();
  } catch (error) {
    spinner.fail();
    throw new Error(`failed to restart git repository (${(error as Error).message})`);
  }
}

async function errorHandler(main: () => Promise<void>): Promise<void> {
  try {
    await main();
  } catch (error) {
    if (error instanceof ProjectError) {
      const { message, projectPath } = error;
      const preMessage = chalk.redBright.bold('an error occurred:');
      // eslint-disable-next-line no-console
      console.error(`${preMessage} ${message}`);

      spinner.start('rolling back changes');
      await rm(projectPath, { recursive: true, force: true });
      spinner.succeed();
      sayGoodbye(false);
    }

    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
}

export default {
  sayHello,
  sayGoodbye,
  checkForGitInstallation,
  getAvailablePackageManagers,
  getTemplateList,
  cloneTemplate,
  cleanupTemplate,
  installDependencies,
  initializeGitRepository,
  errorHandler,
};
