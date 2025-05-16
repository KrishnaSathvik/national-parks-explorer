// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // ✅ THIS FIXES RELATIVE PATHS
  plugins: [react()],
  define: {
    global: {}, // ✅ Fix for draft-js & fbjs
  },
});
