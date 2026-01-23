import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@mui/styled-engine': '@mui/styled-engine-sc',
    },
    dedupe: ['react', 'react-dom', '@mui/material', 'styled-components'],
  },
  server: {
    port: 5175,
    host: true,
    allowedHosts: ['.ngrok-free.dev', '.loca.lt', '.trycloudflare.com', 'play.hedgehunt.local'],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
