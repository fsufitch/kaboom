import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const cliRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: cliRoot,
  plugins: [tsconfigPaths({ projects: [path.join(cliRoot, 'tsconfig.json')] })],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    reporters: ['verbose'],
  },
});
