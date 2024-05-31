#!/usr/bin/env node
import {
  promptForConfirmation,
  promptForGitInit,
  promptForPackageManager,
  promptForProjectName,
  promptForProjectType,
} from '#/prompts.js';
import {
  checkForGitInstallation,
  cleanupTemplate,
  cloneTemplate,
  errorHandler,
  getAvailablePackageManagers,
  getTemplateList,
  installDependencies,
  sayGoodbye,
  showLogo,
} from '#/system.js';
import { ProjectError } from '#/types.js';

async function main(): Promise<void> {
  let projectName = '';

  try {
    await showLogo();

    projectName = await promptForProjectName();

    await checkForGitInstallation();
    const availablePackageManagers = await getAvailablePackageManagers();
    const templateList = await getTemplateList();

    const projectType = await promptForProjectType(templateList);
    const packageManager = await promptForPackageManager(availablePackageManagers);
    const gitInit = await promptForGitInit();
    const confirm = await promptForConfirmation(projectName, projectType, packageManager, gitInit);

    if (!confirm) {
      sayGoodbye();
      return;
    }

    await cloneTemplate(projectType, projectName);
    await cleanupTemplate(projectName, packageManager, gitInit);
    await installDependencies(projectName, packageManager, gitInit);

    sayGoodbye(projectName);
  } catch (error) {
    throw new ProjectError((error as Error).message, projectName);
  }
}

await errorHandler(main);
