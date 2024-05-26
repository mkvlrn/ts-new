import path from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  resolve: {
    alias: { '#': path.resolve('.', 'src') },
  },
  test: {
    include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      reportsDirectory: 'coverage',
      reporter: ['lcov', 'html', 'text'],
      all: true,
      include: ['src'],
      exclude: ['**/*.{test,spec}.?(c|m)[jt]s?(x)', '**/*.d.ts', 'src/index.ts?(x)'],
    },
    env: {
      NODE_ENV: 'test',
    },
    environment: 'node',
    passWithNoTests: true,
    setupFiles: ['vitest.setup.ts'],
  },
});
