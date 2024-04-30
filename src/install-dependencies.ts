import ora from 'ora';
import { exec } from '#/system.js';
import { PackageManager, ProjectType } from '#/types.js';

const dependencies: Record<ProjectType, { deps: string[]; devDeps: string[] }> = {
  node: {
    devDeps: [
      '@commitlint/cli',
      '@commitlint/config-conventional',
      '@swc-node/register',
      '@swc/cli',
      '@swc/core',
      '@swc/types',
      '@trivago/prettier-plugin-sort-imports',
      '@types/node',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      '@vitest/coverage-v8',
      'eslint-config-airbnb-base',
      'eslint-config-airbnb-typescript',
      'eslint-config-prettier',
      'eslint-import-resolver-typescript',
      'eslint-plugin-import',
      'eslint-plugin-unicorn',
      'eslint-plugin-vitest@~0.4',
      'eslint@^8',
      'husky',
      'lint-staged',
      'prettier',
      'typescript',
      'unplugin-swc',
      'vitest',
    ],
    deps: [],
  },

  nest: {
    devDeps: [
      '@commitlint/cli',
      '@commitlint/config-conventional',
      '@nestjs/cli',
      '@nestjs/schematics',
      '@nestjs/testing',
      '@swc-node/register',
      '@swc/cli',
      '@swc/core',
      '@swc/types',
      '@trivago/prettier-plugin-sort-imports',
      '@types/express',
      '@types/node',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      '@vitest/coverage-v8',
      'eslint-config-airbnb-base',
      'eslint-config-airbnb-typescript',
      'eslint-config-prettier',
      'eslint-import-resolver-typescript',
      'eslint-plugin-import',
      'eslint-plugin-unicorn',
      'eslint-plugin-vitest@~0.4',
      'eslint@^8',
      'husky',
      'lint-staged',
      'prettier',
      'typescript',
      'unplugin-swc',
      'vitest',
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
      '@commitlint/cli',
      '@commitlint/config-conventional',
      '@testing-library/dom',
      '@testing-library/jest-dom',
      '@testing-library/react',
      '@trivago/prettier-plugin-sort-imports',
      '@types/node',
      '@types/react',
      '@types/react-dom',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      '@vitejs/plugin-react-swc',
      '@vitest/coverage-v8',
      'autoprefixer',
      'eslint-config-airbnb',
      'eslint-config-airbnb-typescript',
      'eslint-config-prettier',
      'eslint-import-resolver-typescript',
      'eslint-plugin-jsx-a11y',
      'eslint-plugin-import',
      'eslint-plugin-react',
      'eslint-plugin-react-hooks',
      'eslint-plugin-unicorn',
      'eslint-plugin-vitest@~0.4',
      'eslint@^8',
      'husky',
      'jsdom',
      'lint-staged',
      'postcss',
      'prettier',
      'tailwindcss',
      'ts-node',
      'typescript',
      'vite',
      'vitest',
    ],
    deps: ['react', 'react-dom'],
  },

  next: {
    devDeps: [
      '@commitlint/cli',
      '@commitlint/config-conventional',
      '@testing-library/dom',
      '@testing-library/jest-dom',
      '@testing-library/react',
      '@trivago/prettier-plugin-sort-imports',
      '@types/node',
      '@types/react',
      '@types/react-dom',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      '@vitest/coverage-v8',
      'eslint-config-airbnb',
      'eslint-config-airbnb-typescript',
      'eslint-config-next',
      'eslint-config-prettier',
      'eslint-import-resolver-typescript',
      'eslint-plugin-import',
      'eslint-plugin-react',
      'eslint-plugin-react-hooks',
      'eslint-plugin-unicorn',
      'eslint-plugin-vitest@~0.4',
      'eslint@^8',
      'husky',
      'jsdom',
      'lint-staged',
      'postcss',
      'prettier',
      'tailwindcss',
      'typescript',
      'vitest',
    ],
    deps: ['next', 'react', 'react-dom'],
  },
};

export async function installDependencies(
  projectType: ProjectType,
  packageManager: PackageManager,
  projectDirectory: string,
) {
  const spinner = ora(`Installing dependencies with ${packageManager}...`).start();

  await exec(`git init`, { stdio: 'ignore', cwd: projectDirectory });
  await exec(`${packageManager} add ${dependencies[projectType].devDeps.join(' ')}`, {
    stdio: 'ignore',
    cwd: projectDirectory,
  });
  if (dependencies[projectType].deps.length > 0) {
    await exec(`${packageManager} add ${dependencies[projectType].deps.join(' ')}`, {
      stdio: 'ignore',
      cwd: projectDirectory,
    });
  }
  await exec(`git add .`, { stdio: 'ignore', cwd: projectDirectory });
  await exec(`git commit -m "chore: initial commit"`, { stdio: 'ignore', cwd: projectDirectory });

  spinner.succeed('Dependencies installed.');
}
