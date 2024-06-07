#!/usr/bin/env node
import { exec, spinner } from '~/injection.ts';
import { local } from '~/local.ts';
import { prompts } from '~/prompts.ts';
import { remote } from '~/remote.ts';
import { system } from '~/system.ts';

let errorPath = '';

try {
  system.sayHello();

  const [projectName, projectPath] = await prompts.getProjectName();
  errorPath = projectPath;

  const gitInfo = await local.gitInfo(spinner, exec);
  const packageManagers = await local.packageManagers(spinner, exec);
  const templateList = await remote.templateList(spinner);

  const projectType = await prompts.getProjectType(templateList);
  const installPackages = await prompts.getInstallPackages();
  const packageManager = await prompts.getPackageManager(packageManagers, installPackages);
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
    system.handleError(spinner, new Error('user interrupted'), errorPath);
  });

  await remote.fetchRepo(spinner, projectType, projectName);
  await system.cleanupTemplate(spinner, exec, projectName, projectPath, gitInit, gitInfo);
  await system.installDependencies(spinner, exec, projectName, installPackages, packageManager);
  await system.initializeGitRepository(spinner, exec, gitInit, projectPath);

  system.sayGoodbye(projectPath);
} catch (error) {
  system.handleError(spinner, error, errorPath);
}
