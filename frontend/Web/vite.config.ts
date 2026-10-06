import react from '@vitejs/plugin-react'
// @ts-ignore - Vite is provided by the project build tooling when dependencies are restored.
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
