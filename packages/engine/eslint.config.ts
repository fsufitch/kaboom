import { createConfig } from '../../eslint.base.config';

export default createConfig({
  baseDirectory: import.meta.dirname,
  tsconfigPaths: ['./tsconfig.json'],
});
