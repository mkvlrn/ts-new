import path from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  resolve: {
    alias: { '#': path.resolve('.', 'src') },
  },
  test: {
    include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
    coverage: {
      reportsDirectory: 'coverage',
      reporter: ['lcov', 'html', 'text'],
      all: true,
      include: ['src/**/*'],
      exclude: ['src/index.ts', '**/*.spec.ts', '**/*.d.ts'],
    },
    env: {
      NODE_ENV: 'test',
    },
    environment: 'node',
    passWithNoTests: true,
    setupFiles: ['vitest.setup.mts'],
  },
});
