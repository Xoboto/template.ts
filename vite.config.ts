import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'examples',
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      'template.ts': resolve(__dirname, 'dist/template.js'),
    },
  },
  server: {
    port: 8080,
    open: true,
  },
});
