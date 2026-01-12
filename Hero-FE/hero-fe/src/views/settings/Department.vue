<template>
  <div class="page-content">
    <div class="page-header">
      <button @click="saveDepartments" class="btn-save">
        변경사항 저장
      </button>
    </div>

    <div v-if="settingsStore.isLoading" class="loading-text">
      로딩 중...
    </div>

    <div v-else class="tree-container">
      <div class="tree-actions">
        <button @click="addRootDepartment" class="btn-add-root">+ 최상위 부서 추가</button>
      </div>

      <ul v-if="localDepartments && localDepartments.length > 0" class="tree-root">
        <DepartmentTreeItem 
          v-for="(dept, index) in localDepartments" 
          :key="dept.departmentId" 
          :department="dept" 
          @add="handleAddDepartment"
          @edit="handleEditDepartment"
          @remove="handleRemoveDepartment(index)"
        />
      </ul>
      <div v-else class="no-data">
        등록된 부서 정보가 없습니다.
      </div>
    </div>

    <!-- 부서 수정 모달 -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>부서 정보 수정</h3>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>부서명</label>
            <input v-model="editingDeptData.departmentName" type="text" class="form-input" placeholder="부서명 입력" />
          </div>
          <div class="form-group">
            <label>전화번호</label>
            <input v-model="editingDeptData.departmentPhone" type="text" class="form-input" placeholder="전화번호 입력" />
          </div>
          <div class="form-group">
            <label>관리자</label>
            <div class="manager-select-box">
              <span v-if="editingDeptData.manager">{{ editingDeptData.manager.employeeName }} ({{ editingDeptData.manager.jobTitle }})</span>
              <span v-else class="placeholder">관리자 없음</span>
              <button @click="openEmployeeSearch" class="btn-search">검색</button>
              <button v-if="editingDeptData.manager" @click="removeManager" class="btn-clear">삭제</button>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="saveEditModal" class="btn-confirm">확인</button>
            <button @click="closeEditModal" class="btn-cancel">취소</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 사원 검색 모달 -->
    <div v-if="showEmployeeModal" class="modal-overlay" @click.self="closeEmployeeModal">
      <div class="modal-content search-modal">
        <div class="modal-header">
          <h3>사원 검색</h3>
        </div>
        <div class="modal-body">
          <div class="search-container">
            <div class="filter-row">
              <select v-model="searchParams.departmentName" class="filter-select">
                <option value="">부서 전체</option>
                <option v-for="opt in departmentOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <select v-model="searchParams.jobTitleName" class="filter-select">
                <option value="">직책 전체</option>
                <option v-for="opt in jobTitleOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <select v-model="searchParams.gradeName" class="filter-select">
                <option value="">직급 전체</option>
                <option v-for="opt in gradeOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>
            <div class="search-row">
              <input v-model="searchParams.employeeName" @keyup.enter="handleSearch" type="text" placeholder="사원명 입력" class="form-input" />
              <button @click="handleSearch" class="btn-search-action">검색</button>
            </div>
          </div>
          <div class="employee-list">
            <div v-if="isLoadingEmployees" class="loading-sm">로딩 중...</div>
            <ul v-else-if="employeeList.length > 0">
              <li v-for="emp in employeeList" :key="emp.employeeId" @click="selectManager(emp)" class="employee-item">
                <span class="emp-name">{{ emp.employeeName }}</span>
                <span class="emp-info">{{ emp.departmentName }} / {{ emp.jobTitleName }} / {{ emp.gradeName }}</span>
              </li>
            </ul>
            <div v-else class="no-result">검색 결과가 없습니다.</div>
          </div>
          <!-- 페이지네이션 -->
          <SlidingPagination
            v-model="currentPage"
            :total-pages="totalPages"
          />
          <div class="modal-actions">
            <button @click="closeEmployeeModal" class="btn-cancel">닫기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useSettingsStore } from '@/stores/settings';
// 사원 검색 API (가정) - 실제 경로에 맞게 수정 필요
import { fetchEmployees, fetchEmployeeSearchOptions } from '@/api/personnel/personnel'; 
import type { SettingsDepartmentRequestDTO, SettingsDepartmentResponseDTO } from '@/types/settings';
import DepartmentTreeItem from '@/views/settings/DepartmentTreeItem.vue';
import SlidingPagination from '@/components/common/SlidingPagination.vue';

const settingsStore = useSettingsStore();
const localDepartments = ref<SettingsDepartmentResponseDTO[]>([]);

watch(() => settingsStore.departments, (newVal: any) => {
  console.log('Department watch newVal:', newVal);
  // API 응답이 { data: [...] } 형태일 경우와 배열 [...] 형태일 경우를 모두 처리
  const data = (newVal && !Array.isArray(newVal) && newVal.data) ? newVal.data : newVal;
  localDepartments.value = data ? JSON.parse(JSON.stringify(data)) : [];
}, { immediate: true, deep: true });

// 저장 로직
const saveDepartments = async () => {
  try {
    // 스토어의 데이터를 Request DTO 형태로 변환
    const requestData = convertToRequestDTO(localDepartments.value);
    
    const res = await settingsStore.saveDepartments(requestData);
  
    if (res.success) {
      alert('부서 정보가 저장되었습니다.');
      await settingsStore.fetchDepartments(); // 최신 데이터 재조회
    } else {
      alert('저장 실패: ' + res.message);
    }
  } catch (error: any) {
    console.error('저장 중 에러 발생:', error);
    if (error.response) console.log('Error Response:', error.response);

    if (error.response && error.response.data && error.response.data.message) {
      alert(`저장 실패: ${error.response.data.message}`);
    } else {
      alert('저장 중 오류가 발생했습니다.');
    }
  }
};

// ResponseDTO -> RequestDTO 변환 헬퍼
const convertToRequestDTO = (data: any[]): SettingsDepartmentRequestDTO[] => {
  return data.map(dept => ({
    // 음수 ID(신규)는 null로 변환
    departmentId: dept.departmentId > 0 ? dept.departmentId : null,
    departmentName: dept.departmentName,
    departmentPhone: dept.departmentPhone,
    depth: dept.depth,
    parentDepartmentId: dept.parentDepartmentId > 0 ? dept.parentDepartmentId : null,
    managerId: dept.manager?.employeeId || null,
    children: dept.children ? convertToRequestDTO(dept.children) : []
  }));
};

const addRootDepartment = () => {
  // 임시 ID 생성 (음수)
  const newId = -Date.now();
  localDepartments.value.push({
    departmentId: newId,
    departmentName: '',
    departmentPhone: '',
    depth: 0,
    parentDepartmentId: null,
    manager: null,
    children: []
  });
};

const handleAddDepartment = (parentDept: any) => {
  if (!parentDept.children) {
    parentDept.children = [];
  }
  const newId = -Date.now();
  parentDept.children.push({
    departmentId: newId,
    departmentName: '',
    departmentPhone: '',
    depth: parentDept.depth + 1,
    parentDepartmentId: parentDept.departmentId > 0 ? parentDept.departmentId : null,
    manager: null,
    children: []
  });
};

const handleRemoveDepartment = (index: number) => {
  localDepartments.value.splice(index, 1);
};

// --- 모달 관련 로직 ---
const showEditModal = ref(false);
const showEmployeeModal = ref(false);
const editingDeptRef = ref<SettingsDepartmentResponseDTO | null>(null); // 원본 참조
const editingDeptData = ref<any>({}); // 수정 중인 데이터 복사본

const handleEditDepartment = (dept: SettingsDepartmentResponseDTO) => {
  editingDeptRef.value = dept;
  // 깊은 복사로 수정 중 데이터 분리
  editingDeptData.value = JSON.parse(JSON.stringify(dept));
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingDeptRef.value = null;
  editingDeptData.value = {};
};

const saveEditModal = () => {
  if (editingDeptRef.value) {
    // 원본 데이터 업데이트
    editingDeptRef.value.departmentName = editingDeptData.value.departmentName;
    editingDeptRef.value.departmentPhone = editingDeptData.value.departmentPhone;
    editingDeptRef.value.manager = editingDeptData.value.manager;
  }
  closeEditModal();
};

const removeManager = () => {
  editingDeptData.value.manager = null;
};

// --- 사원 검색 관련 로직 ---
const searchParams = ref({
  departmentName: '',
  jobTitleName: '',
  gradeName: '',
  employeeName: ''
});

const departmentOptions = ref<string[]>([]);
const gradeOptions = ref<string[]>([]);
const jobTitleOptions = ref<string[]>([]);

const employeeList = ref<any[]>([]);
const isLoadingEmployees = ref(false);
const currentPage = ref(0);
const totalPages = ref(0);
const pageSize = 5;

const openEmployeeSearch = async () => {
  showEmployeeModal.value = true;
  // 검색 조건 초기화
  searchParams.value = {
    departmentName: editingDeptData.value.departmentName || '',
    jobTitleName: '',
    gradeName: '',
    employeeName: ''
  };
  employeeList.value = [];
  totalPages.value = 0;
  
  // 옵션 로드
  if (departmentOptions.value.length === 0) {
    await loadSearchOptions();
  }

  if (currentPage.value === 0) {
    searchEmployees(0);
  } else {
    currentPage.value = 0;
  }
};

const closeEmployeeModal = () => {
  showEmployeeModal.value = false;
};

const loadSearchOptions = async () => {
  try {
    const res = await fetchEmployeeSearchOptions();
    if (res.data.success) {
      departmentOptions.value = res.data.data.department;
      gradeOptions.value = res.data.data.grade;
      jobTitleOptions.value = res.data.data.jobTitle;
    }
  } catch (error) {
    console.error('검색 옵션 로딩 실패:', error);
  }
};

const handleSearch = () => {
  if (currentPage.value === 0) {
    searchEmployees(0);
  } else {
    currentPage.value = 0;
  }
};

const searchEmployees = async (page: number = 0) => {
  isLoadingEmployees.value = true;
  try {
    // API 호출: 검색어가 있으면 검색, 없으면 전체 조회
    // fetchEmployees는 PageResponse를 반환하므로 content를 추출해야 함
    const params: any = {
      page: page + 1,
      size: pageSize,
      ...searchParams.value,
    };

    const res = await fetchEmployees(params);
    if (res.data && res.data.success && res.data.data) {
      employeeList.value = res.data.data.content;
      currentPage.value = res.data.data.page;
      totalPages.value = res.data.data.totalPages;
    }
  } catch (error) {
    console.error('사원 검색 실패:', error);
  } finally {
    isLoadingEmployees.value = false;
  }
};

const selectManager = (emp: any) => {
  // 선택한 사원을 관리자로 설정
  // DTO 구조에 맞게 매핑
  editingDeptData.value.manager = {
    employeeId: emp.employeeId,
    employeeName: emp.employeeName,
    employeeNumber: emp.employeeNumber || '',
    jobTitle: emp.jobTitleName || emp.jobTitle || '',
    grade: emp.gradeName || emp.grade || ''
  };
  closeEmployeeModal();
};

watch(currentPage, (newPage) => {
  searchEmployees(newPage);
});

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (showEmployeeModal.value) {
      closeEmployeeModal();
    } else if (showEditModal.value) {
      closeEditModal();
    }
  }
};

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown);
  await settingsStore.fetchDepartments();
  console.log('Department onMounted store data:', settingsStore.departments);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
}

.page-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 24px;
  overflow: hidden;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172b;
}

.btn-save {
  padding: 0 15px;
  height: 40px;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}

.btn-save:hover {
  background-color: #162456;
}

.loading-text {
  text-align: center;
  padding: 40px 0;
  color: #64748b;
}

.tree-root {
  padding: 0;
  margin: 0;
}

.tree-container {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
}

.tree-actions {
  margin-bottom: 10px;
  text-align: right;
}

.btn-add-root {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: white;
}

.btn-add-root:hover {
  background: #162456;
}

.no-data {
  text-align: center;
  padding: 40px 0;
  color: #94a3b8;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  /* background: linear-gradient(180deg, #1c398e 0%, #162456 100%); */
  background-color: white;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  color: white;
}

.modal-header h3 {
  color: #0F172B;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-body {
  padding: 24px;
}

.search-modal {
  width: 500px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #334155;
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 2px solid #cad5e2;
  border-radius: 10px;
  font-size: 0.95rem;
  background-color: #ffffff;
  color: #1f2933;
  box-sizing: border-box;
}

.manager-select-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #f8fafc;
}

.placeholder {
  color: #94a3b8;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}

.btn-confirm, .btn-search-action {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  border: none;
  height: 40px;
  padding: 0 15px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}

.btn-cancel, .btn-search, .btn-clear {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  height: 40px;
  padding: 0 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}

.employee-list {
  margin-top: 16px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.employee-item {
  padding: 10px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.employee-item:hover {
  background-color: #f8fafc;
}

.search-container {
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.filter-select {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border: 2px solid #cad5e2;
  border-radius: 10px;
  font-size: 0.95rem;
  background-color: white;
  color: #1f2933;
  box-sizing: border-box;
}

.search-row {
  display: flex;
  gap: 8px;
}
</style>
