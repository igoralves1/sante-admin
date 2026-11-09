import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// O front chama a API no mesmo endereço (/api), como numa implantação com load balancer
// (ex.: AWS ECS/Fargate). No `npm run dev`, o Vite repassa essas rotas ao backend local.
const API = process.env.API_PROXY || 'http://localhost:8000'
const repassar = { target: API, changeOrigin: true }

export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    proxy: { '/api': repassar, '/openapi.json': repassar, '/docs': repassar, '/redoc': repassar },
  },
  // o Swagger UI (~1,5 MB) só é baixado ao abrir a página Documentação da API
  build: { chunkSizeWarningLimit: 1600 },
})
