import { access, copyFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import { exec, TS_NEW_DIRECTORY } from '#/system.js';
import { ProjectType } from '#/types.js';
import templateUpdates from './template-updates.json' assert { type: 'json' };

export async function scaffoldTemplates(
  projectType: ProjectType,
  projectDirectory: string,
): Promise<void> {
  const templatesDirectory = path.resolve(TS_NEW_DIRECTORY, '../templates');

  await copyFiles(path.join(templatesDirectory, 'common'), projectDirectory, projectType);
  await copyFiles(path.join(templatesDirectory, projectType), projectDirectory, projectType);
  await adjustTemplates(projectType, projectDirectory);
}

async function copyFiles(
  sourceDirectory: string,
  destinationDirectory: string,
  projectType: ProjectType,
): Promise<void> {
  const created = chalk.greenBright('CREATED');
  try {
    await access(destinationDirectory);
  } catch {
    // eslint-disable-next-line no-console
    console.info(`${created} directory: ${destinationDirectory}`);
  }
  await mkdir(destinationDirectory, { recursive: true });

  const entries = await readdir(sourceDirectory, { withFileTypes: true });

  for await (const entry of entries) {
    const sourcePath = path.join(sourceDirectory, entry.name);
    let destinationPath = path.join(destinationDirectory, entry.name);

    if (entry.isDirectory()) {
      await copyFiles(sourcePath, destinationPath, projectType);
    } else {
      if (entry.name === '.gitignore.example') {
        destinationPath = destinationPath.replace('.example', '');
      }

      if (
        (projectType === 'vite' && entry.name === 'vitest.config.ts') ||
        (projectType === 'next' && entry.name === '.swcrc')
      ) {
        continue;
      }

      try {
        await access(destinationPath);
      } catch {
        // eslint-disable-next-line no-console
        console.info(`${created} file: ${destinationPath}`);
      }
      await copyFile(sourcePath, destinationPath);
    }
  }
}

async function adjustTemplates(projectType: ProjectType, projectDirectory: string): Promise<void> {
  const commands: string[] = [
    `npm pkg set name=${projectDirectory}`,
    'npm pkg set scripts.prepare="husky"',
    ...templateUpdates[projectType],
  ];

  for await (const command of commands) {
    await exec(command, { stdio: 'ignore', cwd: projectDirectory });
  }
}
