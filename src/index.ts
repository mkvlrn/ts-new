#!/usr/bin/env node
import { copyTemplates } from '#/copy-templates.js';
import { installDependencies } from '#/install-dependencies.js';
import { promptForPackageManager, promptForProjectName, promptForProjectType } from '#/prompts.js';
import { checkForGitInstallation, errorHandler, sayGoodbye, showLogo } from '#/system.js';

async function main() {
  await showLogo();
  await checkForGitInstallation();
  const projectName = await promptForProjectName();
  const projectType = await promptForProjectType();
  const packageManager = await promptForPackageManager();
  await copyTemplates(projectType, projectName);
  await installDependencies(projectType, packageManager, projectName);
  sayGoodbye(projectName);
}

await errorHandler(main);
