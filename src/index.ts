#!/usr/bin/env node
import { installDependencies } from '#/dependencies.js';
import {
  promptForConfirmation,
  promptForPackageManager,
  promptForProjectName,
  promptForProjectType,
} from '#/prompts.js';
import { checkForGitInstallation, errorHandler, sayGoodbye, showLogo } from '#/system.js';
import { scaffoldTemplates } from '#/templates.js';

async function main(): Promise<void> {
  await showLogo();
  await checkForGitInstallation();
  const projectName = await promptForProjectName();
  const projectType = await promptForProjectType();
  const packageManager = await promptForPackageManager();
  const confirm = await promptForConfirmation(projectName, projectType, packageManager);
  if (!confirm) {
    sayGoodbye();
    return;
  }
  await scaffoldTemplates(projectType, projectName);
  await installDependencies(projectType, packageManager, projectName);
  sayGoodbye(projectName);
}

await errorHandler(main);
