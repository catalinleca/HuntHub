import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Configure MUI to use styled-components instead of Emotion
      '@mui/styled-engine': '@mui/styled-engine-sc',
    },
  },
  assetsInclude: ['**/*.svg'], // Treat SVGs as assets
  build: {
    assetsInlineLimit: 0, // Don't inline any assets as data URIs
  },
  server: {
    port: 5174,
    allowedHosts: ['build.hedgehunt.local'],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
