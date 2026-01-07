import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/base/*.ts', 'src/classic/*.ts'],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  platform: 'neutral',
  target: 'es2022',
  bundle: true,
  splitting: false,
  sourcemap: true,
  dts: true,
  clean: true,
});
