/**
 * <pre>
 * File Name: vite.config.ts
 * Description: Vite 빌드 도구 설정 파일
 *              Vue 3 프로젝트 개발 서버 및 빌드 설정
 *
 * 주요 설정:
 * - Vue 플러그인 및 DevTools
 * - 경로 alias 설정
 * - global polyfill (sockjs-client 호환성)
 * - WebSocket 프록시 설정
 *
 * History
 * 2025/12/09 (동근) 최초 작성
 * 2025/12/14 (혜원) global polyfill & WebSocket 프록시 설정 추가
 * </pre>
 *
 * @see https://vite.dev/config/
 */

import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  /**
   * Vite 플러그인 설정
   */
  plugins: [
    vue(),           // Vue 3 지원
    vueDevTools(),   // Vue DevTools 통합
  ],

  /**
   * 경로 alias 설정
   * '@' -> 'src' 디렉토리 매핑
   */
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },

  /**
   * 전역 변수 정의
   * global polyfill 추가 (sockjs-client 호환성)
   */
  define: {
    global: 'globalThis',
  },

  /**
   * 의존성 최적화 설정
   * esbuild에서 global 변수 polyfill 처리
   */
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  /**
   * 개발 서버 설정
   */
  server: {
    port: 8080,  // 배포 서버 포트

  }
})