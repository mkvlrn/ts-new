import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '#': path.resolve('.', 'src') },
  },
  test: {
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
