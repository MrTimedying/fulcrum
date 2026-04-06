import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: './', // Use relative paths to make assets work with file:// protocol
  plugins: [react()],
  build: {
    outDir: 'dist', // Output to 'dist' relative to apps/frontend
    emptyOutDir: true, // Clean the output directory before each build
    rollupOptions: {
      external: (id) => {
        // Mark Tauri APIs and web-worker as external when not in Tauri environment
        if (id.startsWith('@tauri-apps/') || id === 'web-worker') {
          return true;
        }
        return false;
      }
    }
  },
  optimizeDeps: {
    exclude: ['@tauri-apps/api', '@tauri-apps/plugin-dialog', '@tauri-apps/plugin-fs']
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 5173, // Align with Tauri's devUrl
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'web-worker': path.resolve(__dirname, './src/utils/empty-module.js') // Alias web-worker to an empty module with absolute path
    },
  },
});
