import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/'],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  platform: 'node',
  target: 'es2022',
  bundle: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
