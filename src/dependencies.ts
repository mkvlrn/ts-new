import ora from 'ora';
import { exec, ExecOptions } from '#/system.js';
import { PackageManager, ProjectType } from '#/types.js';

const commonDevelopmentDeps = [
  '@commitlint/cli',
  '@commitlint/config-conventional',
  '@eslint/js',
  '@next/eslint-plugin-next',
  '@trivago/prettier-plugin-sort-imports',
  '@types/node',
  '@vitest/coverage-v8',
  'eslint-config-prettier',
  'eslint-import-resolver-typescript',
  'eslint-plugin-import',
  'eslint-plugin-react-hooks',
  'eslint-plugin-react',
  'eslint-plugin-unicorn',
  'eslint-plugin-vitest',
  'eslint',
  'husky',
  'lint-staged',
  'prettier',
  'typescript-eslint',
  'typescript',
  'vitest',
];

const dependencies: Record<ProjectType, { deps: string[]; devDeps: string[] }> = {
  node: {
    devDeps: [
      '@swc-node/register',
      '@swc/cli',
      '@swc/core',
      '@swc/types',
      '@types/node',
      'unplugin-swc',
    ],
    deps: [],
  },

  nest: {
    devDeps: [
      '@nestjs/cli',
      '@nestjs/schematics',
      '@nestjs/testing',
      '@swc-node/register',
      '@swc/cli',
      '@swc/core',
      '@swc/types',
      '@types/express',
      'unplugin-swc',
    ],
    deps: [
      '@nestjs/common',
      '@nestjs/core',
      '@nestjs/platform-express',
      'reflect-metadata',
      'rxjs',
    ],
  },

  vite: {
    devDeps: [
      '@testing-library/dom',
      '@testing-library/jest-dom',
      '@testing-library/react',
      '@types/react',
      '@types/react-dom',
      '@vitejs/plugin-react-swc',
      'autoprefixer',
      'jsdom',
      'postcss',
      'tailwindcss',
      'vite',
    ],
    deps: ['react', 'react-dom'],
  },

  next: {
    devDeps: [
      '@testing-library/dom',
      '@testing-library/jest-dom',
      '@testing-library/react',
      '@types/react',
      '@types/react-dom',
      'jsdom',
      'postcss',
      'tailwindcss',
    ],
    deps: ['next', 'react', 'react-dom'],
  },
};

export async function installDependencies(
  projectType: ProjectType,
  packageManager: PackageManager,
  projectDirectory: string,
) {
  const developmentDeps = [...commonDevelopmentDeps, ...dependencies[projectType].devDeps];
  const spinner = ora(`Installing dependencies with ${packageManager}...`).start();
  const options: ExecOptions = { stdio: 'ignore', cwd: projectDirectory };

  await exec(`git init`, options);
  await exec(`${packageManager} add ${developmentDeps.join(' ')} -D`, {
    stdio: 'ignore',
    cwd: projectDirectory,
  });
  if (dependencies[projectType].deps.length > 0) {
    await exec(`${packageManager} add ${dependencies[projectType].deps.join(' ')}`, {
      stdio: 'ignore',
      cwd: projectDirectory,
    });
  }
  await exec(`git add .`, options);
  await exec(`git commit -m "chore: initial commit"`, options);

  spinner.succeed('Dependencies installed.');
}
