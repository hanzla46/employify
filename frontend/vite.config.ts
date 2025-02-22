import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    proxy: {
      '/api': 'https://employify-backend.vercel.app',
    },
  },
  build: {
    outDir: 'dist',
  },
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    'process.env': {},
  },
});
