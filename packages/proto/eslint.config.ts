import type { Linter } from 'eslint';

import { createConfig } from '../../eslint.base.config';

const config: Linter.Config[] = [
  ...createConfig({
    baseDirectory: import.meta.dirname,
    tsconfigPaths: ['./tsconfig.json'],
    ignores: ['gen/**', 'packages/proto/gen/**'],
  }),
  {
    files: ['gen/**', 'packages/proto/gen/**'],
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  },
];

export default config;
