import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5170,
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 后端服务器地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    // 确保所有HTML响应头为 UTF-8
    middlewares: (middlewares) => {
        middlewares.use((req, res, next) => {
            if (req.url.endsWith('.html')) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
            }
            next();
        });
        return middlewares;
    }
  },
  // 添加编码配置
  optimizeDeps: {
    include: ['antd']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
