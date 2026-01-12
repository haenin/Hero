/**
 * <pre>
 * TypeScript Name   : payrollMe.ts
 * Description : 급여(Payroll) 도메인의 라우트 설정 파일
 * 
 * - /payroll : 내 급여
 * - /payroll/history : 내 급여 이력
 *
 * History
 * 2025/12/09 - 동근 최초 작성 (vue-router 라우트 구성 [내 급여, 내 급여 이력])
 * </pre>
 *
 * @module payrollMe-routes
 * @author 동근
 * @version 1.0
 */
import type { RouteRecordRaw } from 'vue-router';


/**
 * 급여 도메인 라우트 설정
 * @module payroll
 * @see /views/payroll/me/Index.vue  급여 메인 화면(내 급여 페이지)
 * @see /views/payroll/me/History.vue 내 급여 이력 화면
 */
const payrollRoutes: RouteRecordRaw[] = [
  // 내 급여 페이지 라우트
  {
    path: '/payroll',
    name: 'PayrollMain',
    component: () => import('@/views/payroll/me/Index.vue'),
    meta: {
      title: '급여 관리',
    },
  },

  //  내 급여 이력 페이지 라우트
  {
    path: '/payroll/history',
    name: 'PayrollHistory',
    component: () => import('@/views/payroll/me/History.vue'),
    meta: {
      title: '급여 이력',
    },
  },
];

export default payrollRoutes;
