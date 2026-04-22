import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',  // Allows connections from other devices on your network
    port: 5173,        // Your dev server port (default is 5173)
    // Optional: Strict port (prevents Vite from trying other ports if 5173 is in use)
    strictPort: false,
  }
})