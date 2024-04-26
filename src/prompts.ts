import { access } from 'node:fs/promises';
import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { getAvailablePackageManagers } from '#/system.js';
import { PACKAGE_MANAGERS, PackageManager, PROJECT_TYPES, ProjectType } from '#/types.js';

function colorPrompt(message: string) {
  return chalk.dim.yellow(message);
}

export async function promptForProjectName(): Promise<string> {
  const answer = await input({
    message: colorPrompt('Project name'),
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
    message: colorPrompt('Project type'),
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
    message: colorPrompt('Package manager'),
    choices: PACKAGE_MANAGERS.map((packageManager) => ({
      value: packageManager,
      name: packageManager,
      disabled: available.includes(packageManager) ? false : 'not available',
    })),
  });

  return answer;
}
