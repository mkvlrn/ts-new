import { access } from 'node:fs/promises';
import path from 'node:path';
import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';

async function getProjectName(): Promise<[string, string]> {
  const projectName = await input({
    message: chalk.dim.yellow('Project name'),
    default: 'my-project',
    validate: async (projectName) => {
      const isValidFilename = /^[A-Za-z][\w.-]*$/g.test(projectName);
      if (!isValidFilename) {
        return 'Please enter a valid directory name for your project.';
      }

      await access(projectName).catch(() => 'A directory with this name already exists.');

      return true;
    },
  });

  const projectPath = path.resolve(process.cwd(), projectName);

  return [projectName, projectPath];
}

async function getProjectType(templateList: GithubRepoResponse[]): Promise<string> {
  const answer = await select({
    message: chalk.dim.yellow('Project type'),
    choices: templateList.map((template) => ({
      name: `${template.name.split('-').pop()} (${template.description})`,
      value: template.name,
    })),
  });

  return answer;
}

async function getPackageManager(availablePackageManagers: string[]): Promise<string> {
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

async function getGitInit(): Promise<boolean> {
  const answer = await select({
    message: chalk.dim.yellow('Initialize git and create first commit ?'),
    choices: [
      { value: true, name: 'Yes' },
      { value: false, name: 'No' },
    ],
  });

  return answer;
}

async function getConfirmation(
  projectName: string,
  projectType: string,
  packageManager: string,
  gitInit: boolean,
): Promise<boolean> {
  const highlightType = `${chalk.redBright(projectType.split('-').pop())}`;
  const highlightProject = `${chalk.redBright(`./${projectName}`)}`;
  const highlightManager = `${chalk.redBright(packageManager)}`;
  const highlightGitInit = `${chalk.redBright(gitInit ? '' : 'not ')}`;
  const message = `This will create a ${highlightType} project in ${highlightProject} using ${highlightManager} and a git repository will ${highlightGitInit}be initialized.`;

  const answer = await select({
    message: chalk.dim.yellow(`${message} Continue?`),
    choices: [
      { value: true, name: 'Yes' },
      { value: false, name: 'No' },
    ],
  });

  return answer;
}

export default {
  getProjectName,
  getProjectType,
  getPackageManager,
  getGitInit,
  getConfirmation,
};
