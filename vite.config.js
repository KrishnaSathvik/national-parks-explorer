import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "./", // ✅ this helps when deploying or loading assets
  plugins: [react()],
})
