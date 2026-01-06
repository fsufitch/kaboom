import { createConfig } from '../../eslint.base.config';

export default [
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
