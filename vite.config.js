import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'public/react',
    rollupOptions: {
      input: 'src/fe/main.jsx',
      output: { entryFileNames: 'app.js', assetFileNames: 'app.[ext]' },
    },
  },
});