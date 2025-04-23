import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/GEM-ARC_FrontEnd/', // <-- update this to your actual repo name, e.g., 'trust-pay'
  plugins: [
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 1000 // Optional: increases chunk size warning limit to suppress that message
  }
})
