import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// GitHub Pages는 저장소 이름(/collision-sim/)이 붙은 하위 경로에 배포되므로 base를 그때만 바꾼다.
// 로컬 개발(npm run dev)과 교실 로컬망 배포(npm run build && npm run serve:lan)는
// GITHUB_PAGES 환경변수가 없으므로 항상 base='/' 그대로 유지된다(기존 동작 그대로).
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/collision-sim/' : '/',
})
