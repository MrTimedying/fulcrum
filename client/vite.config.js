import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: './', // Use relative paths to make assets work with file:// protocol
  plugins: [react()],
  build: {
    outDir: path.join(__dirname, '../build'), // Ensure correct output folder
    emptyOutDir: true, // Clean the output directory before each build
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
