/*
  <pre>
  (File=>TypeScript) Name   : auth.ts
  Description : 인증 관련 라우트(로그인 페이지 등)를 정의하는 모듈입니다.
                - /login 경로 설정
                - hiddenLayout 메타 속성을 사용하여 특정 페이지에서 기본 레이아웃 숨김 처리

  History
  2025/12/11 - 이승건 최초 작성
  </pre>

  @author 이승건
  @version 1.0
*/
import type { RouteRecordRaw } from 'vue-router';

const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      title: '로그인',
      hiddenLayout: true,
    },
  },
  {
    path: '/find-password',
    name: 'FindPassword',
    component: () => import('@/views/auth/FindPassword.vue'),
    meta: {
      title: '비밀번호 찾기',
      hiddenLayout: true,
    },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/auth/ResetPassword.vue'),
    meta: {
      title: '비밀번호 재설정',
      hiddenLayout: true,
    },
  },
];

export default authRoutes;
