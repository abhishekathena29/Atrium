import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { atriumAi } from './server/aiPlugin.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' prefix: load ANTHROPIC_API_KEY from .env.local without exposing it to client code
  // (only VITE_* vars reach the browser bundle).
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), atriumAi({ apiKey: env.ANTHROPIC_API_KEY || undefined })],
  }
})
