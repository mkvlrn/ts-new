import { execSync } from 'node:child_process';
import { exec, spinner } from '~/injection.ts';
import { PackageManager } from '~/types.ts';

async function gitInfo(): Promise<string | null> {
  try {
    spinner.start('checking for git installation');
    await exec('git --version', { stdio: 'ignore' });

    const gitName = execSync('git config user.name').toString().trim();
    const gitEmail = execSync('git config user.email').toString().trim();

    const gitInfo = !gitName || !gitEmail ? '' : `${gitName} <${gitEmail}>`;

    spinner.succeed();

    return gitInfo;
  } catch {
    spinner.fail();
    return null;
  }
}

async function packageManagers(): Promise<PackageManager[]> {
  const knownPackageManagers: PackageManager[] = ['npm', 'yarn', 'pnpm'];
  const availablePackageManagers: PackageManager[] = [];

  try {
    spinner.start('checking for available package managers');
    for (const pm of knownPackageManagers) {
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

export const local = {
  gitInfo,
  packageManagers,
};
