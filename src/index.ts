#!/usr/bin/env node
import { local } from '~/local.ts';
import { prompts } from '~/prompts.ts';
import { remote } from '~/remote.ts';
import { system } from '~/system.ts';

let errorPath = '';

try {
  system.sayHello();

  const [projectName, projectPath] = await prompts.getProjectName();
  errorPath = projectPath;

  const gitInfo = await local.gitInfo();
  const packageManagers = await local.packageManagers();
  const templateList = await remote.templateList();

  const projectType = await prompts.getProjectType(templateList);
  const installPackages = await prompts.getInstallPackages();
  const packageManager = await prompts.getPackageManager(
    packageManagers,
    installPackages,
  );
  const gitInit = await prompts.getGitInit(gitInfo);
  const confirm = await prompts.getConfirmation(
    projectName,
    projectType,
    installPackages,
    packageManager,
    gitInit,
  );

  if (!confirm) {
    system.sayGoodbye();
    process.exit(0);
  }

  process.on('SIGINT', () => {
    system.handleError(new Error('user interrupted'), errorPath);
  });

  await remote.fetchRepo(projectType, projectName);
  await system.cleanupTemplate(projectName, projectPath, gitInit, gitInfo);
  await system.installDependencies(
    projectName,
    installPackages,
    packageManager,
  );
  await system.initializeGitRepository(gitInit, projectPath);

  system.sayGoodbye(projectPath);
} catch (error) {
  system.handleError(error, errorPath);
}
