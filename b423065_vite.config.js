import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const entry = '/b423065_index.html'

const entryRewrite = () => ({
  name: 'entry-rewrite',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const pathname = (req.url || '/').split('?')[0]
      const isAsset =
        pathname.includes('.') ||
        pathname.startsWith('/@') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/node_modules')
      if (!isAsset) req.url = entry
      next()
    })
  }
})

export default defineConfig({
  plugins: [react(), entryRewrite()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:5000' }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: fileURLToPath(new URL('./b423065_index.html', import.meta.url))
    }
  }
})
