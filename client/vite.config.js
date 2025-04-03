import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  css: {
    postcss: './postcss.config.js'
  },
  build: {
    outDir: '../build', // Adjust if needed
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