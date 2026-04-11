import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // This helps with Fast Refresh
      fastRefresh: true,
      // Exclude context files from Fast Refresh to prevent warnings
      exclude: [/UserContext\.[jt]sx?$/, /OfflineContext\.[jt]sx?$/]
    })
  ],
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: false
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})