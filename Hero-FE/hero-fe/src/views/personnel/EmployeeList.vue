<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="main-card">
        <!-- 필터링 섹션 -->
        <div class="filter-container">
          <button class="register-btn" @click="$router.push('/personnel/register')">
            + 신규 사원 등록
          </button>
          <div class="search-area">
            <div class="filter-group">
              <select v-model="searchParams.resigningExpected" class="filter-select">
                  <option :value="0">재직자 전원</option>
                  <!-- <option :value="1">재직자</option> -->
                  <option :value="2">퇴사예정자</option>
                  <option :value="3">퇴사자</option>
              </select>
              <select v-model="searchParams.departmentName" class="filter-select">
                <option value="">부서 전체</option>
                <option v-for="dept in departmentOptions" :key="dept" :value="dept">{{ dept }}</option>
              </select>
              <select v-model="searchParams.jobTitleName" class="filter-select">
                <option value="">직책 전체</option>
                <option v-for="title in jobTitleOptions" :key="title" :value="title">{{ title }}</option>
              </select>
              <select v-model="searchParams.gradeName" class="filter-select">
                <option value="">직급 전체</option>
                <option v-for="grade in gradeOptions" :key="grade" :value="grade">{{ grade }}</option>
              </select>
              <input type="text" v-model="searchParams.employeeName" placeholder="사원명" class="filter-input" @keyup.enter="searchEmployees" />
            </div>
            <button class="search-btn" @click="searchEmployees">검색</button>
          </div>
        </div>
    
        <!-- 사원 목록 테이블 -->
        <div class="content">
          <table class="employee-table">
            <thead>
              <tr>
                <th>사번</th>
                <th>이름</th>
                <th>부서</th>
                <th>직급</th>
                <th>직책</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!isLoading && employees.length === 0">
                <td colspan="5" class="no-data">표시할 데이터가 없습니다.</td>
              </tr>
              <tr v-for="employee in employees" :key="employee.employeeId" @click="handleRowClick(employee)">
                <td>{{ employee.employeeNumber }}</td>
                <td>{{ employee.employeeName }}</td>
                <td>{{ employee.departmentName }}</td>
                <td>{{ employee.gradeName }}</td>
                <td>{{ employee.jobTitleName }}</td>
              </tr>
            </tbody>
          </table>

          <!-- 페이지네이션 -->
          <div class="pagination">
            <button
              class="page-button"
              :disabled="pagination.page === 0 || isLoading"
              @click="goToPage(pagination.page - 1)"
            >
              이전
            </button>
            <button
              v-for="page in visiblePages"
              :key="page"
              class="page-button"
              :class="{ 'page-active': page === pagination.page + 1 }"
              @click="goToPage(page - 1)"
            >
              {{ page }}
            </button>
            <button
              class="page-button"
              :disabled="pagination.page >= pagination.totalPages - 1 || isLoading"
              @click="goToPage(pagination.page + 1)"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>

    <EmployeeDetailModal 
      v-model="isModalOpen"
      :employee-id="selectedEmployeeId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { fetchEmployees as apiFetchEmployees, fetchEmployeeSearchOptions } from '@/api/personnel/personnel';
import type { EmployeeListResponse, EmployeeSearchParams } from '@/types/personnel/personnel';
import EmployeeDetailModal from './EmployeeDetailModal.vue';

// --- 상태(State) ---
const employees = ref<EmployeeListResponse[]>([]);
const searchParams = ref<Omit<EmployeeSearchParams, 'page' | 'size'>>({
  departmentName: '',
  jobTitleName: '',
  gradeName: '',
  employeeName: '',
  resigningExpected: 0, // 0: 재직자 전원 (기본값)
});
const pagination = ref({
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 1,
});
const isLoading = ref(false);
const errorMessage = ref('');
const isModalOpen = ref(false);
const selectedEmployeeId = ref<number | null>(null);

const departmentOptions = ref<string[]>([]);
const gradeOptions = ref<string[]>([]);
const jobTitleOptions = ref<string[]>([]);

const visiblePages = computed(() => {
  const total = pagination.value.totalPages;
  const current = pagination.value.page + 1;
  const max = 3;

  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start = current - Math.floor(max / 2);
  if (start < 1) start = 1;
  
  let end = start + max - 1;
  if (end > total) {
    end = total;
    start = end - max + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

// --- 메소드(Methods) ---

/**
 * 사원 목록 데이터를 API로부터 가져옵니다.
 */
const getEmployees = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    // 백엔드는 page를 1부터 시작하므로 +1 해서 보냅니다.
    const params: EmployeeSearchParams = {
      ...searchParams.value,
      page: pagination.value.page + 1,
      size: pagination.value.size,
    };

    const response = await apiFetchEmployees(params);

    if (response.data.success) {
      const pageData = response.data.data;
      employees.value = pageData.content;
      pagination.value.page = pageData.page;
      pagination.value.totalPages = pageData.totalPages;
      pagination.value.totalElements = pageData.totalElements;
    } else {
      errorMessage.value = '사원 정보를 불러오는데 실패했습니다.';
      // TODO: 사용자에게 에러 메시지 표시 (예: alert, toast)
    }
  } catch (error) {
    console.error('사원 정보 조회 에러:', error);
    errorMessage.value = '사원 정보 조회 중 오류가 발생했습니다.';
  } finally {
    isLoading.value = false;
  }
};

const loadSearchOptions = async () => {
  try {
    const response = await fetchEmployeeSearchOptions();
    if (response.data.success) {
      const { department, grade, jobTitle } = response.data.data;
      departmentOptions.value = department.sort();

      // const departmentOrder = [
      //   '발령대기 부서',
      //   '경영지원본부',
      //   '인사팀', '총무팀', '재무팀',
      //   '개발본부',
      //   '백엔드팀', '프론트엔드팀', '보안팀',
      //   '영업본부',
      //   '마케팅팀', '고객지원팀', '영업기획팀'
      // ];

      // departmentOptions.value = department.sort((a: string, b: string) => {
      //   const indexA = departmentOrder.indexOf(a);
      //   const indexB = departmentOrder.indexOf(b);
      //   if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      //   if (indexA !== -1) return -1;
      //   if (indexB !== -1) return 1;
      //   return a.localeCompare(b);
      // });
      gradeOptions.value = grade;
      jobTitleOptions.value = jobTitle;
    }
  } catch (error) {
    console.error('검색 옵션 로딩 실패:', error);
  }
};

/**
 * 검색 버튼 클릭 시, 첫 페이지부터 다시 검색합니다.
 */
const searchEmployees = () => {
  pagination.value.page = 0;
  getEmployees();
}

/**
 * 테이블 행 클릭 시 사원 상세 정보 모달을 엽니다.
 * @param employee 클릭된 사원 객체
 */
const handleRowClick = (employee: EmployeeListResponse) => {  
  console.log('모달 열기 시도:', employee.employeeId); // 디버깅용 로그
  selectedEmployeeId.value = employee.employeeId;
  isModalOpen.value = true; // 이 부분이 있어야 모달이 열립니다.
};

/**
 * 페이지 이동 핸들러
 * @param page 이동할 페이지 번호
 */
const goToPage = (page: number) => {
  pagination.value.page = page;
  getEmployees();
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isModalOpen.value) {
    isModalOpen.value = false;
  }
};

// 컴포넌트가 마운트될 때 사원 목록을 조회합니다.
onMounted(() => {
  getEmployees();
  loadSearchOptions();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
* {
  font-size: 14px;
  font-family: 'Inter-Regular', sans-serif;
  box-sizing: border-box;
}

.content-wrapper {
  padding: 20px;
}

.register-btn {
  padding: 10px;
  display: flex;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  align-items: center;
  font-weight: 600;
}

.register-btn:hover {
  background: #162456;
}

.main-card {
  background: white;
  border-radius: 14px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.filter-container {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.search-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-input, .filter-select {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #1f2933;
  min-width: 150px;
  font-size: 14px;
  font-weight: 500;
}

.search-btn {
  padding: 10px 15px;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}
.search-btn:hover {
  background: #162456;
}

.content {
  padding: 0;
  border-top: 1px solid #e2e8f0;
}

.employee-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  table-layout: fixed;
}

.employee-table th, .employee-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.employee-table th {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
}

/* 컬럼 너비 고정 */
.employee-table th:nth-child(1),
.employee-table td:nth-child(1) {
  width: 15%;
}
.employee-table th:nth-child(2),
.employee-table td:nth-child(2) {
  width: 15%;
}
.employee-table th:nth-child(3),
.employee-table td:nth-child(3) {
  width: 30%;
}
.employee-table th:nth-child(4),
.employee-table td:nth-child(4) {
  width: 20%;
}
.employee-table th:nth-child(5),
.employee-table td:nth-child(5) {
  width: 20%;
}

.employee-table tbody tr {
  cursor: pointer;
  transition: background-color 0.2s;
}

.employee-table tbody tr:hover {
  background-color: #f1f5f9;
}

.no-data {
  padding: 60px 0;
  color: #94a3b8;
  font-size: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  gap: 10px;
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
</style>
