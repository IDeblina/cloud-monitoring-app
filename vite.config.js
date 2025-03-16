import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',  // Fixes "global is not defined" error
  },
  // Explicitly enable environment variables
  envPrefix: 'VITE_'
})
