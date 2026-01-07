import type { Linter } from 'eslint';

import { createConfig } from './eslint.base.config';

const config: Linter.Config[] = createConfig({
  baseDirectory: import.meta.dirname,
  tsconfigPaths: ['./tsconfig.json', './packages/*/tsconfig.json'],
});

export default config;
