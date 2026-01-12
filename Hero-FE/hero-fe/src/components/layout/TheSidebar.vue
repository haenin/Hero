<!-- 
  <pre>
  Vue Name   : TheSidebar.vue
  Description : 좌측 공통 사이드바 네비게이션 컴포넌트
 
  History
  2025/11/28 - 승건 최초 작성
  2025/12/02 - 동근 Sidebar 레이아웃 및 스타일링 수정 & js->ts 변환
  2025/12/08 - 승민 Sidebar 레이아웃 디자인 최종 수정
  2025/12/10 - 민철 결재 도메인 라우터 추가
  2025/12/11 - 동근 급여 부분 추가 & JSDoc 추가
  2025/12/12 - 동근 급여 관리 부분 추가
  2025/12/14 - 동근 헤더 메인로고 클릭 시 대시보드 경로 일 때 사이드바 상태 동기화
  2025/12/15 - 승건 설정 부분 추가, 라우팅 부분 하나의 if문으로 변경
  2025/12/16 - 민철 사이드바 스타일 높이 수정
  2025/12/16 - 동근 사이드바 관련 버그 수정(새로고침 시 active 상태 유지 & 접고 펼칠 때 active 상태 유지)
  2025/12/27 - 동근 급여 관리 정책&설정 메뉴 제거(설정쪽으로 이동) / 급여 이력 삭제, 사원 급여 조회 네이밍 변경
  2025/01/04 - 동근 급여 관리자 권한에 따른 메뉴 노출 처리 추가
  </pre>
 
  @author 승건
  @version 2.1
 -->
<template>
  <div :class="['sidebar-container', { collapsed: isCollapsed }]">
    <div class="sidebar-wrapper">
      <div class="menu-list-top">

        <!-- 대시보드 -->
        <div class="menu-item"
             v-if="!isSystemAdmin"
             :class="{ 'active-parent': activeParent === 'dashboard' }"
             @click="handleParentClick('dashboard')">
          <div class="menu-content">
            <div class="icon-wrapper">
              <img class="dashboard-icon sidebar-icon" :src="getMenuIcon('dashboard')" />
            </div>
            <div class="menu-text">대시보드</div>
          </div>
        </div>

        <!-- 근태관리  -->
        <div
             v-if="!isSystemAdmin"
             class="menu-item has-dropdown"
             :class="{'active-parent': activeParent === 'attendance'}"
             @click="handleParentClick('attendance')"
        >
          <div class="menu-content">
            <div class="icon-wrapper">
              <img
                class="attendance-icon sidebar-icon"
                :src="getMenuIcon('attendance')"
              />
            </div>
            <div class="menu-text">근태관리</div>
          </div>
          <div class="dropdown-arrow" :class="{rotate:isAttendanceOpen}">
            <img src="/images/dropdownArrow.png" />
          </div>
        </div>

        <!-- 근태관리 하위 메뉴 -->
        <div v-if="!isSystemAdmin && isAttendanceOpen && !isCollapsed" class="sub-menu-list">
          <div
            class="sub-menu-item"
            :class="{ active: activeSubMenu === 'attendanceRecord' }"
            @click="handleSubMenuClick('attendanceRecord')"
          >
            <div class="sub-menu-text">근태 기록</div>
          </div>
          <div
            class="sub-menu-item"
            :class="{ active: activeSubMenu === 'attendanceDept' }"
            @click="handleSubMenuClick('attendanceDept')"
          >
            <div class="sub-menu-text">부서 근태 현황</div>
          </div>
          <div
            v-if="canSeeAttendanceDashboard"
            class="sub-menu-item"
            :class="{ active: activeSubMenu === 'attendanceDashboard' }"
            @click="handleSubMenuClick('attendanceDashboard')"
          >
            <div class="sub-menu-text">근태 대시 보드</div>
          </div>
        </div>

        <!-- 휴가/연차 -->
        <div v-if="!isSystemAdmin"
             class="menu-item has-dropdown"
             :class="{ 'active-parent': activeParent === 'vacation' }"
             @click="handleParentClick('vacation')">
          <div class="menu-content">
            <div class="icon-wrapper">
              <img class="vacation-icon sidebar-icon" :src="getMenuIcon('vacation')" />
            </div>
            <div class="menu-text">휴가/연차</div>
          </div>
          <div class="dropdown-arrow" :class="{ rotate: isVacationOpen }">
            <img class="vacation-dropdown-arrow" src="/images/dropdownArrow.png" />
          </div>
        </div>

        <!-- 휴가/연차 하위 메뉴 -->
        <div v-if="!isSystemAdmin && isVacationOpen && !isCollapsed" class="sub-menu-list">
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'vacationHistory' }"
              @click="handleSubMenuClick('vacationHistory')">
            <div class="sub-menu-text">휴가 이력</div>
          </div>
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'vacationDept' }"
              @click="handleSubMenuClick('vacationDept')">
            <div class="sub-menu-text">부서 휴가 현황</div>
          </div>
        </div>

        <!-- 전자결재 -->
        <div v-if="!isSystemAdmin"
             class="menu-item has-dropdown"
             :class="{ 'active-parent': activeParent === 'approval' }"
             @click="handleParentClick('approval')">
          <div class="menu-content">
            <div class="icon-wrapper">
              <img class="approval-icon sidebar-icon" :src="getMenuIcon('approval')" />
            </div>
            <div class="menu-text">전자결재</div>
          </div>
          <div class="dropdown-arrow" :class="{ rotate: isApprovalOpen }">
            <img src="/images/dropdownArrow.png" />
          </div>
        </div>

        <div v-if="!isSystemAdmin && isApprovalOpen && !isCollapsed" class="sub-menu-list">
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'document-templates' }"
               @click="handleSubMenuClick('document-templates')">
            <div class="sub-menu-text">결재문서서식</div>
          </div>
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'inbox' }"
               @click="handleSubMenuClick('inbox')">
            <div class="sub-menu-text">결재문서함</div>
          </div>
        </div>

        <!-- 성과평가 -->
        <div v-if="!isSystemAdmin"
             class="menu-item has-dropdown"
             :class="{ 'active-parent': activeParent === 'evaluation' }"
             @click="handleParentClick('evaluation')">
          <div class="menu-content">
            <div class="icon-wrapper">
              <img class="evaluation-icon sidebar-icon" :src="getMenuIcon('evaluation')" />
            </div>
            <div class="menu-text">성과평가</div>
          </div>
          <div class="dropdown-arrow" :class="{ rotate: isEvaluationOpen }">
            <img src="/images/dropdownArrow.png" />
          </div>
        </div>
        <div v-if="!isSystemAdmin && isEvaluationOpen && !isCollapsed" class="sub-menu-list">
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'template' }"
               @click="handleSubMenuClick('template')">
            <div class="sub-menu-text">평가템플릿</div>
          </div>
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'list' }"
               @click="handleSubMenuClick('list')">
            <div class="sub-menu-text">평가 목록</div>
          </div>
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'guide' }"
               @click="handleSubMenuClick('guide')">
            <div class="sub-menu-text">평가 가이드</div>
          </div>
          <div 
            v-if="canSeeTeamDashboard"
            class="sub-menu-item" :class="{ active: activeSubMenu === 'teamDash' }"
            @click="handleSubMenuClick('teamDash')"
          >
            <div class="sub-menu-text">팀 평가 대시보드</div>
          </div>
          <div 
            v-if="canSeeDeptDashboard"
            class="sub-menu-item" :class="{ active: activeSubMenu === 'deptDash' }"
            @click="handleSubMenuClick('deptDash')"
          >
            <div class="sub-menu-text">부서별 역량 대시보드</div>
          </div>
        </div>

        <!-- 급여 -->
        <div
          v-if="!isSystemAdmin"
          class="menu-item has-dropdown"
          :class="{ 'active-parent': activeParent === 'payroll' }"
          @click="handleParentClick('payroll')"
        >
          <div class="menu-content">
            <div class="icon-wrapper">
              <img
                class="payroll-icon sidebar-icon"
                :src="getMenuIcon('payroll')"
              />
            </div>
            <div class="menu-text">급여</div>
          </div>
          <div class="dropdown-arrow" :class="{ rotate: isPayrollOpen }">
            <img class="payroll-dropdown-arrow" src="/images/dropdownArrow.png" />
          </div>
        </div>

        <!-- 급여 하위 메뉴 -->
        <div v-if="!isSystemAdmin && isPayrollOpen && !isCollapsed" class="sub-menu-list">
          <div
            class="sub-menu-item"
            :class="{ active: activeSubMenu === 'myPayroll' }"
            @click="handleSubMenuClick('myPayroll')"
            >
            <div class="sub-menu-text">내 급여</div>
          </div>
            <div
            class="sub-menu-item"
            :class="{ active: activeSubMenu === 'myPayrollHistory' }"
            @click="handleSubMenuClick('myPayrollHistory')"
            >
            <div class="sub-menu-text">내 급여 이력</div>
          </div>
        </div>

        <!-- 급여 관리 (관리자) -->
          <div
          v-if="canSeePayrollAdmin"
          class="menu-item has-dropdown"
          :class="{ 'active-parent': activeParent === 'payrollAdmin' }"
          @click="handleParentClick('payrollAdmin')"
          >
          <div class="menu-content">
          <div class="icon-wrapper">
          <img class="sidebar-icon" :src="getMenuIcon('payrollAdmin')" />
        </div>
          <div class="menu-text">급여 관리</div>
        </div>

          <div class="dropdown-arrow" :class="{ rotate: isPayrollAdminOpen }">
          <img src="/images/dropdownArrow.png" />
        </div>
      </div>


        <div v-if="canSeePayrollAdmin && isPayrollAdminOpen && !isCollapsed" class="sub-menu-list">
                  <!-- 급여 관리 하위 메뉴 -->
        <div class="sub-menu-item" :class="{ active: activeSubMenu === 'payrollBatch' }"
        @click="handleSubMenuClick('payrollBatch')">
        <div class="sub-menu-text">급여 배치</div>
      </div>

        <div class="sub-menu-item" :class="{ active: activeSubMenu === 'payrollAdjust' }"
        @click="handleSubMenuClick('payrollAdjust')">
        <div class="sub-menu-text">급여 조정</div>
      </div>

        <div class="sub-menu-item"
        :class="{ active: activeSubMenu === 'payrollSearch' }"
        @click="handleSubMenuClick('payrollSearch')">
        <div class="sub-menu-text">급여 조회</div>
      </div>

        <div class="sub-menu-item" :class="{ active: activeSubMenu === 'payrollItems' }"
        @click="handleSubMenuClick('payrollItems')">
        <div class="sub-menu-text">급여 항목 관리</div>
      </div>

        <div class="sub-menu-item"
        :class="{ active: activeSubMenu === 'payrollReport' }"
        @click="handleSubMenuClick('payrollReport')">
        <div class="sub-menu-text">급여 보고서</div>
      </div>
    </div>

      <!-- 인사 관리 -->
      <div class="menu-item has-dropdown"
          v-if="canSeePersonnelParent"
          :class="{ 'active-parent': activeParent === 'personnel' }"
          @click="handleParentClick('personnel')">
        <div class="menu-content">
          <div class="icon-wrapper">
            <img class="personnel-icon sidebar-icon" :src="getMenuIcon('personnel')" />
          </div>
          <div class="menu-text">사원 관리</div>
        </div>
        <div class="dropdown-arrow" :class="{ rotate: isPersonnelOpen }">
          <img class="personnel-dropdown-arrow" src="/images/dropdownArrow.png" />
        </div>
      </div>

      <div v-if="isPersonnelOpen && !isCollapsed" class="sub-menu-list">
        <div v-if="canSeePersonnelGeneral" class="sub-menu-item" :class="{ active: activeSubMenu === 'employeeList' }"
            @click="handleSubMenuClick('employeeList')">
          <div class="sub-menu-text">사원</div>
        </div>
        <div v-if="canSeePersonnelGeneral" class="sub-menu-item" :class="{ active: activeSubMenu === 'turnover' }"
            @click="handleSubMenuClick('turnover')">
          <div class="sub-menu-text">이직률</div>
        </div>
        <div v-if="canSeePersonnelGeneral" class="sub-menu-item" :class="{ active: activeSubMenu === 'plan' }"
            @click="handleSubMenuClick('plan')">
          <div class="sub-menu-text">승진 계획 등록</div>
        </div>
        <div v-if="canSeePromotionRecommend" class="sub-menu-item" :class="{ active: activeSubMenu === 'recommend' }"
            @click="handleSubMenuClick('recommend')">
          <div class="sub-menu-text">승진 추천</div>
        </div>
        <div v-if="canSeePersonnelGeneral" class="sub-menu-item" :class="{ active: activeSubMenu === 'review' }"
            @click="handleSubMenuClick('review')">
          <div class="sub-menu-text">승진 심사</div>
        </div>
        <!-- <div v-if="canSeePersonnelGeneral" class="sub-menu-item" :class="{ active: activeSubMenu === 'special' }"
            @click="handleSubMenuClick('special')">
          <div class="sub-menu-text">특별 승진</div>
        </div> -->
      </div>

        <!-- 조직도 -->
        <div class="menu-item"
             v-if="canSeeOrganization"
             :class="{ 'active-parent': activeParent === 'organization' }"
             @click="handleParentClick('organization')">
          <div class="menu-content">
            <div class="icon-wrapper">
              <img class="organization-icon sidebar-icon" :src="getMenuIcon('organization')" />
            </div>
            <div class="menu-text">조직도</div>
          </div>
        </div>

      <!-- 설정 관리 -->
      <div class="menu-item"
          v-if="canSeeSettings"
          :class="{ 'active-parent': activeParent === 'settings' }"
          @click="handleParentClick('settings')">
        <div class="menu-content">
          <div class="icon-wrapper">
            <img class="settings-icon sidebar-icon" :src="getMenuIcon('settings')" />
          </div>
          <div class="menu-text">설정</div>
        </div>
      </div>


      </div>

      <!-- 아래 유지 -->
      <div class="menu-list-bottom">
        <!-- <div class="admin-link" v-if="!isCollapsed">
          <div class="icon-wrapper">
            <img class="config-icon sidebar-icon" src="/images/config.svg" />
          </div>
          <div class="menu-text">관리자 페이지</div>
        </div> -->

        <div class="divider" v-if="!isCollapsed"></div>

        <div class="collapse-item" @click="handleCollapse">
          <div class="collapse-content">
            <div class="icon-wrapper">
              <img 
                :src="isCollapsed ? '/images/spread.svg' : '/images/fold.svg'" 
                alt="collapse-icon"
              />
            </div>
            <div class="menu-text" v-if="!isCollapsed">접기</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const isSystemAdmin = computed(() => authStore.hasAnyRole(['ROLE_SYSTEM_ADMIN']));

const canSeeAttendanceDashboard = computed(() =>
  !isSystemAdmin.value && authStore.hasAnyRole([
    'ROLE_HR_EVALUATION',
    'ROLE_HR_ATTENDANCE',
    'ROLE_DEPT_MANAGER',
  ])
);

const canSeeTeamDashboard = computed(() => 
  !isSystemAdmin.value && authStore.hasAnyRole([
    'ROLE_DEPT_MANAGER',
  ])
);
const canSeeDeptDashboard = computed(() =>
  !isSystemAdmin.value && authStore.hasAnyRole([
    'ROLE_HR_EVALUATION',
  ])
)

// 사원 관리 일반 메뉴 (HR_TRANSFER)
const canSeePersonnelGeneral = computed(() =>
  !isSystemAdmin.value && authStore.hasAnyRole(['ROLE_HR_TRANSFER'])
);

// 승진 추천 (DEPT_MANAGER)
const canSeePromotionRecommend = computed(() =>
  !isSystemAdmin.value && authStore.hasAnyRole(['ROLE_DEPT_MANAGER'])
);

// 사원 관리 상위 메뉴 (하위 메뉴 중 하나라도 볼 수 있으면 노출)
const canSeePersonnelParent = computed(() =>
  canSeePersonnelGeneral.value || canSeePromotionRecommend.value
);

// 급여 관리자 담당 메뉴
const canSeePayrollAdmin = computed(() =>
  !isSystemAdmin.value && authStore.hasAnyRole([
    'ROLE_HR_MANAGER',
    'ROLE_HR_PAYROLL',
  ])
);

// 조직도 (EMPLOYEE)
const canSeeOrganization = computed(() =>
  !isSystemAdmin.value && authStore.hasAnyRole(['ROLE_EMPLOYEE'])
);

// 설정 (SYSTEM_ADMIN, HR_MANAGER)
const canSeeSettings = computed(() =>
  authStore.hasAnyRole(['ROLE_SYSTEM_ADMIN'])
);

const router = useRouter();
const route = useRoute();

// 활성화 된 상위 메뉴
const activeParent = ref<string>('dashboard');
// 활성화 된 서브 메뉴
const activeSubMenu = ref<string>('');

// 각 도메인의 서브 메뉴 오픈 여부
const isPersonnelOpen = ref<boolean>(false);
const isEvaluationOpen = ref<boolean>(false);
const isApprovalOpen = ref<boolean>(false);
const isAttendanceOpen = ref<boolean>(false);
const isVacationOpen = ref<boolean>(false);
const isPayrollOpen = ref<boolean>(false);
const isPayrollAdminOpen = ref<boolean>(false);


//Sidebar 접힘 여부
const isCollapsed = ref<boolean>(false);

//상위 메뉴별 아이콘 (활성/비활성)
const menuIcons = {
  dashboard: { default: '/images/dashboard.svg', active: '/images/dashboard-white.svg' },
  attendance: { default: '/images/attendance.svg', active: '/images/attendance-white.svg' },
  vacation: { default: '/images/vacation.svg', active: '/images/vacation-white.svg' },
  approval: { default: '/images/approval.svg', active: '/images/approval-white.svg' },
  evaluation: { default: '/images/evaluation.svg', active: '/images/evaluation-white.svg' },
  personnel: { default: '/images/personnel.svg', active: '/images/personnel-white.svg' },
  payroll: { default: '/images/payroll.svg', active: '/images/payroll-white.svg' },
  payrollAdmin: { default: '/images/payroll-admin.svg', active: '/images/payroll-admin-white.svg' },
  organization: { default: '/images/organization.svg', active: '/images/organization-white.svg' },
  settings: { default: '/images/config.svg', active: '/images/config-white.svg' },
};

/**
 * 상위 메뉴 활성 상태에 따라 적절한 아이콘 경로를 반환
 * @param {string} key - 상위 메뉴
 * @return {string} - 아이콘 경로
 */
const getMenuIcon = (key: string) => {
  return activeParent.value === key ? (menuIcons as any)[key].active : (menuIcons as any)[key].default;
};

/**
 * 상위 메뉴 클릭 시 호출되는 핸들러 
 * - 클릭한 메뉴를 활성화하고, 해당 메뉴의 서브메뉴 오픈 상태를 토글
 * - 대시보드인 경우 '/'로 라우팅
 * @param {string} key - 상위 메뉴 키
 */
const handleParentClick = (key: string) => {

  if (isCollapsed.value) {
    isCollapsed.value = false;
  }

  activeParent.value = key;
// 대시보드는 바로 이동
  if( key === 'dashboard'){
    router.push('/');
  } else if (key === 'settings') {
    router.push('/settings');
  } else if (key === 'organization') {
    router.push('/organization');
  }

  //클릭한 메뉴만 토글, 나머지는 자동으로 열린 메뉴 닫기
  isPersonnelOpen.value = key === 'personnel' ? !isPersonnelOpen.value : false;
  isEvaluationOpen.value = key === 'evaluation' ? !isEvaluationOpen.value : false;
  isApprovalOpen.value = key === 'approval' ? !isApprovalOpen.value : false;
  isAttendanceOpen.value = key === 'attendance' ? !isAttendanceOpen.value : false;
  isVacationOpen.value = key === 'vacation' ? !isVacationOpen.value : false;
  isPayrollOpen.value = key === 'payroll' ? !isPayrollOpen.value : false;
  isPayrollAdminOpen.value = key === 'payrollAdmin' ? !isPayrollAdminOpen.value : false;
};

/**
 * 서브 메뉴 클릭 시 호출되는 핸들러
 * @param {string} key - 서브 메뉴 키
 */
const handleSubMenuClick = (key: string) => {
  activeSubMenu.value = key;
  if (key === 'template') {
    router.push('/evaluation/template/list');
  } else if (key === 'guide') {
    router.push('/evaluation/guide/list');
  } else if (key === "list") {
    router.push('/evaluation/list')
  } else if (key == 'teamDash') {
    router.push('/evaluation/team/dashboard')
  } else if (key == 'deptDash') {
    router.push('/evaluation/department/dashboard')
  } else if (key === 'document-templates') {
    router.push('/approval/document-templates');
  } else if (key === 'inbox') {
    router.push('/approval/inbox');
  }


  // 근태 관리 하위 메뉴 라우팅
  if(key === 'attendanceRecord') {
    router.push('/attendance/attendance_record/personal');
  } else if (key === 'attendanceDept'){
    router.push('/attendance/department')
  } else if (key == 'attendanceDashboard') {
    router.push('/attendance/dashboard')
  }
  
  // 사원 관리 하위 메뉴 라우팅
  if (key === 'employeeList') {
    router.push('/personnel/list');
  } else if (key === 'turnover') {
    router.push('/personnel/retirement/turnover'); // 이직률
  } else if (key === 'plan') {
    router.push('/personnel/promotion/plan');
  } else if (key === 'recommend') {
    router.push('/personnel/promotion/recommend');
  } else if (key === 'review') {
    router.push('/personnel/promotion/review');
  } else if (key === 'special') {
    router.push('/personnel/promotion/special');
  }


  // 급여(사원)
  if (key === 'myPayroll') {
    router.push('/payroll');              // 내 급여
  }else if (key === 'myPayrollHistory') {
    router.push('/payroll/history');    // 내 급여 이력
  }
      
  // 급여관리(관리자)
  if (key === 'payrollBatch') {
    router.push('/payroll/admin/batch');           // 월별 급여 배치
  } else if (key === 'payrollAdjust') {
   router.push('/payroll/admin/adjust');          // 급여 조정
  } else if (key === 'payrollSearch') {
    router.push('/payroll/admin/search');          // 사원 급여 조회
  } else if (key === 'payrollItems') {
    router.push('/payroll/admin/items');           // 급여 항목 관리
  } else if (key === 'payrollReport') {
    router.push('/payroll/admin/report');          // 급여 보고서
  }

  // 휴가/연차
  else if (key === 'vacationHistory') {
    router.push('/vacation/history');
  } else if (key === 'vacationDept') {
    router.push('/vacation/department');
  }
};

// 사이드바 접기/펼치기 토글
const handleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;

  if (isCollapsed.value) {
   
    isPersonnelOpen.value = false;
    isEvaluationOpen.value = false;
    isApprovalOpen.value = false;
    isAttendanceOpen.value = false;
    isVacationOpen.value = false;
    isPayrollOpen.value = false;
    isPayrollAdminOpen.value = false;
  } else {
    syncActiveByRoute(route.path);
  }
};

/**
 * 모든 사이드바 서브 메뉴의 펼침(open) 상태를 초기화합니다.
 */
const closeAllSubMenus = () => {
  isPersonnelOpen.value = false;
  isEvaluationOpen.value = false;
  isApprovalOpen.value = false;
  isAttendanceOpen.value = false;
  isVacationOpen.value = false;
  isPayrollOpen.value = false;
  isPayrollAdminOpen.value = false;
};


/**
 * 현재 라우트 경로(path)를 기준으로 사이드바의 활성 상태(activeParent / activeSubMenu)와 서브 메뉴 펼침 상태를 동기화
 * 
 * 사용 목적 : 새로고침(F5) 시 사이드바 상태 복원
 * 
 * @param {string} path - 현재 라우트의 전체 경로
 */
const syncActiveByRoute = (path: string) => {
  // 기본 초기화
  activeParent.value = '';
  activeSubMenu.value = '';

  closeAllSubMenus();
  // 대시보드
  if (path === '/') {
    // SYSTEM_ADMIN이 홈으로 접근 시 설정 페이지로 리다이렉트
    if (isSystemAdmin.value) {
      router.replace('/settings');
      return;
    }
    activeParent.value = 'dashboard';
    return;
  }

  // 근태
  if (path.startsWith('/attendance')) {
    activeParent.value = 'attendance';
    if (!isCollapsed.value) isAttendanceOpen.value = true;
    if (path.includes('attendance_record')) activeSubMenu.value = 'attendanceRecord';
    else if (path.includes('/department')) activeSubMenu.value = 'attendanceDept';
    else if (path.includes('/dashboard') && canSeeAttendanceDashboard.value) {
      activeSubMenu.value = 'attendanceDashboard';
    }
    return;
  }

    if (path.startsWith('/vacation')) {
    activeParent.value = 'vacation';
    if (!isCollapsed.value) isVacationOpen.value = true;

    if (path.startsWith('/vacation/history')) {
      activeSubMenu.value = 'vacationHistory';
    } else if (path.startsWith('/vacation/department')) {
      activeSubMenu.value = 'vacationDept';
    }
    return;
  }

  // 전자결재
  if (path.startsWith('/approval')) {
    activeParent.value = 'approval';
    if (!isCollapsed.value) isApprovalOpen.value = true;
    if (path.startsWith('/approval/document-templates')) activeSubMenu.value = 'document-templates';
    else if (path.startsWith('/approval/inbox')) activeSubMenu.value = 'inbox';
    return;
  }

  // 성과평가
  if (path.startsWith('/evaluation')) {
  activeParent.value = 'evaluation';
  if (!isCollapsed.value) isEvaluationOpen.value = true;

  if (path.includes('/template')) {
    activeSubMenu.value = 'template';
  }
  else if (path.includes('/guide')) {
    activeSubMenu.value = 'guide';
  }
  else if (path.includes('/list')) {
    activeSubMenu.value = 'list';
  }
  else if (path.startsWith('/evaluation/team')) {
    activeSubMenu.value = 'teamDash';
  }
  else if (path.startsWith('/evaluation/department')) {
    activeSubMenu.value = 'deptDash';
  }

  return;
}

  // 급여(사원)
  if (path.startsWith('/payroll') && !path.startsWith('/payroll/admin')) {
    activeParent.value = 'payroll';
    if (!isCollapsed.value) isPayrollOpen.value = true;
    if (path === '/payroll') activeSubMenu.value = 'myPayroll';
    else if (path.startsWith('/payroll/history')) activeSubMenu.value = 'myPayrollHistory';
    return;
  }

  // 급여(관리자)
  if (path.startsWith('/payroll/admin')) {
    activeParent.value = 'payrollAdmin';
    if (!isCollapsed.value) isPayrollAdminOpen.value = true;
    if (path.startsWith('/payroll/admin/batch')) activeSubMenu.value = 'payrollBatch';
    else if (path.startsWith('/payroll/admin/adjust')) activeSubMenu.value = 'payrollAdjust';
    else if (path.startsWith('/payroll/admin/search')) activeSubMenu.value = 'payrollSearch';
    else if (path.startsWith('/payroll/admin/items')) activeSubMenu.value = 'payrollItems';
    else if (path.startsWith('/payroll/admin/report')) activeSubMenu.value = 'payrollReport';
    
    return;
  }

  // 인사
  if (path.startsWith('/personnel')) {
    activeParent.value = 'personnel';
    if (!isCollapsed.value) isPersonnelOpen.value = true;
    if (path.startsWith('/personnel/list') || path.startsWith('/personnel/register')) activeSubMenu.value = 'employeeList';
    else if (path.startsWith('/personnel/retirement/turnover')) activeSubMenu.value = 'turnover';
    else if (path.startsWith('/personnel/promotion/plan')) activeSubMenu.value = 'plan';
    else if (path.startsWith('/personnel/promotion/recommend')) activeSubMenu.value = 'recommend';
    else if (path.startsWith('/personnel/promotion/review')) activeSubMenu.value = 'review';
    else if (path.startsWith('/personnel/promotion/special')) activeSubMenu.value = 'special';
    return;
  }

  // 조직도
  if (path.startsWith('/organization')) {
    activeParent.value = 'organization';
  }

  // 설정
  if (path.startsWith('/settings')) {
    activeParent.value = 'settings';
    return;
  }
};

/**
 * 라우트 변경 시 사이드바 상태를 즉시 동기화 (모든 경우에 대해 사이드바 활성 상태가 항상 현재 화면과 일치하도록 보장)
 */
watch(
  () => route.path,
  (path) => {
    syncActiveByRoute(path);
  },
  { immediate: true }
);
</script>

<style scoped>
.sidebar-container {
  height: auto;
  max-width: 100%;
  width: 215px;
  background: white;
  transition: width 0.3s ease;
}

.sidebar-container.collapsed {
  width: 60px;
}

.sidebar-wrapper {
  height: 100%;
  padding: 20px;
  border-right: 2px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  overflow-y: auto;
  /* IE, Edge (구버전) */
  -ms-overflow-style: none;
  /* Firefox */
  scrollbar-width: none;
}

/* 크롬 등 다양한 브라우저 */
.sidebar-wrapper::-webkit-scrollbar {
    display: none;
}

.menu-list-top {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.menu-item {
  align-self: stretch;
  height: 40px;
  padding: 0 18px;
  border-radius: 11.25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.menu-item:not(.active-parent):not(.sub-menu-item):hover {
  background-color: #f0f4f8;
}

.menu-content {
  display: flex;
  align-items: center;
  gap: 13.5px;
  flex: 1;
  transition: opacity 0.3s ease;
}

.sidebar-container.collapsed .menu-text {
  display: none;
}

.sidebar-icon {
  width: 20px;
  height: 20px;
}

.icon-wrapper {
  width: 22.5px;
  height: 22.5px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.menu-text {
  color: #45556c;
  font-size: 13px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  line-height: 27px;
}

/* 하위 메뉴 */
.sub-menu-list {
  width: 100%;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-self: flex-end;
}

.sub-menu-item {
  height: 40px;
  margin-left: 10px;
  padding: 10px;
  border-radius: 11.25px;
  background: white;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.sub-menu-item:hover {
  background-color: #f0f4f8;
}

.sub-menu-text {
  color: #62748e;
  font-size: 12px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  line-height: 24px;
  padding-left: 20px;
}

.sub-menu-item.active {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.sub-menu-item.active .sub-menu-text {
  color: white;
  font-weight: 700;
}

.dropdown-arrow.rotate img {
  transform: rotate(180deg);
  transition: transform 0.25s ease;
}

.active-parent {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.active-parent .menu-text {
  color: white;
}

.menu-list-bottom {
  height: 148px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  align-self: stretch;
}

.admin-link {
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.divider {
  width: 100%;
  height: 2px;
  background-color: #e2e8f0;
}

.collapse-item {
  align-self: stretch;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.collapse-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.sidebar-container.collapsed .menu-item,
.sidebar-container.collapsed .sub-menu-item {
  justify-content: center; /* 텍스트 없이 아이콘만 가운데 정렬 */
  padding: 0;
}

.sidebar-container.collapsed .menu-content {
  gap: 0; /* 아이콘만 남기기 */
  justify-content: center;
}

.sidebar-container.collapsed .sub-menu-list {
  display: none; /* 하위 메뉴 숨김 */
}

.sidebar-container.collapsed .dropdown-arrow {
  display: none;
}
</style>