import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/swagger.ts',
    'src/server.ts',
    'src/app.ts',
    'src/app-public.ts',
    'src/app-private.ts',
    'src/scripts/generate-salt.ts',
  ],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  sourcemap: true,
  clean: true,
  splitting: false,
  dts: false,
});
