import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {port:"5173",
    allowedHosts: [
      '750c30675b93.ngrok-free.app'
    ]
  }
})
