<!-- 
  <pre>
  TypeScript Name   : WorkSystemStatus.vue
  Description : 부서 근태 현황 조회 페이지
                - 단일 날짜 기준 조회
                - 로그인한 사용자의 부서(departmentId) 기준 조회
                - 프론트 단 페이지네이션
  History
  2025/12/26 - 이지윤 최초 작성
  2026/01/01 - (지윤) 페이지네이션 디자인 수정 및 필터링 부분 수정
  2026/01/05 - (지윤) 디자인 수정
  </pre>

  @author 이지윤
  @version 1.3
-->

<template>
  <div class="worksystem-wrapper">
    <div class="worksystem-page">
      <div class="panel">
        <div class="panel-body">
        <!-- 검색 영역 : 단일 날짜 -->
        <div class="panel-search">
          <div class="panel-search-inner">
            <p class="search-info"></p>

            <div class="filter-group">
              <!-- 표준 필터 row -->
              <div class="filter-row">
                <span class="filter-label">날짜</span>
                <input
                  v-model="selectedDate"
                  type="date"
                  class="filter-input"
                  :min="minDate"
                  :max="today"
                />
              </div>

              <!-- 표준 버튼 그룹 -->
              <div class="search-button-group">
                <button class="btn-search" :disabled="isSearching" @click="onSearch">
                  검색
                </button>
                <button class="btn-reset" :disabled="isResetting" @click="onReset">
                  초기화
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 테이블 영역 -->
        <div class="panel-table-wrapper">
          <div class="panel-table">
            <table class="attendance-table dept-status-table">
              <thead>
                <tr>
                  <th class="col-date">날짜</th>
                  <th class="col-name">이름</th>
                  <th class="col-status">상태</th>
                  <th class="col-position">직급</th>
                  <th class="col-worksystem">근무제</th>
                  <th class="col-worktime">근무시간</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, index) in pagedList"
                  :key="row.id"
                  :class="{ 'row-striped': index % 2 === 1 }"
                >
                  <td class="cell-date">
                    {{ row.date }}
                  </td>

                  <td class="cell-name">
                    {{ row.name }}
                  </td>

                  <td class="cell-status">
                    <span
                      class="status-pill"
                      :class="{
                        'status-normal': row.status === '정상',
                        'status-late': row.status === '지각',
                        'status-absent': row.status === '결근',
                        'status-early': row.status === '조퇴'
                      }"
                    >
                      {{ row.status }}
                    </span>
                  </td>

                  <td class="cell-position">
                    {{ row.position }}
                  </td>

                  <td class="cell-worksystem">
                    {{ row.workSystem }}
                  </td>

                  <td class="cell-worktime">
                    {{ row.workTime }}
                  </td>
                </tr>

                <tr v-if="pagedList.length === 0">
                  <td
                    colspan="6"
                    class="empty-row"
                  >
                    조회된 근무제 현황이 없습니다.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 페이지네이션 -->
          <div v-if="totalPages > 0" class="pagination">
            <!-- 이전 화살표 -->
            <button
              type="button"
              class="page-button arrow-button"
              :disabled="currentPage === 1"
              @click="goPage(currentPage - 1)"
            >
              이전
            </button>

            <!-- 이전 페이지(있을 때만) -->
            <button
              v-if="prevPage !== null"
              type="button"
              class="page-button"
              @click="goPage(prevPage)"
            >
              {{ prevPage }}
            </button>

            <!-- 현재 페이지(가운데 고정 역할, disabled + active) -->
            <button type="button" class="page-button page-active" disabled>
              {{ currentPage }}
            </button>

            <!-- 다음 페이지(있을 때만) -->
            <button
              v-if="nextPage !== null"
              type="button"
              class="page-button"
              @click="goPage(nextPage)"
            >
              {{ nextPage }}
            </button>

            <!-- 다음 화살표 -->
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
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
/**
 * WorkSystemStatus.vue
 * - 부서 근무제/근태 현황 조회 화면
 * - 단일 날짜 기준 조회 + 로그인 사용자의 부서 기준으로 필터링
 * - 프론트 단 페이지네이션 적용
 */

import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';


import {
  useDeptWorkSystemStore,
  type DeptWorkSystemRowDTO,
} from '@/stores/attendance/deptWorkSystem';
import { useAuthStore } from '@/stores/auth';

/**
 * 오늘 날짜(YYYY-MM-DD)
 * - date input의 max 속성에 사용
 */
const today = new Date().toISOString().slice(0, 10);
const minDate = '2025-01-01';

/**
 * 화면에서 사용하는 테이블 한 행 타입
 * - 백엔드 DTO(DeptWorkSystemRowDTO)를 화면 표시용 필드로 변환한 형태
 */
interface EmployeeWorkSystemRow {
  id: string;
  date: string;
  name: string;
  status: string;
  position: string;
  workSystem: string;
  workTime: string;
}

 const formatHHmm = (time?: string | null): string => {
   return time ? time.slice(0, 5) : '';
 };
/* =========================
   스토어 & 인증 관련
   ========================= */

/** 부서 근태 현황 스토어 */
const deptWorkStore = useDeptWorkSystemStore();
const { workDate } = storeToRefs(deptWorkStore);

/** 인증 스토어 (TODO: departmentId 연동 시 사용) */
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const getMyDepartmentId = (): number | null => {
  return user.value?.departmentId ?? null;
};

/* =========================
   화면 상태 (필터/페이지)
   ========================= */

/** 단일 날짜 필터 */
const selectedDate = ref<string>('');

/** 검색/초기화 진행 여부 (버튼 상태 표현용) */
const isSearching = ref(false);
const isResetting = ref(false);

/** 페이지네이션 상태(프론트 전용) */
const currentPage = ref<number>(1);
const pageSize = ref<number>(5);

/* =========================
   DTO → 화면 행 데이터 변환
   ========================= */

/**
 * 스토어의 DTO 목록을 화면용 행 데이터로 변환
 * - date/name/status/position/workSystem/workTime 형식으로 정규화
 */
const allList = computed<EmployeeWorkSystemRow[]>(() => {
  // 이번 조회에 사용된 날짜(백엔드 필터용)를 스토어에서 가져옴
  const dateForRow = workDate.value;

  return deptWorkStore.rows.map((row: DeptWorkSystemRowDTO, index) => ({
    // 각 행마다 고유한 key (employeeId + index 조합)
    id: `${row.employeeId}-${index}`,
    // 테이블에 표시할 날짜는 현재 조회 기준 workDate
    date: dateForRow,
    name: row.employeeName,
    status: row.state,
    position: row.jobTitle,
    workSystem: row.workSystemName,
    workTime: `${formatHHmm(row.startTime)} - ${formatHHmm(row.endTime)}`,
  }));
});

/**
 * 전체 페이지 수(프론트 기준)
 */
const totalPages = computed<number>(() => {
  return Math.max(1, Math.ceil(allList.value.length / pageSize.value));
});

const prevPage = computed<number | null>(() => {
  return currentPage.value > 1 ? currentPage.value - 1 : null;
});

const nextPage = computed<number | null>(() => {
  return currentPage.value < totalPages.value ? currentPage.value + 1 : null;
});

/**
 * 현재 페이지에 보여줄 데이터
 */
const pagedList = computed<EmployeeWorkSystemRow[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;

  return allList.value.slice(start, end);
});

/* =========================
   이벤트 핸들러 (검색/초기화/페이지 이동)
   ========================= */

/**
 * 검색 버튼 클릭
 * - 선택한 날짜 기준으로 부서 근태 현황 조회
 */
const onSearch = async (): Promise<void> => {
  if (!selectedDate.value) return;

  isSearching.value = true;
  try {
    currentPage.value = 1;
    workDate.value = selectedDate.value;

    const departmentId = getMyDepartmentId();  

    deptWorkStore.setFilters(departmentId, workDate.value);
    await deptWorkStore.fetchDeptWorkSystem(1);
  } finally {
    isSearching.value = false;
  }
};

/**
 * 초기화 버튼 클릭
 * - 날짜를 오늘로 초기화하고 해당 날짜 기준으로 다시 조회
 */
const onReset = async (): Promise<void> => {
  isResetting.value = true;
  try {
    const iso = new Date().toISOString().slice(0, 10);

    selectedDate.value = iso;
    workDate.value = iso;
    currentPage.value = 1;

    const departmentId = getMyDepartmentId();  // ← 여기

    deptWorkStore.setFilters(departmentId, iso);
    await deptWorkStore.fetchDeptWorkSystem(1);
  } finally {
    isResetting.value = false;
  }
};

/**
 * 페이지 이동 (프론트 페이지네이션)
 */
const goPage = (page: number): void => {
  if (page < 1 || page > totalPages.value) {
    return;
  }

  currentPage.value = page;
};

/**
 * 화면 진입 시 기본 조회
 * - 오늘 날짜 + 내 부서 기준으로 조회
 */
onMounted(async () => {
  await onReset();
});
</script>


<style scoped src="@/assets/styles/attendance/attendance-common.css"></style>
<style scoped src="@/assets/styles/attendance/attendance-dept-status.css"></style>

