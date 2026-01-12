<template>
  <div class="page-container">
    <!-- <div class="header-container">
      <h2 class="page-title">시스템 설정</h2>
    </div> -->

    <div class="content-wrapper">
      <!-- 탭 메뉴 -->
      <div class="tabs-container">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.id"
          @click="changeTab(tab)"
          :class="[
            'tab', 
            isActive(tab) ? 'active' : '',
            index === 0 ? 'tab-start' : '',
            index === tabs.length - 1 ? 'tab-end' : ''
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="main-card">
        <!-- 탭 컨텐츠 -->
        <div class="content-container">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';

const settingsStore = useSettingsStore();
const router = useRouter();
const route = useRoute();

const tabs = [
  { id: 'department', label: '부서 관리', path: '/settings/department' },
  { id: 'grade', label: '직급 관리', path: '/settings/grade' },
  { id: 'jobTitle', label: '직책 관리', path: '/settings/jobTitle' },
  { id: 'permission', label: '권한 관리', path: '/settings/permission' },
  { id: 'attendancePolicy', label: '근태 설정', path: '/settings/attendance-policy' },
  { id: 'payrollPolicy', label: '급여 설정', path: '/settings/payroll-policy' },
  { id: 'approval', label: '결재 관리', path: '/settings/approval' },
  { id: 'notification', label: '알림 관리', path: '/settings/notification' },

];

const changeTab = (tab: any) => {
  router.push(tab.path);
};

const isActive = (tab: any) => {
  return route.path.includes(tab.path);
};

onMounted(() => {
  // 설정 페이지 진입 시 필요한 데이터 로드
  // settingsStore.loadAllSettings();
});
</script>

<style scoped>
.page-container {
  /* background-color: #f8fafc; */
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172b;
}

.content-wrapper {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.main-card {
  background: white;
  border-radius: 14px;
  border-top-left-radius: 0;
  border: 1px solid #e2e8f0;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.tabs-container {
  display: flex;
  margin-bottom: -1px;
  z-index: 1;
}

.tab {
  padding: 10px 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  border-top: 1px solid #e2e8f0;
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;

  background-color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  white-space: nowrap;
}

.tab-start {
  border-top-left-radius: 14px;
}

.tab-end {
  border-top-right-radius: 14px;
}

.tab.active {
  color: #ffffff;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.content-container {
  padding: 0;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
