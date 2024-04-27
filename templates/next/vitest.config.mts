import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
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
      exclude: ['src/index.ts', '**/*.spec.ts', 'src/index.tsx', '**/*.spec.tsx', '**/*.d.ts'],
    },
    env: {
      NODE_ENV: 'test',
    },
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: ['vitest.setup.mts'],
  },
});
