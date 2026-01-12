/**
 * (File => TypeScript) Name   : attendanceRoutes.ts
 * Description : 근태(Attendance) 도메인 라우트 설정
 *               - 개인 근태 이력 / 초과 근무 이력 / 근태 기록 수정 이력 / 근무제 변경 이력
 *               - 부서 근태 현황 페이지 라우팅
 *
 * History
 * 2025/12/10 - 이지윤 최초 작성
 *
 * @author 이지윤
 * @version 1.0
 */

import type { RouteRecordRaw } from 'vue-router';

/**
 * 근태(Attendance) 도메인 라우트 설정
 * - /attendance 하위에 여러 서브 페이지(children)를 둠
 */
const attendanceRoutes: RouteRecordRaw[] = [
  {
    path: '/attendance',
    name: 'Attendance',
    component: () => import('@/views/attendance/Index.vue'),
    meta: { title: '근태 관리' },

    // 기본 진입 시 개인 근태 이력 페이지로 리다이렉트
    redirect: '/attendance/attendance_record/personal',

    children: [
      /**
       * 1) 개인 근태 이력
       *   - /attendance/attendance_record/personal
       */
      {
        path: 'attendance_record/personal',
        name: 'AttendancePersonal',
        component: () =>
          import('@/views/attendance/attendance_record/Personal.vue'),
        meta: { title: '개인 근태 이력' },
      },

      /**
       * 2) 초과 근무 이력
       *   - /attendance/attendance_record/overtime
       */
      {
        path: 'attendance_record/overtime',
        name: 'AttendanceOvertime',
        component: () =>
          import('@/views/attendance/attendance_record/Overtime.vue'),
        meta: { title: '초과 근무 이력' },
      },

      /**
       * 3) 근태 기록 수정 이력
       *   - /attendance/attendance_record/correction
       */
      {
        path: 'attendance_record/correction',
        name: 'AttendanceCorrection',
        component: () =>
          import('@/views/attendance/attendance_record/Correction.vue'),
        meta: { title: '근태 기록 수정 이력' },
      },

      /**
       * 4) 근무제 변경 이력
       *   - /attendance/attendance_record/change_log
       *
       *  ✅ 컨벤션상 뷰 파일명은 PascalCase 권장:
       *     Change_log.vue → ChangeLog.vue 로 변경 권장
       */
      {
        path: 'attendance_record/changeLog',
        name: 'AttendanceChangeLog',
        component: () =>
          import('@/views/attendance/attendance_record/ChangeLog.vue'),
        meta: { title: '근무제 변경 이력' },
      },

      /**
       * 5) 부서 근태 현황
       *   - /attendance/department
       */
      {
        path: 'department',
        name: 'DepartmentAttendanceRecord',
        component: () =>
          import(
            '@/views/attendance/department_attendance_record/Index.vue'
          ),
        meta: { title: '부서 근태 현황' },
      },

      /**
       * 6) 근태 대시 보드
       *   - /attendance/attendanceDashBoard/index.vue
       */
      {
        path: 'dashboard',
        name: 'AttendanceDashboard',
        component: () =>
          import('@/views/attendance/attendanceDashBoard/index.vue'),
        meta: {title: '근태 대시 보드'},
      },
    ],
  },
];

export default attendanceRoutes;
