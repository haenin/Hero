<template>
  <div class="page-container">


    <div v-if="isChartLoading" class="loading-state">
      <p>조직도 정보를 불러오는 중입니다...</p>
    </div>
    <div v-else-if="chartError" class="error-state">
      <p>{{ chartError }}</p>
      <button @click="loadData" class="retry-btn">다시 시도</button>
    </div>

    <div v-else class="content-grid">
      <!-- Left Panel: Department List -->
      <div class="panel department-list-panel">
        <div class="panel-header">
          <h2>부서 목록</h2>
        </div>
        <div class="panel-body">
          <ul class="tree-root">
            <OrganizationTreeNode
              v-for="node in filteredOrganizationChart"
              :key="node.departmentId"
              :node="node"
              :is-for-list="true"
              :selected-department-id="selectedDepartment?.departmentId"
              @select-department="handleSelectDepartment"
            />
          </ul>
        </div>
      </div>

      <!-- Center Panel: Department Details -->
      <div class="panel department-detail-panel">
        <div v-if="!selectedDepartment" class="placeholder">
          <p>왼쪽에서 부서를 선택해주세요.</p>
        </div>
        <div v-else class="department-details">
          <div class="panel-header">
            <h2>{{ selectedDepartment.departmentName }} 정보</h2>
          </div>
          <div class="panel-body">
            <!-- 부서 기본 정보 (전화번호, 부서장) -->
            <div class="detail-section department-info-card" v-if="selectedDepartment.departmentPhone">
              <div class="info-row">
                <span class="info-label">부서 전화번호</span>
                <span class="info-value">{{ selectedDepartment.departmentPhone }}</span>
              </div>
            </div>

            <div class="detail-section" v-if="departmentManager">
              <h3 class="detail-title">부서장</h3>
              <div class="department-info-card">
                <div class="manager-profile" @click="handleSelectEmployee(departmentManager)">
                  <div class="manager-img-wrapper">
                    <img v-if="!centerListImageErrorIds.has(departmentManager.employeeId)" :src="getProfileImageUrl(departmentManager.imagePath)" @error="onCenterListImageError(departmentManager.employeeId)" class="manager-img" alt="profile" />
                    <div v-else class="profile-initial-small">{{ departmentManager.employeeName.charAt(0) }}</div>
                  </div>
                  <div class="manager-info">
                    <span class="manager-name">{{ departmentManager.employeeName }} {{ departmentManager.gradeName }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="selectedDepartment.children && selectedDepartment.children.length > 0" class="detail-section">
              <h3 class="detail-title">하위 부서</h3>
              <ul class="sub-department-list">
                <li v-for="child in selectedDepartment.children" :key="child.departmentId" @click="handleSelectDepartment(child)" class="sub-department-item">
                  <span>{{ child.departmentName }}</span>
                  <span class="member-count">({{ getRecursiveMemberCount(child) }}명)</span>
                </li>
              </ul>
            </div>
            <div v-if="selectedDepartment.employees && selectedDepartment.employees.length > 0" class="detail-section">
              <h3 class="detail-title">소속 인원</h3>
              <ul class="employee-list-center">
                <li v-for="emp in selectedDepartment.employees" :key="emp.employeeId" @click="handleSelectEmployee(emp)" :class="{ 'selected': selectedEmployee?.employeeId === emp.employeeId }" class="employee-item-center">
                  <div class="profile-img-wrapper">
                    <img v-if="!centerListImageErrorIds.has(emp.employeeId)" :src="getProfileImageUrl(emp.imagePath)" @error="onCenterListImageError(emp.employeeId)" class="profile-img" alt="profile" />
                    <div v-else class="profile-initial">{{ emp.employeeName.charAt(0) }}</div>
                  </div>
                  <div class="employee-info">
                    <span class="employee-name">{{ emp.employeeName }} {{ emp.gradeName }}</span>
                    <span class="employee-job">{{ emp.jobTitleName }}</span>
                  </div>
                </li>
              </ul>
            </div>
            <div v-if="(!selectedDepartment.children || selectedDepartment.children.length === 0) && (!selectedDepartment.employees || selectedDepartment.employees.length === 0)" class="no-content">
              <p>하위 부서 또는 소속 인원이 없습니다.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Employee Details -->
      <div class="panel employee-detail-panel">
        <div v-if="!selectedEmployee" class="placeholder">
          <p>사원을 선택하여 상세 정보를 확인하세요.</p>
        </div>
        <div v-else class="employee-details">
          <div class="panel-header">
            <h2>사원 정보</h2>
            <button @click="selectedEmployee = null" class="close-btn">×</button>
          </div>
          <div class="panel-body">
            <div class="employee-profile-card">
              <div class="profile-img-large-wrapper" :class="{ 'is-circle': !selectedEmployee.imagePath || selectedEmployeeImageError }">
                <img v-if="selectedEmployee.imagePath && !selectedEmployeeImageError" :src="getProfileImageUrl(selectedEmployee.imagePath)" @error="selectedEmployeeImageError = true" class="profile-img-large" alt="profile" />
                <div v-else class="profile-initial-large">{{ selectedEmployee.employeeName.charAt(0) }}</div>
              </div>
              <h3 class="employee-name-large">{{ selectedEmployee.employeeName }}</h3>
              <p class="employee-grade-large">{{ selectedEmployee.gradeName }}</p>
            </div>
            <div class="employee-info-grid">
              <div class="info-item"><span class="label">부서</span><span class="value">{{ selectedDepartment?.departmentName }}</span></div>
              <div class="info-item"><span class="label">직책</span><span class="value">{{ selectedEmployee.jobTitleName }}</span></div>
              <div class="info-item"><span class="label">사번</span><span class="value">{{ selectedEmployee.employeeNumber }}</span></div>
              <div class="info-item"><span class="label">재직 상태</span><span class="value">{{ selectedEmployee.status }}</span></div>
              <div class="info-item"><span class="label">입사일</span><span class="value">{{ selectedEmployee.hireDate }}</span></div>
              <div class="info-item"><span class="label">이메일</span><span class="value">{{ selectedEmployee.email }}</span></div>
              <div class="info-item"><span class="label">생년월일</span><span class="value">{{ selectedEmployee.birthDate || '-' }}</span></div>
              <div class="info-item"><span class="label">성별</span><span class="value">{{ formatGender(selectedEmployee.gender) }}</span></div>
            </div>
            
            <div class="action-buttons">
              <button class="action-btn" @click="openGradeHistory">직급 로그 보기</button>
              <button class="action-btn" @click="openDeptHistory">부서 로그 보기</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 직급 로그 모달 -->
    <div v-if="showGradeModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-content">
        <div class="modal-header">
          <h3>직급 변경 이력</h3>
          <button class="close-modal-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <div v-if="isHistoryLoading" class="loading-state" style="height: 200px;">
            <p>이력을 불러오는 중입니다...</p>
          </div>
          <div v-else-if="historyError" class="error-state" style="height: 200px;">
            <p>{{ historyError }}</p>
            <button @click="openGradeHistory" class="retry-btn">다시 시도</button>
          </div>
          <ul v-else-if="gradeHistoryList.length > 0" class="history-list">
            <li v-for="item in gradeHistoryList" :key="item.employeeHistoryId" class="history-item">
              <span class="history-date">{{ formatDate(item.changedAt) }}</span>
              <div class="history-detail">
                <span class="history-val">{{ item.gradeName }}</span>
                <span class="history-type">{{ item.changeType }}</span>
              </div>
            </li>
          </ul>
          <p v-else class="no-history">변경 이력이 없습니다.</p>
        </div>
      </div>
    </div>

    <!-- 부서 로그 모달 -->
    <div v-if="showDeptModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-content">
        <div class="modal-header">
          <h3>부서 변경 이력</h3>
          <button class="close-modal-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <div v-if="isHistoryLoading" class="loading-state" style="height: 200px;">
            <p>이력을 불러오는 중입니다...</p>
          </div>
          <div v-else-if="historyError" class="error-state" style="height: 200px;">
            <p>{{ historyError }}</p>
            <button @click="openDeptHistory" class="retry-btn">다시 시도</button>
          </div>
          <ul v-else-if="deptHistoryList.length > 0" class="history-list">
            <li v-for="item in deptHistoryList" :key="item.employeeHistoryId" class="history-item">
              <span class="history-date">{{ formatDate(item.changedAt) }}</span>
              <div class="history-detail">
                <span class="history-val">{{ item.departmentName }}</span>
                <span class="history-type">{{ item.changeType }}</span>
              </div>
            </li>
          </ul>
          <p v-else class="no-history">변경 이력이 없습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useOrganizationStore } from '@/stores/organization/organization.store';
import type { OrganizationNode, OrganizationEmployeeDetail } from '@/types/organization/organization.types';
import OrganizationTreeNode from './OrganizationTreeNode.vue';

const store = useOrganizationStore();
const { organizationChart, isChartLoading, isHistoryLoading, chartError, historyError, deptHistoryList, gradeHistoryList } = storeToRefs(store);

const selectedDepartment = ref<OrganizationNode | null>(null);
const selectedEmployee = ref<OrganizationEmployeeDetail | null>(null);
const centerListImageErrorIds = ref(new Set<number>());
const selectedEmployeeImageError = ref(false);
const showDeptModal = ref(false);
const showGradeModal = ref(false);

const filteredOrganizationChart = computed(() => {
  return organizationChart.value?.filter(node => node.departmentName !== '관리자 부서') || [];
});

const departmentManager = computed(() => {
  if (!selectedDepartment.value || !selectedDepartment.value.managerId) return null;
  return selectedDepartment.value.employees?.find(emp => emp.employeeId === selectedDepartment.value!.managerId);
});

const loadData = () => {
  store.loadOrganizationChart();
};

const handleSelectDepartment = (department: OrganizationNode) => {
  selectedDepartment.value = department;
  selectedEmployee.value = null; // 부서 변경 시 사원 선택 해제
  centerListImageErrorIds.value.clear();
};

const handleSelectEmployee = (employee: OrganizationEmployeeDetail) => {
  selectedEmployee.value = employee;
  selectedEmployeeImageError.value = false;
};

const getRecursiveMemberCount = (node: OrganizationNode): number => {
  let count = node.employees?.length || 0;
  if (node.children) {
    for (const child of node.children) {
      count += getRecursiveMemberCount(child);
    }
  }
  return count;
};

const getProfileImageUrl = (path?: string) => {
  return path || '';
};

const onCenterListImageError = (id: number) => {
  centerListImageErrorIds.value.add(id);
};

const openDeptHistory = async () => {
  if (!selectedEmployee.value) return;
  showDeptModal.value = true; // 모달을 먼저 열어서 로딩 상태를 보여줌
  await store.loadDepartmentHistory(selectedEmployee.value.employeeId);
};

const openGradeHistory = async () => {
  if (!selectedEmployee.value) return;
  showGradeModal.value = true; // 모달을 먼저 열어서 로딩 상태를 보여줌
  await store.loadGradeHistory(selectedEmployee.value.employeeId);
};

const closeModals = () => {
  showDeptModal.value = false;
  showGradeModal.value = false;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
};

const formatGender = (gender?: string) => {
  if (!gender) return '-';
  if (['M', 'Male', '남', '남자'].includes(gender)) return '남성';
  if (['F', 'Female', '여', '여자'].includes(gender)) return '여성';
  return gender;
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  /* background: #f8fafc; */
  overflow: hidden; 
}

.header {
  width: 100%;
  height: 60px;
  background: white;
  padding: 0 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172b;
}

.content-grid {
  display: grid;
  grid-template-columns: 300px 1fr 350px;
  grid-template-rows: minmax(0, 1fr);
  gap: 24px;
  flex: 1;
  padding: 24px;
  overflow: hidden;
}

.panel {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.panel-header h2 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.panel-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.department-list-panel .panel-body {
  padding: 12px;
}

.tree-root {
  padding: 0;
  margin: 0;
  list-style: none;
}

.loading-state,
.error-state,
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
  text-align: center;
}

.placeholder p {
  font-size: 14px;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background-color: #1c398e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.department-details, .employee-details {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* Center Panel */
.detail-section {
  margin-bottom: 24px;
}
.detail-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.department-info-card {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 13px;
  color: #64748b;
  width: 100px;
  flex-shrink: 0;
}

.info-value {
  font-size: 14px;
  color: #334155;
  font-weight: 500;
}

.manager-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.manager-profile:hover {
  background-color: #e2e8f0;
}

.manager-img-wrapper {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 8px;
}

.manager-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-initial-small {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
}

.manager-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.sub-department-list, .employee-list-center {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sub-department-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.sub-department-item:hover {
  background-color: #f8fafc;
}
.member-count {
  color: #94a3b8;
  font-size: 13px;
}
.employee-item-center {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.employee-item-center:hover, .employee-item-center.selected {
  background-color: #eff6ff;
}
.profile-img-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}
.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-initial {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
.employee-info {
  display: flex;
  flex-direction: column;
}
.employee-name {
  font-size: 14px;
  font-weight: 600;
}
.employee-job {
  font-size: 12px;
  color: #64748b;
}
.no-content {
  text-align: center;
  color: #94a3b8;
  padding: 40px 0;
}

/* Right Panel */
.employee-detail-panel .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #94a3b8;
}
.employee-profile-card {
  text-align: center;
  padding-bottom: 24px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 24px;
}
.profile-img-large-wrapper {
  width: 150px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 auto 12px;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.profile-img-large-wrapper.is-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
}
.profile-img-large {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-initial-large {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 32px;
}
.employee-name-large {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
.employee-grade-large {
  font-size: 14px;
  color: #64748b;
}
.employee-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-item .label {
  font-size: 12px;
  color: #94a3b8;
}
.info-item .value {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.action-buttons {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-btn {
  padding: 8px 16px;
  background-color: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 400px;
  max-height: 600px; /* 고정된 최대 높이 */
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.close-modal-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #94a3b8;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 20px;
  overflow-y: auto; /* 내용이 길어지면 스크롤 */
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.history-item:last-child {
  border-bottom: none;
}

.history-date {
  font-size: 13px;
  color: #64748b;
}

.history-detail {
  text-align: right;
}

.history-val {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.history-type {
  font-size: 12px;
  color: #3b82f6;
}

.no-history {
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  margin: 20px 0;
}
</style>
