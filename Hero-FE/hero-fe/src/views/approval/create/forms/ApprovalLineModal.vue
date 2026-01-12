<!--
 * <pre>
 * Vue Name        : ApprovalLineModal.vue
 * Description     : 결재자 지정 모달 컴포넌트 (완전 구현)
 *
 * 컴포넌트 연계
 *   - ApprovalCreateCommonForm.vue (부모)
 *
 * 주요 기능
 *   - 조직도 트리 표시
 *   - 직원 검색
 *   - 직원 선택/해제
 *   - 선택된 직원 확인
 *
 * History
 * 2025/12/24 (민철) 최초 작성
 * 2025/12/26 (민철) API 연동 완료
 * 2026/01/06 (민철) 주석 제거
 *
 * </pre>
 *
 * @module approval
 * @author 민철
 * @version 3.0
-->
<template>
  <article class="org-chart-container">

    <header class="header">
      <div class="header-title">
        <img src="/images/aaaapeople.svg" alt="" width="24" height="24" />
        <span>조직도</span>
      </div>
      <button aria-label="닫기" @click="handleClose">
        <img src="/images/deletebutton.svg" alt="닫기" width="20" height="20" />
      </button>
    </header>

    <section class="search-area">
      <label class="search-box">
        <input type="text" placeholder="이름, 부서, 직책으로 검색..." v-model="searchInput" @input="handleSearchInput" />
      </label>
    </section>

    <section v-if="selectedCount > 0" class="selected-area">
      <div class="selected-header">
        <span>선택된 직원 ({{ selectedCount }}명)</span>
        <button @click="orgStore.clearSelectedEmployees">전체 해제</button>
      </div>
      <div class="selected-list">
        <div v-for="emp in selectedEmployees" :key="emp.approverId" class="selected-item">
          <span>{{ emp.approverName }} ({{ emp.gradeName }})</span>
          <button @click="orgStore.removeSelectedEmployee(emp.approverId)">×</button>
        </div>
      </div>
    </section>

    <div v-if="isLoading" class="loading-area">
      <span>조직도를 불러오는 중...</span>
    </div>

    <section v-else-if="searchResults.length > 0" class="search-results">
      <div class="result-header">
        <span>검색 결과 ({{ searchResults.length }}명)</span>
      </div>
      <ul class="result-list">
        <li v-for="employee in searchResults" :key="employee.employeeId" @click="handleEmployeeClick(employee)"
          :class="['user-card', { 'selected': isEmployeeSelected(employee.employeeId) }]">
          <div :class="['avatar', getAvatarColor(employee.employeeName)]">
            {{ getAvatarInitial(employee.employeeName) }}
          </div>
          <div class="user-info">
            <span class="user-name">
              {{ employee.employeeName }} {{ formatJobTitle(employee.gradeName, employee.jobTitleName) }}
            </span>
            <span class="user-team">{{ employee.departmentName }}</span>
          </div>
          <div v-if="isEmployeeSelected(employee.employeeId)" class="check-icon">✓</div>
        </li>
      </ul>
    </section>

    <section v-else class="tree-content">
      <div v-if="organizationTree">
        <TreeNode :node="organizationTree" :depth="1" @employee-click="handleEmployeeClick" />
      </div>
      <div v-else class="empty-state">
        <span>조직도를 불러올 수 없습니다.</span>
      </div>
    </section>

    <footer class="footer">
      <button class="btn-cancel" @click="handleClose">취소</button>
      <button class="btn-confirm" @click="handleConfirm" :disabled="selectedCount === 0">
        확인 ({{ selectedCount }})
      </button>
    </footer>

  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useOrganizationStore } from '@/stores/approval/organization.store';
import { useOrganization } from '@/composables/approval/useOrganization';
import { OrganizationEmployeeDTO } from '@/types/approval/organization.types';
import TreeNode from './TreeNode.vue';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', employees: any[]): void;
}>();


const orgStore = useOrganizationStore();
const {
  organizationTree,
  searchResults,
  selectedEmployees,
  isLoading,
  selectedCount
} = storeToRefs(orgStore);

const {
  toggleEmployeeSelection,
  toggleDepartment,
  getAvatarColor,
  getAvatarInitial,
  debouncedSearch,
  formatJobTitle,
  isEmployeeSelected
} = useOrganization();


const searchInput = ref<string>('');


onMounted(async () => {
  try {
    await orgStore.fetchOrganizationTree();

    if (organizationTree.value?.departmentId === 0) {
      toggleDepartment(0);
    }
  } catch (error) {
    console.error('organization error:', error);
    alert('조직도를 불러올 수 없습니다.');
  }
});


const handleSearchInput = () => {
  const keyword = searchInput.value.trim();

  if (keyword) {
    debouncedSearch(keyword);
  } else {
    orgStore.clearSearchResults();
  }
};

const handleEmployeeClick = (employee: OrganizationEmployeeDTO) => {
  toggleEmployeeSelection(employee);
};


const handleClose = () => {
  orgStore.clearSelectedEmployees();
  orgStore.clearSearchResults();
  searchInput.value = '';
  emit('close');
};


const handleConfirm = () => {
  if (selectedCount.value === 0) {
    alert('결재자를 선택해주세요.');
    return;
  }

  emit('confirm', selectedEmployees.value);

  orgStore.clearSelectedEmployees();
  orgStore.clearSearchResults();
  searchInput.value = '';
};

</script>

<style scoped>
.org-chart-container {
  width: 100%;
  max-width: 600px;
  height: 80vh;
  background: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.search-area {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.search-box input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
}

.selected-area {
  padding: 12px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
}

.selected-header button {
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 16px;
  font-size: 13px;
}

.selected-item button {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  cursor: pointer;
}

.loading-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.search-results {
  flex: 1;
  overflow-y: auto;
}

.result-header {
  padding: 12px 20px;
  font-size: 13px;
  font-weight: 500;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.result-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tree-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.user-card:hover {
  background: #f3f4f6;
}

.user-card.selected {
  background: #eff6ff;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.bg-blue {
  background: #3b82f6;
}

.bg-purple {
  background: #8b5cf6;
}

.bg-green {
  background: #10b981;
}

.bg-orange {
  background: #f59e0b;
}

.bg-pink {
  background: #ec4899;
}

.bg-indigo {
  background: #6366f1;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.user-team {
  font-size: 12px;
  color: #6b7280;
}

.check-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 16px;
  font-weight: 600;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 14px;
}

.footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.btn-confirm {
  background: #3b82f6;
  border: none;
  color: white;
}

.btn-confirm:hover {
  background: #2563eb;
}

.btn-confirm:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
</style>