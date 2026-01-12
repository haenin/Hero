<!-- 
  <pre>
  (File => TypeScript / Vue) Name   : ChangeLog.vue
  Description : 근무제 변경 이력 페이지
                - 상단 요약 카드로 이번 달 근무 현황 요약
                - 탭으로 근태 관련 4개 화면 간 이동
                - 기간 필터 + 페이지네이션을 사용한 근무제 변경 이력 조회

  History
  2025/12/10 - 이지윤 최초 작성
  2025/12/30 - (지윤) 디자인 수정
  2026/01/01 - (지윤) 페이지네이션 디자인 수정 및 필터링 부분 수정
  2026/01/03 - (지윤) 그래프 표시 부분 수정
  2026/01/05 - (지윤) 디자인 수정
  </pre>

  @author 이지윤
  @version 1.4
-->

<template>
  <div class="attendance-wrapper">
    <div class="attendance-page">
      <!-- 상단 요약 카드 4개 -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-title">이번 달 근무일</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ workDays }}</span>
            <span class="summary-unit">일</span>
          </div>
        </div>
  
        <div class="summary-card">
          <div class="summary-title">오늘 근무</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">
              {{ todayWorkSystemName || '근무 정보 없음' }}
            </span>
          </div>
        </div>
  
        <div class="summary-card">
          <div class="summary-title">이번 달 지각</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ lateCount }}</span>
            <span class="summary-unit">회</span>
          </div>
        </div>
  
        <div class="summary-card">
          <div class="summary-title">이번 달 결근</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ absentCount }}</span>
            <span class="summary-unit">회</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-title">이번 달 조퇴</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ earlyCount }}</span>
            <span class="summary-unit">회</span>
          </div>
        </div>
      </div>

      <!-- 메인 패널 -->
      <div class="panel">
        <!-- 탭 영역 -->
        <div class="panel-tabs">
          <RouterLink
            :to="{ name: 'AttendancePersonal' }"
            class="tab tab-start"
            :class="{ active: isActiveTab('AttendancePersonal') }"
          >
            개인 근태 이력
          </RouterLink>

          <RouterLink
            :to="{ name: 'AttendanceOvertime' }"
            class="tab"
            :class="{ active: isActiveTab('AttendanceOvertime') }"
          >
            초과 근무 이력
          </RouterLink>

          <RouterLink
            :to="{ name: 'AttendanceCorrection' }"
            class="tab"
            :class="{ active: isActiveTab('AttendanceCorrection') }"
          >
            지연 근태 수정 이력
          </RouterLink>

          <RouterLink
            :to="{ name: 'AttendanceChangeLog' }"
            class="tab tab-end"
            :class="{ active: isActiveTab('AttendanceChangeLog') }"
          >
            근무 유형 변경 이력
          </RouterLink>
        </div>


      <div class="panel-body">
                  <!-- 검색 영역 (기간 필터 UI) -->
          <div class="panel-search">
            <div class="panel-search-inner">
              <!-- 왼쪽 : 안내 문구 -->
              <div class="search-info">
              </div>

              <!-- 오른쪽 : 조회기간 + 날짜 + 검색/초기화 버튼 -->
              <div class="filter-group">
                <div class="filter-row">
                  <span class="filter-label">조회기간</span>

                  <input
                    v-model="startDate"
                    type="date"
                    class="filter-input"
                    :min="minDate"
                    :max="today"
                  />

                  <span class="filter-separator">~</span>

                  <input
                    v-model="endDate"
                    type="date"
                    class="filter-input"
                    :min="minDate"
                    :max="today"
                  />
                </div>

                <div class="search-button-group">
                  <button class="btn-search" @click="onSearch">검색</button>
                  <button class="btn-reset" @click="onReset">초기화</button>
                </div>
              </div>
            </div>
          </div>

        <!-- 테이블 영역 -->
        <div class="panel-table-wrapper">
          <div class="panel-table">
            <table class="attendance-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th class="col-worksystem">근무제 이름</th>
                  <th class="col-time">출근시간</th>
                  <th class="col-time">퇴근시간</th>
                  <th class="col-reason">사유</th>
                </tr>
              </thead>
              <tbody>
              <tr v-if="!changeLogStore.changeLogList.length">
              <td colspan="5" class="empty-row">
              조회된 근무 유형 변경 이력이 없습니다.
              </td>
              </tr>

  <tr
    v-else
    v-for="(row, index) in changeLogStore.changeLogList"
    :key="row.workSystemChangeLogId"
    :class="{ 'row-striped': index % 2 === 1 }"
  >
                  <td>{{ row.date }}</td>
                  <td class="worksystem-name">
                    {{ row.workSystemName }}
                  </td>
                  <td class="time-cell">
                    {{ formatTime(row.startTime) }}
                  </td>
                  <td class="time-cell">
                    {{ formatTime(row.endTime) }}
                  </td>
                  <td class="reason-cell">
                    {{ row.changeReason }}
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

              <!-- 현재 페이지(disabled + active) -->
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
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useAttendanceStore } from '@/stores/attendance/attendanceStore'; // 상단 요약 카드용
import { useChangeLogStore } from '@/stores/attendance/changeLog';        // 근무제 변경 이력 리스트용

const route = useRoute();
const attendanceStore = useAttendanceStore();
const changeLogStore = useChangeLogStore();

/**
 * 현재 활성화된 탭인지 확인합니다.
 *
 * @param {string} name - 라우트 이름 (예: 'AttendanceChangeLog')
 * @returns {boolean} 활성 탭 여부
 ****************************************
 * @param → 함수의 인자(Parameter)
 ****************************************
 */
const isActiveTab = (name: string): boolean => {
  return route.name === name;
};

// 오늘(로컬) 기준 YYYY-MM-DD 포맷터
const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const now = new Date();

// 오늘 날짜 (YYYY-MM-DD) – date input max에 사용
const today = formatDate(now);

// 2025-01-01부터 선택 가능
const minDate = '2025-01-01';

// 이번 달 1일 (YYYY-MM-DD)
const firstDayOfMonth = formatDate(
  new Date(now.getFullYear(), now.getMonth(), 1),
);

// --- 상단 요약 카드 상태 (AttendanceStore에서 가져옴) ---
const {
  workDays,
  todayWorkSystemName,
  lateCount,
  absentCount,
  earlyCount,
} = storeToRefs(attendanceStore);

// --- 기간 필터 인풋 (근무제 변경 이력용) ---
const startDate = ref<string>('');
const endDate = ref<string>('');

// --- 페이지네이션 (ChangeLogStore 값 그대로 사용) ---
const currentPage = computed(() => changeLogStore.currentPage);
const totalPages = computed(() => changeLogStore.totalPages);

/**
 * 근무제 변경 이력 페이지 진입 시 초기화 로직입니다.
 * - 상단 요약 카드는 이번 달 기준으로 한 번 조회
 * - 변경 이력 필터(startDate, endDate)는 store 값과 동기화
 * - 1 페이지 데이터를 조회합니다.
 */
onMounted(() => {
  // 기본 기간: 이번 달 1일 ~ 오늘
  startDate.value = firstDayOfMonth;
  endDate.value = today;

  // 스토어 필터에도 반영
  changeLogStore.setFilterDates(firstDayOfMonth, today);

  // 1 페이지 데이터 조회
  changeLogStore.fetchChangeLogs(1);
});

/**
 * 검색 버튼 클릭 시 실행되는 핸들러입니다.
 * - 기간 필터(startDate, endDate)를 스토어에 반영하고
 *   1 페이지부터 근무제 변경 이력을 다시 조회합니다.
 * - 상단 요약 카드는 '이번 달 기준'으로 고정이므로 갱신하지 않습니다.
 */
const onSearch = (): void => {
  changeLogStore.setFilterDates(startDate.value, endDate.value);
  changeLogStore.fetchChangeLogs(1);
};

/**
 * 초기화 버튼 클릭 시 실행되는 핸들러입니다.
 * - 기간 필터를 초기화하고
 *   1 페이지부터 근무제 변경 이력을 다시 조회합니다.
 * - 상단 요약 카드는 여전히 이번 달 기준으로 유지됩니다.
 */
const onReset = (): void => {
  // 인풋 값을 이번 달 1일 ~ 오늘로 초기화
  startDate.value = firstDayOfMonth;
  endDate.value = today;

  // 스토어 필터도 동일하게 세팅
  changeLogStore.setFilterDates(firstDayOfMonth, today);

  // 1 페이지부터 다시 조회
  changeLogStore.fetchChangeLogs(1);
};
const prevPage = computed<number | null>(() => {
  return currentPage.value > 1 ? currentPage.value - 1 : null
})

const nextPage = computed<number | null>(() => {
  return currentPage.value < totalPages.value ? currentPage.value + 1 : null
})

/**
 * 페이지를 이동합니다.
 * - 1 페이지보다 작거나 총 페이지 수를 초과하는 경우 이동하지 않습니다.
 *
 * @param {number} page - 이동할 페이지 번호
 */
const goPage = (page: number): void => {
  const maxPage = totalPages.value || 1;

  if (page < 1 || page > maxPage) {
    return;
  }

  changeLogStore.fetchChangeLogs(page);
};

/**
 * 시간 문자열을 'HH:mm' 형식으로 변환합니다.
 * - 서버에서 '09:00:00' 같은 형식으로 내려오는 값을
 *   '09:00'으로 잘라서 표시합니다.
 *
 * @param {string | null | undefined} time - 시간 문자열
 * @returns {string} 변환된 시간 문자열, 값이 없으면 빈 문자열
 */
const formatTime = (time?: string | null): string => {
  if (!time) {
    return '';
  }

  return time.length >= 5 ? time.substring(0, 5) : time;
};
</script>


<style scoped src="@/assets/styles/attendance/attendance-common.css"></style>
<style scoped src="@/assets/styles/attendance/attendance-changelog.css"></style>


