import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: Object.fromEntries(
      ['/funcionarios', '/folhas-pagamento'].map((path) => [
        path,
        {
          target: 'http://localhost:8080',
          changeOrigin: true,
          // As rotas de funcionários são compartilhadas pela SPA e pela API.
          bypass(req) {
            if (
              req.method === 'GET' &&
              req.headers.accept?.includes('text/html')
            )
              return '/index.html'
          },
        },
      ]),
    ),
  },
})
