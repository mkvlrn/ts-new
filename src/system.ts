import { readFileSync } from 'node:fs';
import { access, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ExitPromptError } from '@inquirer/core';
import chalk from 'chalk';
import { exec, spinner } from '~/injection.ts';
import { ExecOptions } from '~/types.ts';

function sayHello(): void {
  const packageDirectory = path.resolve(
    path.dirname(fileURLToPath(new URL(import.meta.url))),
  );
  const packageJsonPath = path.resolve(packageDirectory, `../package.json`);
  const packageJsonFile = readFileSync(packageJsonPath, `utf8`);
  const packageJsonContents = JSON.parse(packageJsonFile) as {
    name: string;
    version: string;
  };
  const thisProject = chalk.cyanBright.bold(packageJsonContents.name);
  const version = chalk.greenBright.bold(packageJsonContents.version);

  // eslint-disable-next-line no-console
  console.info(`🤖 ${thisProject} v${version}`);
}

function sayGoodbye(projectPath: string | false | null = null): void {
  if (projectPath === null) {
    // eslint-disable-next-line no-console
    console.info(chalk.cyanBright(`👋 Goodbye!`));
    return;
  }

  if (projectPath === false) {
    // eslint-disable-next-line no-console
    console.info(chalk.cyanBright(`👋 Goodbye. 😞`));
    return;
  }

  // eslint-disable-next-line no-console
  console.info(
    chalk.cyanBright(
      `🚀 Your project is ready at ${chalk.yellowBright(projectPath)}`,
    ),
  );
}

async function cleanupTemplate(
  projectName: string,
  projectPath: string,
  gitInit: boolean,
  gitInfo: string | null,
): Promise<void> {
  try {
    spinner.start(`cleaning up template`);

    // remove extraneous files
    try {
      await rm(path.resolve(projectPath, `.github`, `dependabot.yml`), {
        force: true,
      });
      await rm(path.resolve(projectPath, `.github`, `workflows`, `sonar.yml`), {
        force: true,
      });
      await rm(path.resolve(projectPath, `readme.md`), { force: true });
      await rm(path.resolve(projectPath, `package-lock.json`), { force: true });
      await rm(path.resolve(projectPath, `yarn.lock`), { force: true });
      await rm(path.resolve(projectPath, `pnpm-lock.yaml`), { force: true });
    } catch {
      // ignore
    }

    // update package.json
    const execOptions: ExecOptions = { stdio: `ignore`, cwd: projectPath };
    await exec(`npm pkg set name="${projectName}"`, execOptions);
    await exec(`npm pkg set description="${projectName}"`, execOptions);
    if (gitInit) {
      await (gitInfo
        ? exec(`npm pkg set author="${gitInfo}"`, execOptions)
        : exec(`npm pkg delete author`, execOptions));
    } else {
      await exec(`npm pkg delete author`, execOptions);
    }
    await exec(`npm pkg delete repository`, execOptions);
    await exec(`npm pkg delete keywords `, execOptions);

    spinner.succeed();
  } catch (error) {
    spinner.fail();
    throw new Error(
      `failed to clean up template (${(error as Error).message})`,
    );
  }
}

async function installDependencies(
  projectPath: string,
  installPackages: boolean,
  packageManager: string,
): Promise<void> {
  if (!installPackages) {
    return;
  }

  try {
    spinner.start(`installing dependencies using ${packageManager}`);
    await exec(`${packageManager} install`, {
      stdio: `ignore`,
      cwd: projectPath,
    });
    spinner.succeed();
  } catch (error) {
    spinner.fail();
    throw new Error(
      `failed to install dependencies (${(error as Error).message})`,
    );
  }
}

async function initializeGitRepository(
  gitInit: boolean,
  projectPath: string,
): Promise<void> {
  if (!gitInit) {
    return;
  }

  try {
    spinner.start(`initializing git repository and committing`);
    await exec(`git init`, { stdio: `ignore`, cwd: projectPath });
    await exec(`git add .`, { stdio: `ignore`, cwd: projectPath });
    await exec(`git commit -m "initial commit"`, {
      stdio: `ignore`,
      cwd: projectPath,
    });
    spinner.succeed();
  } catch (error) {
    spinner.fail();
    throw new Error(
      `failed to restart git repository (${(error as Error).message})`,
    );
  }
}

async function rollbackChanges(projectPath: string): Promise<void> {
  let needsRollback = false;

  if (projectPath !== ``) {
    try {
      await access(projectPath);
      needsRollback = true;
    } catch {
      // ignore
    }
  }

  if (needsRollback) {
    try {
      spinner.start(`rolling back changes`);
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
}

function handleError(error: unknown, projectPath: string): void {
  const preMessage = chalk.redBright.bold(`an error occurred:`);
  let message = (error as Error).message;

  if (error instanceof ExitPromptError) {
    message = `user interrupted`;
  }

  // eslint-disable-next-line no-console
  console.error(`\n${preMessage} ${message}`);
  rollbackChanges(projectPath)
    .then(() => {
      sayGoodbye(null);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(0);
    })
    .catch(() => {
      // eslint-disable-next-line no-console
      console.log(`failed to roll back changes`);
    });
}

export const system = {
  sayHello,
  sayGoodbye,
  cleanupTemplate,
  installDependencies,
  initializeGitRepository,
  handleError,
};
