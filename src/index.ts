#!/usr/bin/env node
import {
  promptForConfirmation,
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

async function main(): Promise<void> {
  await showLogo();

  const projectName = await promptForProjectName();

  await checkForGitInstallation();
  const availablePackageManagers = await getAvailablePackageManagers();
  const templateList = await getTemplateList();

  const projectType = await promptForProjectType(templateList);
  const packageManager = await promptForPackageManager(availablePackageManagers);
  const confirm = await promptForConfirmation(projectName, projectType, packageManager);

  if (!confirm) {
    sayGoodbye();
    return;
  }

  await cloneTemplate(projectType, projectName);
  await cleanupTemplate(projectName);
  await installDependencies(projectName, packageManager);

  sayGoodbye(projectName);
}

await errorHandler(main);
