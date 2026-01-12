<template>
  <div class="special-promotion-page">
    <div class="header-section">
      <h1 class="page-title">특별 승진</h1>
    </div>

    <div class="content-layout">
      <!-- Left Panel: Employee List -->
      <div class="list-panel">
        <div class="list-header">
          <div class="search-wrapper">
            <input
              type="text"
              class="form-input"
              v-model="searchKeyword"
              placeholder="사번 또는 이름으로 검색"
              @keyup.enter="handleSearch"
            />
            <button class="btn btn-search" @click="handleSearch" :disabled="isLoadingList">
              {{ isLoadingList ? '...' : '검색' }}
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="employee-table">
            <thead>
              <tr>
                <th>사번</th>
                <th>이름</th>
                <th>부서</th>
                <th>직급</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoadingList">
                <td colspan="4" class="loading-cell">
                  <div class="spinner"></div>
                  <span>사원 목록을 불러오는 중...</span>
                </td>
              </tr>
              <tr v-else-if="listError">
                <td colspan="4" class="error-cell">{{ listError }}</td>
              </tr>
              <tr v-else-if="employeeList.length === 0">
                <td colspan="4" class="no-data-cell">검색 결과가 없습니다.</td>
              </tr>
              <tr
                v-for="employee in employeeList"
                :key="employee.employeeId"
                @click="selectEmployee(employee)"
                :class="{ 'selected-row': targetEmployee?.employeeId === employee.employeeId }"
              >
                <td>{{ employee.employeeNumber }}</td>
                <td>{{ employee.employeeName }}</td>
                <td>{{ employee.departmentName }}</td>
                <td>{{ employee.gradeName }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <button
            class="page-button"
            :disabled="currentPage === 1 || isLoadingList"
            @click="goToPage(currentPage - 1)"
          >
            이전
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            class="page-button"
            :class="{ 'page-active': page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button
            class="page-button"
            :disabled="currentPage >= totalPages || isLoadingList"
            @click="goToPage(currentPage + 1)"
          >
            다음
          </button>
        </div>
      </div>

      <!-- Right Panel: Promotion Form -->
      <div class="form-panel">
        <div v-if="!targetEmployee" class="placeholder">
          <img src="/images/personnel.svg" alt="사원 선택" class="placeholder-img" />
          <p>왼쪽 목록에서 승진시킬 사원을 선택해주세요.</p>
        </div>
        <div v-else class="form-card">
          <div class="form-header">
            <h2>특별 승진 대상자 정보</h2>
          </div>
          <div class="form-body">
            <div class="employee-info-card">
              <div class="info-header">
                <div class="avatar">{{ targetEmployee.employeeName.charAt(0) }}</div>
                <div class="name-section">
                  <span class="name">{{ targetEmployee.employeeName }}</span>
                  <span class="emp-number">({{ targetEmployee.employeeNumber }})</span>
                </div>
              </div>
              <div class="info-body">
                <div class="info-row">
                  <span class="label">현재 부서</span>
                  <span class="value">{{ targetEmployee.departmentName }}</span>
                </div>
                <div class="info-row">
                  <span class="label">현재 직급</span>
                  <span class="value">{{ targetEmployee.gradeName }}</span>
                </div>
                <div class="info-row">
                  <span class="label">현재 직책</span>
                  <span class="value">{{ targetEmployee.jobTitleName }}</span>
                </div>
              </div>
            </div>

            <div class="divider"></div>
            <h3 class="section-title">승진 정보</h3>

            <div class="form-group">
              <label for="targetGrade" class="form-label">승진 직급</label>
              <select id="targetGrade" class="form-input" v-model="targetGradeId">
                <option disabled value="">
                  {{
                    isLoadingGrades
                      ? '직급 정보를 불러오는 중...'
                      : allGrades.length > 0 ? '직급을 선택하세요' : '직급 정보가 없습니다'
                  }}
                </option>
                <option v-if="allGrades.length > 0 && availableGrades.length === 0" disabled>
                  승진 가능한 상위 직급이 없습니다
                </option>
                <option v-for="grade in availableGrades" :key="grade.gradeId" :value="grade.gradeId">
                  {{ grade.grade }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">발령 구분</label>
              <div class="readonly-field">즉시 발령</div>
              <p class="help-text">* 특별 승진은 승인 즉시 효력이 발생합니다.</p>
            </div>

            <div class="form-group">
              <label for="promotionReason" class="form-label">승진 사유</label>
              <textarea
                id="promotionReason"
                class="form-textarea"
                v-model="reason"
                rows="5"
                placeholder="특별 승진 사유를 구체적으로 입력해주세요."
              ></textarea>
            </div>
          </div>
          <div class="form-footer">
            <button class="btn btn-cancel" @click="selectEmployee(null)">선택 취소</button>
            <button class="btn btn-submit" @click="submitPromotion" :disabled="!isSubmittable">
              승진 결재 상신
            </button>
          </div>
          <p v-if="submitError" class="error-message footer-error">{{ submitError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { fetchEmployees } from '@/api/personnel/personnel';
import { fetchPromotionOptions, promoteDirectly } from '@/api/personnel/promotion.api';
import type { EmployeeListResponse } from '@/types/personnel/personnel';
import type {
  PromotionGradeDTO,
  DirectPromotionRequestDTO,
} from '@/types/personnel/promotion.types';

const router = useRouter();

// List & Search state
const searchKeyword = ref('');
const isLoadingList = ref(false);
const listError = ref('');
const employeeList = ref<EmployeeListResponse[]>([]);
const targetEmployee = ref<EmployeeListResponse | null>(null);

// Form state
const targetGradeId = ref<number | ''>('');
const reason = ref('');
const submitError = ref('');
const isLoadingGrades = ref(false);

// Data
const allGrades = ref<PromotionGradeDTO[]>([]);

// Pagination state
const currentPage = ref(1);
const totalPages = ref(1);
const totalElements = ref(0);
const pageSize = 10;

// Computed properties
const availableGrades = computed(() => {
  if (!targetEmployee.value || !allGrades.value.length) return [];
  // 현재 직급보다 높은 직급만 선택 가능하도록 필터링합니다.
  const currentGrade = allGrades.value.find(g => g.grade === targetEmployee.value?.gradeName);
  if (!currentGrade || currentGrade.gradeId === undefined) {
    // 현재 직급을 찾지 못하면 모든 직급 표시 (오류 방지)
    return allGrades.value;
  }
  // gradeId가 높을수록 높은 직급이라고 가정합니다.
  return allGrades.value.filter(grade => grade.gradeId !== undefined && grade.gradeId > currentGrade.gradeId!);
});

const isSubmittable = computed(() => {
  return !!(targetEmployee.value && targetGradeId.value && reason.value.trim());
});

const loadGrades = async () => {
  isLoadingGrades.value = true;
  try {
    const response = await fetchPromotionOptions();
    // API 응답 타입 정의와 실제 데이터가 일치하지 않아 any로 캐스팅하여 처리
    const data = response.data.data as any;
    if (response.data.success && data.promotionGradeDTOList) {
      allGrades.value = data.promotionGradeDTOList;
    }
  } catch (error) {
    console.error('직급 정보 로딩 실패:', error);
  } finally {
    isLoadingGrades.value = false;
  }
};

onMounted(async () => {
  loadEmployees(1);
  loadGrades();
});

const loadEmployees = async (page: number) => {
  isLoadingList.value = true;
  listError.value = '';
  employeeList.value = [];

  try {
    const response = await fetchEmployees({
      employeeName: searchKeyword.value.trim(),
      size: pageSize,
      page: page,
    });
    if (response.data.success && response.data.data.content) {
      employeeList.value = response.data.data.content;
      totalPages.value = response.data.data.totalPages;
      currentPage.value = page;
      totalElements.value = response.data.data.totalElements;
      if (employeeList.value.length === 0) {
        listError.value = '표시할 사원이 없습니다.';
      }
    } else {
      listError.value = '사원 목록을 불러오는 데 실패했습니다.';
    }
  } catch (error) {
    console.error('사원 목록 로딩 에러:', error);
    listError.value = '서버 오류로 사원 목록을 가져올 수 없습니다.';
  } finally {
    isLoadingList.value = false;
  }
};

const handleSearch = () => {
  loadEmployees(1);
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return;
  loadEmployees(page);
};

const selectEmployee = (employee: EmployeeListResponse | null) => {
  if (targetEmployee.value?.employeeId === employee?.employeeId) {
    // 이미 선택된 사원을 다시 클릭하면 선택 해제
    targetEmployee.value = null;
  } else {
    targetEmployee.value = employee;
  }
  // 직급 정보가 로드되지 않았을 경우 재시도
  if (targetEmployee.value && allGrades.value.length === 0) {
    loadGrades();
  }
};

watch(targetEmployee, (newVal) => {
  if (newVal === null) {
    resetPromotionForm();
  }
});

const submitPromotion = async () => {
  if (!isSubmittable.value) return;
  submitError.value = '';

  if (!confirm(`${targetEmployee.value?.employeeName}님의 특별 승진 결재를 상신하시겠습니까?`)) {
    return;
  }

  const payload: DirectPromotionRequestDTO = {
    employeeId: targetEmployee.value!.employeeId,
    targetGradeId: targetGradeId.value as number,
    reason: reason.value,
  };

  try {
    const response = await promoteDirectly(payload);
    if (response.data.success) {
      alert('특별 승진 결재가 상신되었습니다.');
      // 성공 후 목록 새로고침 및 폼 초기화
      targetEmployee.value = null;
      loadEmployees(currentPage.value);
    } else {
      submitError.value = response.data.message || '승진 처리 중 오류가 발생했습니다.';
    }
  } catch (error: any) {
    console.error('특별 승진 처리 에러:', error);
    submitError.value = error.response?.data?.message || '서버와 통신 중 오류가 발생했습니다.';
  }
};

const resetPromotionForm = () => {
  targetGradeId.value = '';
  reason.value = '';
  submitError.value = '';
};

const resetForm = () => {
  searchKeyword.value = '';
  listError.value = '';
  targetEmployee.value = null;
  resetPromotionForm();
  loadEmployees(1);
};
</script>

<style scoped>
.special-promotion-page {
  width: 100%;
  height: 100%;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-section {
  background: white;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
  height: 100%;
  overflow: hidden;
}

.list-panel,
.form-panel {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.table-container {
  flex: 1;
  overflow-y: auto;
}

.employee-table {
  width: 100%;
  border-collapse: collapse;
}

.employee-table th,
.employee-table td {
  padding: 12px 16px;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.employee-table th {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  font-weight: 600;
  color: white;
}

.employee-table tbody tr {
  cursor: pointer;
  transition: background-color 0.2s;
}

.employee-table tbody tr:hover {
  background-color: #f1f5f9;
}

.employee-table .selected-row {
  background-color: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
}

.loading-cell, .error-cell, .no-data-cell {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

.loading-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  gap: 10px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.page-button {
  padding: 5px 12px;
  border: 1px solid #cad5e2;
  background: white;
  border-radius: 4px;
  font-size: 14px;
  color: #62748e;
  cursor: pointer;
}

.page-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-button.page-active {
  background: #155dfc;
  border-color: #155dfc;
  color: white;
}

.form-panel .placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
  color: #9ca3af;
}

.placeholder-img {
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
  opacity: 0.7;
}

.form-card {
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.form-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.form-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  overflow-y: auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.search-wrapper {
  display: flex;
  gap: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #fff;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.readonly-field {
  padding: 10px 12px;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
}

.help-text {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-search {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  padding: 0 16px;
  flex-shrink: 0;
}

.btn-search:hover {
  opacity: 0.9;
}

.btn-search:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.error-message {
  color: #ef4444;
  font-size: 13px;
  margin-top: 4px;
}

.employee-info-card {
  background-color: #f9fafb;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
}

.name-section {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.emp-number {
  font-size: 14px;
  color: #64748b;
}

.info-body {
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.info-row .label {
  color: #64748b;
}

.info-row .value {
  color: #1e293b;
  font-weight: 500;
}

.divider {
  height: 1px;
  background-color: #e2e8f0;
  margin: 8px 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.form-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: #f8fafc;
  flex-shrink: 0;
}

.btn-cancel {
  background-color: white;
  border: 1px solid #d1d5db;
  color: #374151;
}
.btn-cancel:hover {
  background-color: #f3f4f6;
}

.btn-submit {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
}
.btn-submit:hover {
  opacity: 0.9;
}
.btn-submit:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.footer-error {
  text-align: right;
  padding: 0 24px 16px;
  background-color: #f8fafc;
  margin: 0;
}
</style>