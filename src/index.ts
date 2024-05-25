#!/usr/bin/env node
import { installDependencies } from '#/dependencies.js';
import { promptForPackageManager, promptForProjectName, promptForProjectType } from '#/prompts.js';
import { checkForGitInstallation, errorHandler, sayGoodbye, showLogo } from '#/system.js';
import { scaffoldTemplates } from '#/templates.js';

async function main() {
  await showLogo();
  await checkForGitInstallation();
  const projectName = await promptForProjectName();
  const projectType = await promptForProjectType();
  const packageManager = await promptForPackageManager();
  await scaffoldTemplates(projectType, projectName);
  await installDependencies(projectType, packageManager, projectName);
  sayGoodbye(projectName);
}

await errorHandler(main);
