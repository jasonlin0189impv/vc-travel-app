import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ⚠️ 重要：請將 'seoul-trip-2025' 改成您在 GitHub 上面建立的專案名稱 (Repository Name)
  // 如果您的網址是 https://xxx.github.io/my-trip/，這裡就是 '/my-trip/'
  base: '/vibe_coding-useful_tools/', 
})