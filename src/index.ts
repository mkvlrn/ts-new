#!/usr/bin/env node
import { prompts } from '~/prompts.ts';
import { system } from '~/system.ts';

let errorPath = '';

try {
  system.sayHello();

  const [projectName, projectPath] = await prompts.getProjectName();
  errorPath = projectPath;

  const gitInfo = await system.checkForGitInstallation();
  const availablePackageManagers = await system.getAvailablePackageManagers();
  const templateList = await system.getTemplateList();

  const projectType = await prompts.getProjectType(templateList);
  const packageManager = await prompts.getPackageManager(availablePackageManagers);
  const gitInit = await prompts.getGitInit();
  const confirm = await prompts.getConfirmation(projectName, projectType, packageManager, gitInit);

  if (!confirm) {
    system.sayGoodbye();
    process.exit(0);
  }

  process.on('SIGINT', () => {
    system.handleError(new Error('user interrupted'), errorPath);
  });

  await system.cloneTemplate(projectType, projectName);
  await system.cleanupTemplate(projectName, projectPath, gitInfo);
  await system.installDependencies(projectName, packageManager);
  await system.initializeGitRepository(gitInit, projectPath);

  system.sayGoodbye(projectPath);
} catch (error) {
  system.handleError(error, errorPath);
}
