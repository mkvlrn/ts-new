import path from 'node:path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig as baseDefineConfig } from 'vite';
import { mergeConfig, defineConfig as testDefineConfig } from 'vitest/dist/config.js';

const baseConfig = baseDefineConfig({
  plugins: [react()],
  root: 'src',
  publicDir: '../public',
  resolve: {
    alias: { '#': path.resolve('.', 'src') },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
});

const testConfig = testDefineConfig({
  test: {
    alias: { '#': path.resolve('.', './src') },
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
    setupFiles: ['./vitest.setup.mts'],
  },
});

export default mergeConfig(baseConfig, testConfig);
