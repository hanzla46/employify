import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";

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
      "@": path.resolve(__dirname, "src"), // Ensures "@/..." works
    },
  },
  define: {
    'process.env': {},
  },
});
