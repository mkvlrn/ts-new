import { access, copyFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import { exec, TS_NEW_DIRECTORY } from '#/system.js';
import { ProjectType } from '#/types.js';

export async function scaffoldTemplates(
  projectType: ProjectType,
  projectDirectory: string,
): Promise<void> {
  const templatesDirectory = path.resolve(TS_NEW_DIRECTORY, '../templates');

  await copyDirectory(path.join(templatesDirectory, 'common'), projectDirectory, projectType);
  await copyDirectory(path.join(templatesDirectory, projectType), projectDirectory, projectType);
  await adjustPackageJson(projectType, projectDirectory);
}

async function copyDirectory(
  sourceDirectory: string,
  destinationDirectory: string,
  projectType: ProjectType,
): Promise<void> {
  const created = chalk.greenBright('CREATED');
  try {
    await access(destinationDirectory);
  } catch {
    console.info(`${created} directory: ${destinationDirectory}`);
  }
  await mkdir(destinationDirectory, { recursive: true });

  const entries = await readdir(sourceDirectory, { withFileTypes: true });

  for await (const entry of entries) {
    const sourcePath = path.join(sourceDirectory, entry.name);
    let destinationPath = path.join(destinationDirectory, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, destinationPath, projectType);
    } else {
      if (entry.name === '.gitignore.example') {
        destinationPath = destinationPath.replace('.example', '');
      }

      if (
        (projectType === 'vite' && entry.name === 'vitest.config.mts') ||
        (projectType === 'next' && entry.name === '.swcrc')
      ) {
        continue;
      }

      try {
        await access(destinationPath);
      } catch {
        console.info(`${created} file: ${destinationPath}`);
      }
      await copyFile(sourcePath, destinationPath);
    }
  }
}

async function adjustPackageJson(
  projectType: ProjectType,
  projectDirectory: string,
): Promise<void> {
  const commands: string[] = [
    `npm pkg set name=${projectDirectory}`,
    'npm pkg set scripts.prepare="husky"',
  ];
  switch (projectType) {
    case 'node': {
      commands.push(
        'npm pkg set scripts.dev="node -r @swc-node/register --watch src/index.ts"',
        'npm pkg set scripts.build="rm -rf dist && swc src -d dist --ignore **/*.spec.ts --strip-leading-paths"',
        'npm pkg set type="module"',
      );
      break;
    }
    case 'nest': {
      commands.push(
        'npm pkg set scripts.dev="node -r @swc-node/register --watch src/main.ts"',
        'npm pkg set scripts.build="rm -rf dist && nest build"',
        'npm pkg set scripts.start="node dist/main"',
      );
      break;
    }
    case 'vite': {
      commands.push(
        'npm pkg set scripts.dev="vite"',
        'npm pkg set scripts.build="vite build"',
        'npm pkg set scripts.start="vite preview"',
      );
      break;
    }
    case 'next': {
      commands.push(
        'npm pkg set scripts.dev="next dev"',
        'npm pkg set scripts.build="next build"',
        'npm pkg set scripts.start="next start"',
      );
      break;
    }
    default: {
      break;
    }
  }

  for await (const command of commands) {
    await exec(command, { stdio: 'ignore', cwd: projectDirectory });
  }
}
