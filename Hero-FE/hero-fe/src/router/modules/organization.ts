import type { RouteRecordRaw } from 'vue-router';

const organizationRoutes: RouteRecordRaw[] = [
  {
    path: '/organization',
    name: 'Organization',
    component: () => import('@/views/organization/Index.vue'),
    meta: {
      title: '조직도',
    },
  },
];

export default organizationRoutes;
