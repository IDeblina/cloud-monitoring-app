import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',  // Fixes "global is not defined" error
  },
  // Expose environment variables
  envPrefix: ['VITE_', 'AWS_', 'EC2_', 'RDS_', 'LAMBDA_']
})
