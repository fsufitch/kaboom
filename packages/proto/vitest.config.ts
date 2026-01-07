import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const protoRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: protoRoot,
  plugins: [tsconfigPaths({ projects: [path.join(protoRoot, 'tsconfig.json')] })],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
  },
});
