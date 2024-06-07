import { access } from 'node:fs/promises';
import path from 'node:path';
import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { GithubRepoResponse, PackageManager } from '~/types.ts';

async function getProjectName(): Promise<[string, string]> {
  const projectName = await input({
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
        return true;
      }
    },
  });

  const projectPath = path.resolve(process.cwd(), projectName);

  return [projectName, projectPath];
}

async function getProjectType(templateList: GithubRepoResponse[]): Promise<string> {
  const answer = await select({
    message: chalk.dim.yellow('Project type'),
    choices: templateList.map((template) => ({
      name: `${template.name.split('-').pop() ?? `Unknown`} (${template.description})`,
      value: template.name,
    })),
  });

  return answer;
}

async function getInstallPackages(): Promise<boolean> {
  const answer = await select({
    message: chalk.dim.yellow('Install packages?'),
    choices: [
      { value: true, name: 'Yes' },
      { value: false, name: 'No' },
    ],
  });

  return answer;
}

async function getPackageManager(
  availablePackageManagers: PackageManager[],
  installPackages: boolean,
): Promise<PackageManager> {
  if (!installPackages) {
    // eslint-disable-next-line no-console
    console.log(chalk.dim.yellow('Skipping package manager selection.'));
    return 'npm';
  }

  const knownPackageManagers: PackageManager[] = ['npm', 'yarn', 'pnpm'];
  const answer = await select({
    message: chalk.dim.yellow('Package manager'),
    choices: knownPackageManagers.map((packageManager) => ({
      value: packageManager,
      name: packageManager,
      disabled: availablePackageManagers.includes(packageManager) ? false : 'not available',
    })),
  });

  return answer;
}

async function getGitInit(gitInfo: string | null): Promise<boolean> {
  if (gitInfo === null) {
    // eslint-disable-next-line no-console
    console.info(chalk.dim.yellow('Git not installed/found in PATH. Skipping git initialization.'));
    return false;
  }

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
  installPackages: boolean,
  packageManager: string,
  gitInit: boolean,
): Promise<boolean> {
  const highlightType = chalk.redBright(projectType.split('-').pop());
  const highlightProject = chalk.redBright(`./${projectName}`);
  let highlightPackageInstallation = '';
  highlightPackageInstallation = installPackages
    ? chalk.redBright(`be installed with ${packageManager}`)
    : chalk.redBright(`not be installed`);
  const highlightGitInit = chalk.redBright(gitInit ? '' : 'not ');
  let message = `This will create a ${highlightType} project in ${highlightProject}, `;
  message += `packages will ${highlightPackageInstallation}, and a git repository will `;
  message += `${highlightGitInit}be initialized.`;

  const answer = await select({
    message: chalk.dim.yellow(`${message} Continue?`),
    choices: [
      { value: true, name: 'Yes' },
      { value: false, name: 'No' },
    ],
  });

  return answer;
}

export const prompts = {
  getProjectName,
  getProjectType,
  getInstallPackages,
  getPackageManager,
  getGitInit,
  getConfirmation,
};
