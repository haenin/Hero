/**
 * <pre>
 * TypeScript Name: notification
 * Description: Vue Router 설정
 *              - 알림 페이지 라우팅 설정
 *              - 알림 목록 및 상세 페이지 경로 관리
 *              - 알림 상세페이지 경로
 *
 * History
 * 2025/12/09 (혜원) 최초 작성
 * 2025/12/15 (혜원) 알림 설정 & 상세 페이지 라우트 추가
 * </pre>
 *
 * @author 혜원
 * @version 1.1
 */

import type { RouteRecordRaw } from 'vue-router';

// 알림 관련 라우트 정의
const notificationRoutes: RouteRecordRaw[] = [
  {
    path: '/notifications',
    name: 'Notification',
    // Lazy Loading: 알림 목록 페이지
    component: () => import('@/views/notification/Index.vue'),
    meta: {
      title: '알림'
    }
  },
  {
    path: '/notifications/:id',
    name: 'NotificationDetail',
    // Lazy Loading: 알림 상세 페이지
    component: () => import('@/views/notification/NotificationDetail.vue'),
    meta: {
      title: '알림 상세'
    }
  },
  {
    path: '/notifications/my-settings',
    name: 'NotificationMySettings',
    component: () => import('@/views/notification/NotificationMySettings.vue'),
    meta: {
      title: '알림 설정'
     }
  }
];

export default notificationRoutes;