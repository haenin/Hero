import type { RouteRecordRaw } from 'vue-router';

const evaluationRoutes: RouteRecordRaw[] = [
  {
    path: '/evaluation',
    name: 'evaluation',
    component: () => import('@/views/evaluation/Index.vue'),
    meta: {
      title: '평가 관리',
    },
    children: [],
  },
  {
    path: '/evaluation/template/list',
    name: 'evaluationtemplatelist',
    component: () => import('@/views/evaluation/EvaluationTemplateList.vue'),
    meta: {
      title: '평가 템플릿 목록',
    },
    children: [],
  },
  {
    path: '/evaluation/template/create',
    name: 'createevaluationtemplate',
    component: () => import('@/views/evaluation/CreateEvaluationTemplate.vue'),
    meta: {
      title: '평가 템플릿 생성',
    },
    children: [],
  },
  {
    path: '/evaluation/template/edit/:id',
    name: 'editevaluationtemplate',
    component: () => import('@/views/evaluation/EditEvaluationTemplate.vue'),
    meta: {
      title: '평가 템플릿 수정',
    },
    children: [],
  },
  {
    path: '/evaluation/template/:id',
    name: 'evaluationtemplatedetail',
    component: () => import('@/views/evaluation/EvaluationTemplateDetail.vue'),
    meta: {
      title: '평가 템플릿 세부 페이지',
    },
    children: [],
  }, 
  {
    path: '/evaluation/guide/list',
    name: 'evaluationguide',
    component: () => import('@/views/evaluation/EvaluationGuideList.vue'),
    meta: {
      title: '평가 가이드 목록',
    },
    children: [],
  },
  {
    path: '/evaluation/guide/create',
    name: 'createevaluationguide',
    component: () => import('@/views/evaluation/CreateEvaluationGuide.vue'),
    meta: {
      title: '평가 가이드 생성',
    },
    children: [],
  },
  {
    path: '/evaluation/guide/edit/:id',
    name: 'editevaluationguide',
    component: () => import('@/views/evaluation/EditEvaluationGuide.vue'),
    meta: {
      title: '평가 가이드 수정',
    },
    children: [],
  },
  {
    path: '/evaluation/guide/:id',
    name: 'evaluationguidedetail',
    component: () => import('@/views/evaluation/EvaluationGuideDetail.vue'),
    meta: {
      title: '평가 가이드 세부 페이지',
    },
    children: [],
  },
  {
    path: '/evaluation/list',
    name: 'evaluationlist',
    component: () => import('@/views/evaluation/EvaluationList.vue'),
    meta: {
      title: '평가 목록',
    },
    children: [],
  },
  {
    path: '/evaluation/list2',
    name: 'evaluationlist2',
    component: () => import('@/views/evaluation/EvaluationList2.vue'),
    meta: {
      title: '평가 목록2',
    },
    children: [],
  },
  {
    path: '/evaluation/create/:id',
    name: 'createevaluation',
    component: () => import('@/views/evaluation/CreateEvaluation.vue'),
    meta: {
      title: '평가 생성',
    },
    children: [],
  },
  {
    path: '/evaluation/evaluation/:id',
    name: 'evaluationdetail',
    component: () => import('@/views/evaluation/EvaluationDetail.vue'),
    meta: {
      title: '평가 세부 페이지',
    },
    children: [],
  },
  {
    path: '/evaluation/form/create/:id',
    name: 'createevaluationform',
    component: () => import('@/views/evaluation/CreateEvaluationForm.vue'),
    meta: {
      title: '평가서 생성',
    },
    children: [],
  },
  {
    path: '/evaluation/form/edit/:id',
    name: 'editevaluationform',
    component: () => import('@/views/evaluation/EditEvaluationForm.vue'),
    meta: {
      title: '평가서 수정',
    },
    children: [],
  },
  {
    path: '/evaluation/evaluate/:id',
    name: 'evaluateevaluationform',
    component: () => import('@/views/evaluation/EvaluateEvaluationForm.vue'),
    meta: {
      title: '평가서 평가',
    },
    children: [],
  },
  {
    path: '/evaluation/form/:id',
    name: 'evaluationformdetail',
    component: () => import('@/views/evaluation/EvaluationFormDetail.vue'),
    meta: {
      title: '평가 결과 확인 페이지',
    },
    children: [],
  },
  {
    path: '/evaluation/team/dashboard',
    name: 'teamdashboard',
    component: () => import('@/views/evaluation/TeamDashBoard.vue'),
    meta: {
      title: '팀 대시보드',
    },
    children: [],
  },
  {
    path: '/evaluation/team/dashboard2',
    name: 'teamdashboard2',
    component: () => import('@/views/evaluation/TeamDashBoard2.vue'),
    meta: {
      title: '팀 대시보드2',
    },
    children: [],
  },
  {
    path: '/evaluation/department/dashboard',
    name: 'departmentdashboard',
    component: () => import('@/views/evaluation/DepartmentDashBoard.vue'),
    meta: {
      title: '부서별 대시보드',
    },
    children: [],
  },
  {
    path: '/evaluation/department/dashboard2',
    name: 'departmentdashboard2',
    component: () => import('@/views/evaluation/DepartmentDashBoard2.vue'),
    meta: {
      title: '부서별 대시보드2',
    },
    children: [],
  },
  {
    path: '/evaluation/department/dashboard3',
    name: 'departmentdashboard3',
    component: () => import('@/views/evaluation/DepartmentDashBoard3.vue'),
    meta: {
      title: '부서별 대시보드3',
    },
    children: [],
  },
  {
    path: '/evaluation/department/dashboard4',
    name: 'departmentdashboard4',
    component: () => import('@/views/evaluation/DepartmentDashBoard4.vue'),
    meta: {
      title: '부서별 대시보드4',
    },
    children: [],
  },
  {
    path: '/evaluation/department/dashboard5',
    name: 'departmentdashboard5',
    component: () => import('@/views/evaluation/DepartmentDashBoard5.vue'),
    meta: {
      title: '부서별 대시보드5',
    },
    children: [],
  }
];

export default evaluationRoutes;
