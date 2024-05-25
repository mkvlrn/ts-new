import ora from 'ora';
import { exec, ExecOptions } from '#/system.js';
import { PackageManager, ProjectType } from '#/types.js';
import dependencies from './dependencies.json' assert { type: 'json' };

export async function installDependencies(
  projectType: ProjectType,
  packageManager: PackageManager,
  projectDirectory: string,
): Promise<void> {
  const developmentDeps = [...dependencies.common.dev, ...dependencies[projectType].dev];
  const productionDeps = dependencies[projectType].prod;
  const execOptions: ExecOptions = { stdio: 'ignore', cwd: projectDirectory };
  const spinner = ora(`Installing dependencies with ${packageManager}...`).start();

  await exec(`git init`, execOptions);
  await exec(`${packageManager} add ${developmentDeps.join(' ')} -D`, execOptions);
  if (productionDeps.length > 0) {
    await exec(`${packageManager} add ${productionDeps.join(' ')}`, execOptions);
  }
  await exec(`git add .`, execOptions);
  await exec(`git commit -m "chore: initial commit"`, execOptions);

  spinner.succeed('Dependencies installed.');
}
