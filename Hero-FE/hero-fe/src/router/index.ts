/**
 * <pre>
 * TypeScript Name   : index.ts
 * Description : Vue Router 설정 파일
 *               - 메인 Home 라우트 등록
 *               - 근태, 전자결재, 급여, 평가, 인사 모듈 라우트 통합
 *
 * History
 * 2025/11/28 - 승건 최초 작성
 * 2025/12/09 - 동근 JSDoc 추가
 * 2025/12/12 - 동근 급여 관련 도메인 분리 & 라우터 전역 가드에 세션 갱신 로직 추가 및 인증 라우트(/auth/*) 제외 처리
 * 2025/12/17 - 민철 로그인 가드 풀기
 * 2025/12/23 - 민철 approval 모듈명 수정
 * </pre>
 *
 * @author 동근
 * @version 1.3
 */


import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import attendanceRoutes from './modules/attendance';
import vacationRoutes from './modules/vacation';
import approvalRoutes from './modules/approval';
import payrollMeRoutes from './modules/payrollMe';
import payrollAdminRoutes from "./modules/payrollAdmin";
import evaluationRoutes from './modules/evaluation';
import settingsRoutes from './modules/settings';
import { setupAuthGuard } from './guard'; // guard.ts에서 setupAuthGuard 함수 임포트
import personnelRoutes from './modules/personnel';
import authRoutes from './modules/auth';
import errorRoutes from "./modules/error";
import { useAuthStore } from '@/stores/auth';
import { useSessionStore } from '@/stores/session';

import notificationRoutes from './modules/notification';
import organizationRoutes from './modules/organization';


// 전체 애플리케이션 라우트 정의
const routes: RouteRecordRaw[] = [
  ...authRoutes,
  ...errorRoutes,
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {

    },
  },
  ...attendanceRoutes,
  ...vacationRoutes,
  ...approvalRoutes,
  ...payrollMeRoutes,
  ...payrollAdminRoutes,
  ...evaluationRoutes,
  ...personnelRoutes,
  ...notificationRoutes,
  ...organizationRoutes,
  ...settingsRoutes,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const sessionStore = useSessionStore();

  // 인증관련 페이지들(/auth/*)는 가드 대상에서 제외시킴
  const isAuthRoute = to.path.startsWith('/auth');

  if (authStore.isAuthenticated && !isAuthRoute) {
    sessionStore.refreshSession();
  }

  const roles = (to.meta?.roles as string[] | undefined) ?? [];
  if (roles.length > 0 && !authStore.hasAnyRole(roles)) {
    // 403 페이지로 보내기 
    return next({ name: 'Forbidden' });
  }

  next();
});

// 라우터 인스턴스에 인증 가드 설정
setupAuthGuard(router);

export default router;
