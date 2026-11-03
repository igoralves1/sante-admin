import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base relativa: funciona em qualquer nome de repositório no GitHub Pages
export default defineConfig({
  plugins: [vue()],
  base: './',
})
