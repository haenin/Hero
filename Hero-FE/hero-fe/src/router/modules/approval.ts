/**
 * <pre>
 * Route Name      : approval_routes.ts
 * Description     : 결재 관련 라우터 설정
 *
 * 라우트 목록:
 * - /approval/inbox: 문서함 (탭별 조회)
 * - /approval/documents/:docId: 문서 상세 조회
 * - /approval/document-templates: 결재 서식 목록
 * - /approval/create/:formName: 결재 작성
 *
 * History
 *   2025/12/26 (민철) 최초 작성
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

import { RouteRecordRaw } from 'vue-router';

const approvalRoutes: RouteRecordRaw[] = [
  {
    path: '/approval/inbox',
    name: 'ApprovalInbox',
    component: () => import('@/views/approval/inbox/ApprovalInbox.vue'),
    meta: {
      requiresAuth: true,
      title: '결재 문서함',
    },
  },
  {
    path: '/approval/documents/:docId',
    name: 'ApprovalDetail',
    component: () => import('@/views/approval/detail/ApprovalDetail.vue'),
    meta: {
      requiresAuth: true,
      title: '결재 문서 조회',
    },
  },
  {
    path: '/approval/document-templates',
    name: 'ApprovalTemplates',
    component: () => import('@/views/approval/templates/ApprovalTemplates.vue'),
    meta: {
      requiresAuth: true,
      title: '결재 서식 목록',
    },
  },
  {
    path: '/approval/create/:formName',
    name: 'ApprovalCreate',
    component: () => import('@/views/approval/create/ApprovalCreate.vue'),
    meta: {
      requiresAuth: true,
      title: '결재 작성',
    },
    props: true,
  },
];

export default approvalRoutes;