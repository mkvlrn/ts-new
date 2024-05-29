/* eslint-disable unicorn/no-process-exit */
import { exec as _exec } from 'node:child_process';
import { readFile, rm, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import chalk from 'chalk';
import ora from 'ora';
import { ExecOptions, GithubRepoResponse } from '#/types.js';

const exec: (
  command: string,
  options?: ExecOptions,
) => Promise<{ stdout: string; stderr: string }> = promisify(_exec);

const spinner = ora();

export async function showLogo(): Promise<void> {
  const packageDirectory = path.resolve(path.dirname(fileURLToPath(new URL(import.meta.url))));
  const packageJsonPath = path.resolve(packageDirectory, '../package.json');
  const packageJsonFile = await readFile(packageJsonPath, 'utf8');
  const packageJsonContents = JSON.parse(packageJsonFile) as { version: string };

  const thisProject = chalk.cyanBright.bold('@mkvlrn/ts-new');
  const version = chalk.greenBright.bold(packageJsonContents.version);
  // eslint-disable-next-line no-console
  console.info(`🤖 ${thisProject} v${version}`);
}

export function sayGoodbye(projectName: string | null = null): void {
  if (!projectName) {
    // eslint-disable-next-line no-console
    console.info(chalk.cyanBright('👋 Goodbye!'));
    return;
  }

  const projectDirectory = chalk.yellowBright(path.resolve(process.cwd(), projectName));
  // eslint-disable-next-line no-console
  console.info(chalk.cyanBright(`🚀 Your project is ready at ${projectDirectory}`));
}

export async function checkForGitInstallation(): Promise<void> {
  try {
    spinner.start('checking for git installation');
    await exec('git --version', { stdio: 'ignore' });
    spinner.succeed();
  } catch {
    spinner.fail();
    throw new Error('git is needed to create a new project; unable to continue');
  }
}

export async function getAvailablePackageManagers(): Promise<string[]> {
  const availablePackageManagers: string[] = [];

  try {
    spinner.start('checking for available package managers');
    for await (const pm of ['npm', 'yarn', 'pnpm']) {
      await exec(`${pm} --version`, { stdio: 'ignore' });
      availablePackageManagers.push(pm);
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

export async function getTemplateList(): Promise<GithubRepoResponse[]> {
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

export async function cloneTemplate(templateName: string, projectName: string): Promise<void> {
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

export async function cleanupTemplate(projectName: string): Promise<void> {
  const EXEC_OPTIONS: ExecOptions = {
    cwd: path.resolve(process.cwd(), projectName),
    stdio: 'ignore',
  };

  try {
    spinner.start('cleaning up template');
    await rm(path.resolve(process.cwd(), projectName, '.git'), { recursive: true, force: true });
    await exec('git init', EXEC_OPTIONS);
    await unlink(path.resolve(process.cwd(), projectName, '.github', 'dependabot.yml'));
    await unlink(path.resolve(process.cwd(), projectName, 'readme.md'));
    await exec(`npm pkg set name="${projectName}"`, EXEC_OPTIONS);
    await exec(`npm pkg set description="${projectName}"`, EXEC_OPTIONS);
    const gitName = await exec('git config user.name', EXEC_OPTIONS);
    const gitEmail = await exec('git config user.email', EXEC_OPTIONS);
    if (!gitName.stderr && !gitEmail.stderr) {
      await exec(`npm pkg delete author`, EXEC_OPTIONS);
    } else {
      const author = `${gitName.stdout.trim()} <${gitEmail.stdout.trim()}>`;
      await exec(`npm pkg set author="${author}"`, EXEC_OPTIONS);
    }
    await exec('npm pkg delete repository', EXEC_OPTIONS);
    await exec('npm pkg delete keywords ', EXEC_OPTIONS);

    spinner.succeed();
  } catch (error) {
    spinner.fail();
    throw new Error(`failed to clean up template (${(error as Error).message})`);
  }
}

export async function installDependencies(
  projectName: string,
  packageManager: string,
): Promise<void> {
  const EXEC_OPTIONS: ExecOptions = {
    cwd: path.resolve(process.cwd(), projectName),
    stdio: 'ignore',
  };

  try {
    spinner.start(`installing dependencies using ${packageManager}`);
    const command = `${packageManager} install`;
    await exec(command, EXEC_OPTIONS);
    await exec('git add .', EXEC_OPTIONS);
    await exec('git commit -m "initial commit"', EXEC_OPTIONS);
    spinner.succeed();
  } catch (error) {
    spinner.fail();
    throw new Error(`failed to install dependencies (${(error as Error).message})`);
  }
}

export async function rollback(projectName: string): Promise<void> {
  try {
    spinner.start('rolling back');
    await rm(path.resolve(process.cwd(), projectName), { recursive: true, force: true });
    spinner.succeed();
  } catch (error) {
    spinner.fail();
    throw new Error(`failed to roll back (${(error as Error).message})`);
  }
}

export async function errorHandler(main: () => Promise<void>): Promise<void> {
  try {
    await main();
  } catch (error) {
    const preMessage = chalk.redBright.bold('an error occurred:');
    // eslint-disable-next-line no-console
    console.error(`${preMessage} ${(error as Error).message}`);
    process.exit(1);
  }
}
