import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const engineRoot = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  root: engineRoot,
  plugins: [tsconfigPaths({ projects: [path.join(engineRoot, 'tsconfig.json')] })],
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    server: {
      deps: {
        inline: [/^@kaboom\//],
      },
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: path.join(repoRoot, 'coverage', 'engine'),
    },
  },
});
