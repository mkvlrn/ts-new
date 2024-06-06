import { exec as _exec, execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { access, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { ExitPromptError } from '@inquirer/core';
import chalk from 'chalk';
import ora from 'ora';

const exec: (
  command: string,
  options?: ExecOptions,
) => Promise<{ stdout: string; stderr: string }> = promisify(_exec);

const spinner = ora();

function sayHello(): void {
  const packageDirectory = path.resolve(path.dirname(fileURLToPath(new URL(import.meta.url))));
  const packageJsonPath = path.resolve(packageDirectory, '../package.json');
  const packageJsonFile = readFileSync(packageJsonPath, 'utf8');
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

    const gitName = execSync('git config user.name').toString().trim();
    const gitEmail = execSync('git config user.email').toString().trim();

    const gitInfo = !gitName || !gitEmail ? null : `${gitName} <${gitEmail}>`;

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
    for (const pm of ['npm', 'yarn', 'pnpm']) {
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
  gitInfo: string | null,
): Promise<void> {
  try {
    spinner.start('cleaning up template');

    // remove extraneous folders and files
    try {
      await rm(path.resolve(projectPath, '.git'), { recursive: true, force: true });
      await rm(path.resolve(projectPath, '.github', 'dependabot.yml'), { force: true });
      await rm(path.resolve(projectPath, '.github', 'workflows', 'sonar.yml'), { force: true });
      await rm(path.resolve(projectPath, 'readme.md'), { force: true });
      await rm(path.resolve(projectPath, 'sonar-project.properties'), { force: true });
      await rm(path.resolve(projectPath, 'package-lock.json'), { force: true });
      await rm(path.resolve(projectPath, 'yarn.lock'), { force: true });
      await rm(path.resolve(projectPath, 'pnpm-lock.yaml'), { force: true });
    } catch {
      // ignore
    }

    // update package.json
    const execOptions: ExecOptions = { stdio: 'ignore', cwd: projectPath };
    await exec(`npm pkg set name="${projectName}"`, execOptions);
    await exec(`npm pkg set description="${projectName}"`, execOptions);
    if (!gitInfo) {
      await exec(`npm pkg delete author`, execOptions);
    }
    await exec('npm pkg delete repository', execOptions);
    await exec('npm pkg delete keywords ', execOptions);

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

async function initializeGitRepository(gitInit: boolean, projectPath: string): Promise<void> {
  if (!gitInit) {
    return;
  }

  try {
    spinner.start('initializing git repository');
    await exec('git init', { stdio: 'ignore', cwd: projectPath });
    spinner.succeed();
  } catch (error) {
    spinner.fail();
    throw new Error(`failed to restart git repository (${(error as Error).message})`);
  }
}

async function rollbackChanges(projectPath: string): Promise<void> {
  let needsRollback = false;

  if (projectPath !== '') {
    needsRollback = true;
  }

  try {
    await access(projectPath);
    needsRollback = true;
  } catch {
    // ignore
  }

  if (needsRollback) {
    try {
      spinner.start('rolling back changes');
      await rm(projectPath, { recursive: true, force: true });
      spinner.succeed();
    } catch (error) {
      spinner.fail();
      // eslint-disable-next-line no-console
      console.error(
        `failed to roll back changes (${(error as Error).message}), you may need to manually remove the project`,
      );
    }
  }

  sayGoodbye(null);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
}

function handleError(error: unknown, projectPath: string): void {
  const preMessage = chalk.redBright.bold('an error occurred:');
  let message = (error as Error).message;

  if (error instanceof ExitPromptError) {
    message = 'user interrupted';
  }

  // eslint-disable-next-line no-console
  console.error(`\n${preMessage} ${message}`);
  rollbackChanges(projectPath).catch(() => ({}));
}

export const system = {
  sayHello,
  sayGoodbye,
  checkForGitInstallation,
  getAvailablePackageManagers,
  getTemplateList,
  cloneTemplate,
  cleanupTemplate,
  installDependencies,
  initializeGitRepository,
  handleError,
};
