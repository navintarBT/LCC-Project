import { defineConfig } from 'vite'
import envCompatible from 'vite-plugin-env-compatible'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  // envPrefix: "REACT_APP_",
  plugins: [react(),envCompatible()],
  base: "/",
  build: {
    chunkSizeWarningLimit: 4000,
  },
  define: {
    'process.env': {
      VITE_SERVER_URL: 'http://localhost:9000',
    }
  }
})
