import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'node_modules/formiojs/dist/formio.full.min.js', dest: '.' },
        { src: 'node_modules/formiojs/dist/formio.full.min.css', dest: '.' },
      ],
    }),
  ],
  server: {
    port: 3000,
  },
})
