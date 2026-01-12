<!--
  <pre>
  (File => TypeScript / Vue) Name   : index.vue
  Description : 직원 근태 대시보드
                - 직원 별 모달창 열기
                - 그래프에 데이터 매핑


  History
  2025/12/26 - 이지윤 최초 작성
  2026/01/02 - (지윤) 년도 필터링 부분 수정
  2026/01/06 - (지윤) 디자인 수정
  </pre>

  @author 이지윤
  @version 1.3
-->

<template>
  <div class="attendance-dashboard-wrapper">
    <!-- 상단 요약 카드 4개 -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-title">전체 직원</div>
        <div class="summary-value-wrapper">
          <span class="summary-value">{{ summaryView?.totalEmployees ?? 0 }}</span>
          <span class="summary-unit">명</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-title">우수 직원(95점 이상)</div>
        <div class="summary-value-wrapper">
          <span class="summary-value">{{ summary.excellentEmployees ?? 0}}</span>
          <span class="summary-unit">명</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-title">위험 직원(85점 이하)</div>
        <div class="summary-value-wrapper">
          <span class="summary-value">{{ summary.riskyEmployees ?? 0}}</span>
          <span class="summary-unit">명</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-title">점수 계산 식</div>
        <div class="summary-formula">
          점수 : 100 - (지각 × 1) - (결근 × 2)
        </div>
      </div>
    </div>

    <!-- 하단 패널 (표준: panel + panel-body) -->
    <div class="panel">
      <div class="panel-body">
        <!-- 필터/검색 영역 -->
        <div class="panel-search">
          <div class="panel-search-inner">
            <!-- 왼쪽 안내 문구 -->
            <p class="search-info"></p>

            <!-- 오른쪽: 필터 + 버튼 -->
            <div class="filter-group">
              <div class="filter-row">
                <span class="filter-label">필터</span>

                <!-- 월 선택 -->
                <input
                  v-model="selectedMonth"
                  type="month"
                  class="filter-input"
                  :min="minMonth"
                  :max="currentMonth"
                />

                <!-- 부서 선택 -->
                <select
                  v-model="selectedDepartmentId"
                  class="filter-input"
                  :disabled="deptLoading"
                >
                  <option :value="null">
                    전체 부서
                  </option>
                  <option
                    v-for="dept in filteredDepartmentOptions"
                    :key="dept.departmentId"
                    :value="dept.departmentId"
                  >
                    {{ dept.departmentName }}
                  </option>
                </select>

                <!-- 점수 정렬 -->
                <select
                  v-model="scoreSort"
                  class="filter-input"
                >
                  <option value="DESC">
                    점수 높은 순
                  </option>
                  <option value="ASC">
                    점수 낮은 순
                  </option>
                </select>
              </div>

              <div class="search-button-group">
                <button
                  class="btn-search"
                  type="button"
                  @click="onSearch"
                >
                  검색
                </button>
                <button
                  class="btn-reset"
                  type="button"
                  @click="onReset"
                >
                  초기화
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 테이블 영역 -->
        <div class="dashboard-table-wrapper">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th class="col-rank">
                  사번
                </th>
                <th class="col-name">
                  이름
                </th>
                <th class="col-dept">
                  부서
                </th>
                <th class="col-tardy">
                  지각
                </th>
                <th class="col-absence">
                  결근
                </th>
                <th class="col-score">
                  점수
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(row, index) in pagedEmployees"
                :key="row.employeeId"
                :class="{ 'row-striped': index % 2 === 1 }"
                class="clickable-row"
                @click="openEmployeeChart(row.employeeId)"
              >
                <td>
                  {{ row.employeeNumber }}
                </td>
                <td>
                  {{ row.employeeName }}
                </td>
                <td>
                  {{ row.departmentName }}
                </td>

                <td
                  class="count-cell"
                  :class="row.tardyCount > 0 ? 'status-late' : 'status-normal'"
                >
                  {{ row.tardyCount }}회
                </td>

                <td
                  class="count-cell"
                  :class="row.absenceCount > 0 ? 'status-absent' : 'status-normal'"
                >
                  {{ row.absenceCount }}회
                </td>

                <td>
                  {{ row.score }}점
                </td>
              </tr>

              <tr v-if="pagedEmployees.length === 0">
                <td
                  colspan="6"
                  class="empty-row"
                >
                  검색 조건에 해당하는 직원이 없습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 페이지네이션 (표준 페이지네이션) -->
        <div
          v-if="totalPages > 0"
          class="pagination"
        >
          <!-- 이전 -->
          <button
            type="button"
            class="page-button arrow-button"
            :disabled="currentPage === 1"
            @click="goPage(currentPage - 1)"
          >
            이전
          </button>

          <!-- 최대 3개 페이지 -->
          <button
            v-for="pageNum in visiblePages"
            :key="pageNum"
            type="button"
            class="page-button"
            :class="{ 'page-active': pageNum === currentPage }"
            :disabled="pageNum === currentPage"
            @click="goPage(pageNum)"
          >
            {{ pageNum }}
          </button>

          <!-- 다음 -->
          <button
            type="button"
            class="page-button arrow-button"
            :disabled="currentPage >= totalPages"
            @click="goPage(currentPage + 1)"
          >
            다음
          </button>
        </div>
      </div>
    </div>

    <!-- 직원 반기 근태 상세 Drawer -->
    <EmployeeHalfChart
      :open="employeeDashboardOpen"
      :employee-id="selectedEmployeeId"
      @close="closeEmployeeChart"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import EmployeeHalfChart from '@/views/attendance/attendanceDashBoard/EmplloyeeHalfChartDrawer.vue';
import { useAttendanceEmployeeDashboardStore } from '@/stores/attendance/attendanceEmployeeDashboard';
import { useAttendanceDashboardStore } from '@/stores/attendance/dashboard';
import type { AttendanceDashboardDTO, ScoreSort } from '@/types/attendance/dashboard.types';

/**
 * 직원 반기 근태 Drawer 스토어
 */
const employeeDashboardStore = useAttendanceEmployeeDashboardStore();
const {
  open: employeeDashboardOpen,
  selectedEmployeeId,
} = storeToRefs(employeeDashboardStore);

/**
 * 월 필터 (YYYY-MM)
 */
const currentMonth = new Date().toISOString().slice(0, 7);
const minMonth = '2025-01';

const isAdminRow = (row: AttendanceDashboardDTO): boolean => {
  return row.employeeName === 'admin';
};
/**
 * 로컬 필터 상태
 */
const selectedMonth = ref<string>(currentMonth);
const selectedDepartmentId = ref<number | null>(null);
const scoreSort = ref<ScoreSort>('DESC');

/**
 * 근태 대시보드 스토어
 */
const dashboardStore = useAttendanceDashboardStore();
const {
  dashboardList,
  currentPage,
  totalPages,
  summary,
  departmentOptions,
  deptLoading,
} = storeToRefs(dashboardStore);

const EXCLUDED_DEPARTMENTS = [
  '관리자 부서',
  '발령 대기 부서',
]

const filteredDepartmentOptions = computed(() =>
  departmentOptions.value.filter(
    (d) => !EXCLUDED_DEPARTMENTS.includes(d.departmentName),
  ),
)

/**
 * 현재 페이지 직원 목록
 * - 서버 페이징 결과를 그대로 사용
 */
const pagedEmployees = computed<AttendanceDashboardDTO[]>(() =>
dashboardList.value.filter((row) => !isAdminRow(row))
);

/**
 * 검색 버튼 클릭
 * - 필터값을 스토어에 반영 후 1페이지부터 재조회
 */
const onSearch = (): void => {
    if (
    selectedDepartmentId.value != null &&
    !filteredDepartmentOptions.value.some(d => d.departmentId === selectedDepartmentId.value)
  ) selectedDepartmentId.value = null;

  dashboardStore.setMonth(selectedMonth.value);
  dashboardStore.setDepartment(selectedDepartmentId.value);
  dashboardStore.setScoreSort(scoreSort.value);
  dashboardStore.refreshDashboard(1);
};

/**
 * 초기화 버튼 클릭
 * - 필터 리셋 후 1페이지 재조회
 */
const onReset = (): void => {
  selectedMonth.value = currentMonth;
  selectedDepartmentId.value = null;
  scoreSort.value = 'DESC';

  dashboardStore.setMonth(currentMonth);
  dashboardStore.setDepartment(null);
  dashboardStore.setScoreSort('DESC');
  dashboardStore.refreshDashboard(1);
};

/**
 * 표준 페이지네이션(가운데 고정, 최대 3개 노출)
 */
const visiblePages = computed<number[]>(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages: number[] = [];

  if (total <= 0) {
    return pages;
  }

  if (total <= 3) {
    for (let i = 1; i <= total; i += 1) {
      pages.push(i);
    }
    return pages;
  }

  if (current <= 1) {
    return [1, 2, 3];
  }
  if (current >= total) {
    return [total - 2, total - 1, total];
  }

  return [current - 1, current, current + 1];
});

const summaryView = computed(() => {
return summary.value;
});
/**
 * 페이지 이동
 */
const goPage = (page: number): void => {
  if (page < 1 || page > totalPages.value) {
    return;
  }
  dashboardStore.fetchDashboard(page);
};

/**
 * 직원 반기 근태 Drawer 열기
 */
const openEmployeeChart = async (employeeId: number): Promise<void> => {
 const row = dashboardList.value.find((r) => r.employeeId === employeeId);
 if (row && isAdminRow(row)) return;
  employeeDashboardStore.setOpen(true);
  await employeeDashboardStore.fetchEmployeeHalfDashboard(employeeId);
};

/**
 * 직원 반기 근태 Drawer 닫기
 */
const closeEmployeeChart = (): void => {
  employeeDashboardStore.setOpen(false);
};

/**
 * 초기 진입 시 기본 필터 및 데이터 로딩
 */
onMounted(async () => {
  dashboardStore.setMonth(currentMonth);
  dashboardStore.setDepartment(null);
  dashboardStore.setScoreSort('DESC');

  if (!departmentOptions.value.length) {
    await dashboardStore.fetchDepartmentOptions();
  }

  dashboardStore.refreshDashboard(1);
});
</script>

<style scoped src="@/assets/styles/attendance/attendance-common.css"></style>
<style scoped src="@/assets/styles/attendance/attendance-dashboard.css"></style>
