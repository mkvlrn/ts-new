import path from 'node:path';
import react from '@vitejs/plugin-react-swc';
import swc from 'unplugin-swc';
import { defineConfig as baseDefineConfig } from 'vite';
import { mergeConfig, defineConfig as testDefineConfig } from 'vitest/dist/config.js';

const baseConfig = baseDefineConfig({
  plugins: [react()],
  root: 'src',
  publicDir: '../public',
  resolve: { alias: { '#': path.resolve('.', './src') } },
  build: { outDir: '../dist', emptyOutDir: true },
  server: { port: 3000 },
});

const testConfig = testDefineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    alias: { '#': path.resolve('.', './src') },
    coverage: {
      reportsDirectory: 'coverage',
      reporter: ['lcov', 'html', 'text'],
      all: true,
      include: ['src/**/*'],
      exclude: ['**/*.{test,spec}.?(c|m)[jt]s?(x)', '**/*.d.ts'],
    },
    env: { NODE_ENV: 'test' },
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});

export default mergeConfig(baseConfig, testConfig);
