/* eslint-disable unicorn/no-process-exit */
import { exec as _exec, ExecOptions as _ExecOptions } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import chalk from 'chalk';
import { PACKAGE_MANAGERS, PackageManager } from '#/types.js';

export type ExecOptions = _ExecOptions & {
  stdio?: 'pipe' | 'ignore' | 'inherit' | ('pipe' | 'ignore' | 'inherit' | null | number)[];
};

export const exec: (
  command: string,
  options?: ExecOptions,
) => Promise<{ stdout: string; stderr: string }> = promisify(_exec);

export const TS_NEW_DIRECTORY = path.resolve(path.dirname(fileURLToPath(new URL(import.meta.url))));

export async function showLogo(): Promise<void> {
  const packageJsonPath = path.resolve(TS_NEW_DIRECTORY, '../package.json');
  const packageJsonFile = await readFile(packageJsonPath, 'utf8');
  const packageJsonContents = JSON.parse(packageJsonFile) as { version: string };

  const thisProject = chalk.cyanBright.bold('@mkvlrn/ts-new');
  const version = chalk.greenBright.bold(packageJsonContents.version);
  console.info(`🤖 ${thisProject} v${version}`);
}

export function sayGoodbye(projectName: string): void {
  const projectDirectory = chalk.yellowBright(path.resolve(process.cwd(), projectName));
  console.info(chalk.cyanBright(`🚀 Your project is ready at ${projectDirectory}`));
}

export async function checkForGitInstallation(): Promise<void> {
  try {
    await exec('git --version', { stdio: 'ignore' });
  } catch {
    throw new Error(
      'Git is not installed or it is not available in your PATH. Please install Git and try again.',
    );
  }
}

export async function getAvailablePackageManagers(): Promise<PackageManager[]> {
  const availablePackageManagers: PackageManager[] = [];

  for await (const pm of PACKAGE_MANAGERS) {
    try {
      await exec(`${pm} --version`, { stdio: 'ignore' });
      availablePackageManagers.push(pm);
    } catch {
      //
    }
  }

  return availablePackageManagers;
}

export async function errorHandler(main: () => Promise<void>): Promise<void> {
  try {
    await main();
  } catch (error) {
    const preMessage = chalk.redBright('An error occurred:');
    console.error(`${preMessage} ${(error as Error).message}`);
    process.exit(1);
  }
}
