import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  appType: 'mpa',
  root: path.resolve(__dirname, 'src'),
  publicDir: '../public',
  plugins: [
    {
      name: 'dev-404-fallback',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
            const cleanUrl = req.url?.split('?')[0] || '';
            const relativePath = cleanUrl === '/' ? 'index.html' : cleanUrl.replace(/^\//, '');
            const targetPath = path.resolve(__dirname, 'src', relativePath);
            const exists = fs.existsSync(targetPath) || fs.existsSync(`${targetPath}.html`);

            if (!exists && !cleanUrl.startsWith('/api') && !cleanUrl.includes('.')) {
              req.url = '/pages/404.html';
            }
          }
          next();
        });
      },
    },
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/index.html'),
        login: path.resolve(__dirname, 'src/pages/login.html'),
        register: path.resolve(__dirname, 'src/pages/register.html'),
        '404': path.resolve(__dirname, 'src/pages/404.html'),
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/features': path.resolve(__dirname, 'src/features'),
      '@/shared': path.resolve(__dirname, 'src/shared'),
      '@/app': path.resolve(__dirname, 'src/app'),
      '@/pages': path.resolve(__dirname, 'src/pages'),
      '@/styles': path.resolve(__dirname, 'src/styles'),
    },
  },
  css: {
    devSourcemap: true,
  },
});
