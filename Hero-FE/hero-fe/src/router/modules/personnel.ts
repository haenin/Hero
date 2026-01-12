/**
 * <pre>
 * TypeScript Name: personnel
 * Description: Vue Router 설정
 *              - 인사관리 모듈 관련 라우트 정의
 *
 * History
 * 2025/12/09 (승건) 최초 작성
 * 2025/12/15 (혜원) 마이페이지 라우터 추가
 * 2025/12/28 (혜원) 프로필 페이지를 독립 라우트로 분리 (사이드바 제거)
 * </pre>
 *
 * @author 승건
 * @version 2.0
 */

import type { RouteRecordRaw } from 'vue-router';

const personnelRoutes: RouteRecordRaw[] = [
  // 마이페이지 - 독립적인 풀 페이지 (사이드바 없음)
  {
    path: '/mypage/',
    name: 'MyPage',
    component: () => import('@/views/personnel/EmployeeProfile.vue'),
    meta: {
      title: '마이페이지',
      requiresAuth: true,  // 인증 필요
    },
  },
  {
    path: '/personnel',
    name: 'Personnel',
    component: () => import('@/views/personnel/Index.vue'),
    meta: {
      title: '인사관리',
    },
    redirect: '/personnel/list',
    children: [
      {
        path: 'list',
        name: 'EmployeeList',
        component: () => import('@/views/personnel/EmployeeList.vue'),
        meta: {
          title: '사원 정보',
        },
      },
      {
        path: 'register',
        name: 'EmployeeRegister',
        component: () => import('@/views/personnel/EmployeeRegister.vue'),
        meta: {
          title: '사원 등록',
        },
      },
      // 인사관리에서 보는 프로필 (사이드바 있음)
      {
        path: 'profile/:empNo',
        name: 'EmployeeProfile',
        component: () => import('@/views/personnel/EmployeeProfile.vue'),
        meta: {
          title: '사원 프로필',
        },
      },
      {
        path: 'retirement/turnover',
        name: 'Turnover',
        component: () => import('@/views/personnel/retirement/Turnover.vue'),
        meta: {
          title: '이직률',
        },
      },
    ],
  },
  {
    path: '/personnel/promotion',
    name: 'Promotion',
    component: () => import('@/views/personnel/promotion/Promotion.vue'),
    meta: {
      title: '승진',
    },
    redirect: '/personnel/promotion/plan',
    children: [
      {
        path: 'plan',
        name: 'promotionPlan',
        component: () => import('@/views/personnel/promotion/PromotionPlan.vue'),
        meta: {
          title: '승진 계획',
        }
      },
      {
        path: 'plan/:id',
        name: 'promotionPlanDetail',
        component: () => import('@/views/personnel/promotion/PromotionPlanDetail.vue'),
        meta: {
          title: '승진 계획 상세',
        }
      },
      {
        path: 'recommend',
        name: 'promotionRecommend',
        component: () => import('@/views/personnel/recommend/Recommend.vue'),
        meta: {
          title: '승진 추천',
        }
      },
      {
        path: 'review',
        name: 'promotionReview',
        component: () => import('@/views/personnel/review/Review.vue'),
        meta: {
          title: '승진 심사',
        }
      },
      {
        path: 'special',
        name: 'SpecialPromotion',
        component: () => import('@/views/personnel/special/SpecialPromotion.vue'),
        meta: {
          title: '특별 승진',
        }
      },
    ],
  }
];

export default personnelRoutes;