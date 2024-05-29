import { access } from 'node:fs/promises';
import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { GithubRepoResponse } from '#/types.js';

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

export async function promptForProjectType(templateList: GithubRepoResponse[]): Promise<string> {
  const answer = await select({
    message: chalk.dim.yellow('Project type'),
    choices: templateList.map((template) => ({
      name: `${template.name.split('-').pop()} (${template.description})`,
      value: template.name,
    })),
  });

  return answer;
}

export async function promptForPackageManager(availablePackageManagers: string[]): Promise<string> {
  const answer = await select({
    message: chalk.dim.yellow('Package manager'),
    choices: ['npm', 'yarn', 'pnpm'].map((packageManager) => ({
      value: packageManager,
      name: packageManager,
      disabled: availablePackageManagers.includes(packageManager) ? false : 'not available',
    })),
  });

  return answer;
}

export async function promptForConfirmation(
  projectName: string,
  projectType: string,
  packageManager: string,
): Promise<boolean> {
  const highlightType = `${chalk.redBright(projectType.split('-').pop())}`;
  const highlightProject = `${chalk.redBright(`./${projectName}`)}`;
  const highlightManager = `${chalk.redBright(packageManager)}`;
  const message = `This will create a ${highlightType} project in ${highlightProject} using ${highlightManager}.`;

  const answer = await select({
    message: chalk.dim.yellow(`${message} Continue?`),
    choices: [
      { value: true, name: 'Yes' },
      { value: false, name: 'No' },
    ],
  });

  return answer;
}
