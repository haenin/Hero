/**
 * Typescript Name : vacation.routes.ts
 * Description : 휴가 도메인 라우트 설정
 *               - 개인 휴가 이력 페이지
 *               - 부서 휴가 현황(캘린더) 페이지
 *
 * History
 * 2025/12/17 - 이지윤 최초 작성
 *
 * @author 이지윤
 * @version 1.0
 */

import type { RouteRecordRaw } from 'vue-router';

/**
 * 휴가(Vacation) 관련 라우트 정의
 *
 * - /vacation/history    : 개인 휴가 이력
 * - /vacation/department : 부서 휴가 현황
 */
const vacationRoutes: RouteRecordRaw[] = [
  {
    path: '/vacation',
    redirect: '/vacation/history',
    children: [
      /**
       * 개인 휴가 이력 페이지
       * - URL   : /vacation/history
       * - Name  : VacationHistory
       * - View  : @/views/vacation/VacationHistory.vue
       */
      {
        path: 'history',
        name: 'VacationHistory',
        component: () => import('@/views/vacation/VacationHistory.vue'),
        meta: { title: '휴가 이력' },
      },

      /**
       * 부서 휴가 현황 페이지
       * - URL   : /vacation/department
       * - Name  : DepartmentVacation
       * - View  : @/views/vacation/DepartmentVacation.vue
       */
      {
        path: 'department',
        name: 'DepartmentVacation',
        component: () => import('@/views/vacation/DepartmentVacation.vue'),
        meta: { title: '부서 휴가 현황' },
      },
    ],
  },
];

export default vacationRoutes;
