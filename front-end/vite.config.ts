import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 터미널 통신을 위한 설정정
  define: {
    global: 'window',
  },
})
