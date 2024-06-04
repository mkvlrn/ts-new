#!/usr/bin/env node
import { ProjectError } from '#/project-error.ts';
import { prompts } from '#/prompts.ts';
import { system } from '#/system.ts';

async function main(): Promise<void> {
  let errorPath = '';

  process.on('SIGINT', () => {
    throw new ProjectError('User interrupted the process', errorPath);
  });

  try {
    await system.sayHello();

    const [projectName, projectPath] = await prompts.getProjectName();
    errorPath = projectPath;

    process.on('SIGINT', () => {
      throw new ProjectError('User interrupted the process', errorPath);
    });

    const gitInfo = await system.checkForGitInstallation();
    const availablePackageManagers = await system.getAvailablePackageManagers();
    const templateList = await system.getTemplateList();

    const projectType = await prompts.getProjectType(templateList);
    const packageManager = await prompts.getPackageManager(availablePackageManagers);
    const gitInit = await prompts.getGitInit();
    const confirm = await prompts.getConfirmation(
      projectName,
      projectType,
      packageManager,
      gitInit,
    );
    if (!confirm) {
      system.sayGoodbye();
      return;
    }

    await system.cloneTemplate(projectType, projectName);
    await system.cleanupTemplate(projectName, projectPath, packageManager, gitInfo);
    await system.installDependencies(projectName, packageManager);
    await system.initializeGitRepository(gitInit);

    system.sayGoodbye(projectPath);
  } catch (error) {
    throw new ProjectError((error as Error).message, errorPath);
  }
}

await system.errorHandler(main);
