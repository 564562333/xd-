import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5171,
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // ��˷����ַ
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    // ȷ��������������ӦͷΪ UTF-8
    middlewares: (middlewares) => {
        middlewares.use((req, res, next) => {
            if (req.url.endsWith('.html')) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
            }
            next();
        });
        return middlewares;
    }
  }
})
