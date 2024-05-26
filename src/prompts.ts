import { access } from 'node:fs/promises';
import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { getAvailablePackageManagers } from '#/system.js';
import { PACKAGE_MANAGERS, PackageManager, PROJECT_TYPES, ProjectType } from '#/types.js';

export async function promptForProjectName(): Promise<string> {
  const answer = await input({
    message: chalk.dim.yellow('Project name'),
    default: 'my-project',
    validate: async (projectName) => {
      const isValidFilename = /^[A-Za-z][\w.-]*$/g.test(projectName);
      if (!isValidFilename) {
        return 'Please enter a valid directory name for your project.';
      }

      try {
        await access(projectName);
        return 'A directory with this name already exists.';
      } catch {
        //
      }

      return true;
    },
  });

  return answer;
}

export async function promptForProjectType(): Promise<ProjectType> {
  const answer = await select({
    message: chalk.dim.yellow('Project type'),
    choices: PROJECT_TYPES.map((projectType) => ({
      value: projectType,
      name: projectType,
    })),
  });

  return answer;
}

export async function promptForPackageManager(): Promise<PackageManager> {
  const available = await getAvailablePackageManagers();

  const answer = await select({
    message: chalk.dim.yellow('Package manager'),
    choices: PACKAGE_MANAGERS.map((packageManager) => ({
      value: packageManager,
      name: packageManager,
      disabled: available.includes(packageManager) ? false : 'not available',
    })),
  });

  return answer;
}

export async function promptForConfirmation(
  projectName: string,
  projectType: ProjectType,
  packageManager: PackageManager,
): Promise<boolean> {
  const message = `This will create a new ${chalk.redBright(projectType)} project in ${chalk.redBright(projectName)} using ${chalk.redBright(packageManager)}.`;
  const answer = await select({
    message: chalk.dim.yellow(`${message} Continue?`),
    choices: [
      { value: true, name: 'Yes' },
      { value: false, name: 'No' },
    ],
  });

  return answer;
}
