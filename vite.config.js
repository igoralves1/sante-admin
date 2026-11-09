import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base relativa: funciona em qualquer nome de repositório no GitHub Pages
export default defineConfig({
  plugins: [vue()],
  base: './',
  // o Swagger UI (~1,5 MB) só é baixado ao abrir a página Documentação da API
  build: { chunkSizeWarningLimit: 1600 },
})
