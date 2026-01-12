<!-- 
  <pre>
  (File => TypeScript / Vue) Name   : Overtime.vue
  Description : 개인 초과 근무 이력 페이지
                - 상단 요약 카드로 이번 달 근무 현황 요약
                - 탭으로 근태 관련 4개 화면 간 이동
                - 기간 필터 + 페이지네이션을 사용한 초과 근무 이력 조회

  History
  2025/12/10 - 이지윤 최초 작성
  2025/12/30 - (지윤) 디자인 수정
  2026/01/01 - (지윤) 페이지네이션 디자인 수정 및 필터링 부분 수정
  2026/01/01 - (지윤) 그래프 표시 부분 수정
  2026/01/03 - (지윤) 그래프 표시 부분 수정
  2026/01/05 - (지윤) 디자인 수정
  </pre>

  @author 이지윤
  @version 1.6
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
        <!-- 상단 탭 -->
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
            지연 출근 수정 이력
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
                <!-- 검색 영역(기간 필터) -->
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
                  <th class="col-time">시작시간</th>
                  <th class="col-time">종료시간</th>
                  <th class="col-overtime">초과 근무 시간</th>
                  <th class="col-reason">사유</th>
                </tr>
              </thead>
              <tbody>
                  <tr v-if="!displayList.length">
                  <td colspan="5" class="empty-row">
                  조회된 초과 근무 이력이 없습니다.
                  </td>
                  </tr>
                <tr
                v-else
                  v-for="(row, index) in displayList"
                  :key="row.overtimeId"
                  :class="{ 'row-striped': index % 2 === 1 }"
                >
                  <td>{{ row.date }}</td>
                  <td class="time-cell">
                    {{ formatTime(row.startTime) }}
                  </td>
                  <td class="time-cell">
                    {{ formatTime(row.endTime) }}
                  </td>
                  <td class="overtime-time">
                    {{ formatOvertime(row.overtimeHours) }}
                  </td>
                  <td class="reason-cell">
                    {{ row.reason }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 페이지네이션 -->
          <div v-if="totalPages > 0" class="pagination">
            <button
              type="button"
              class="page-button arrow-button"
              :disabled="currentPage === 1"
              @click="goPage(currentPage - 1)"
            >
              이전
            </button>

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

import { useAttendanceStore } from '@/stores/attendance/attendanceStore'; // 상단 요약
import { useOvertimeStore } from '@/stores/attendance/overtime';         // 초과 근무 목록

const route = useRoute();
const attendanceStore = useAttendanceStore();
const overtimeStore = useOvertimeStore();

/* =========================
   날짜 관련 상수 (이번 달 1일 ~ 오늘)
   ========================= */

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

// 최소 선택 가능 날짜
const minDate = '2025-01-01';

// 이번 달 1일 (YYYY-MM-DD)
const firstDayOfMonth = formatDate(
  new Date(now.getFullYear(), now.getMonth(), 1),
);

/**
 * 현재 활성화된 탭인지 확인합니다.
 *
 * @param {string} name - 라우트 이름 (예: 'AttendanceOvertime')
 * @returns {boolean} 활성 탭 여부
 */
const isActiveTab = (name: string): boolean => {
  return route.name === name;
};

// =======================
// 1) 상단 요약 카드 상태 (AttendanceStore)
// =======================
const {
  workDays,
  todayWorkSystemName,
  lateCount,
  absentCount,
  earlyCount,
} = storeToRefs(attendanceStore);

// =======================
// 2) 초과 근무 목록/필터/페이지네이션 상태 (OvertimeStore)
// =======================
const {
  overtimeList,
  startDate,
  endDate,
  currentPage,
  totalPages,
} = storeToRefs(overtimeStore);

// TODO: 키워드 검색 입력 UI 추가 예정 (사유/날짜 등 검색)
const keyword = ref<string>('');

/* =========================
   화면 표시용 목록 (키워드 필터)
   ========================= */
const displayList = computed(() => {
  const k = keyword.value.trim();
  const base = overtimeList.value ?? [];

  if (!k) {
    return base;
  }

  return base.filter((row) => {
    const date = row.date ?? '';
    const start = row.startTime ?? '';
    const end = row.endTime ?? '';
    const hours = row.overtimeHours != null ? String(row.overtimeHours) : '';
    const reason = row.reason ?? '';

    return (
      date.includes(k) ||
      start.includes(k) ||
      end.includes(k) ||
      hours.includes(k) ||
      reason.includes(k)
    );
  });
});

const visiblePages = computed<number[]>(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages: number[] = [];

  if (total <= 0) return pages;

  if (total <= 3) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  if (current <= 1) return [1, 2, 3];
  if (current >= total) return [total - 2, total - 1, total];

  return [current - 1, current, current + 1];
});

/**
 * 페이지를 이동합니다.
 * - 1 페이지보다 작거나, 총 페이지 수를 초과하면 요청하지 않습니다.
 *
 * @param {number} page - 이동할 페이지 번호
 */
const goPage = (page: number): void => {
  const maxPage = totalPages.value || 1;

  if (page < 1 || page > maxPage) {
    return;
  }

  overtimeStore.fetchOvertime(page);
};

/* =========================
   검색 / 초기화
   ========================= */

/**
 * 검색 버튼 클릭 시 실행되는 핸들러입니다.
 * - date input(v-model)로 선택한 startDate / endDate를
 *   store 필터에 반영한 뒤 1페이지부터 재조회
 */
const onSearch = (): void => {
  overtimeStore.setFilterDates(startDate.value, endDate.value);
  overtimeStore.fetchOvertime(1);
};

/**
 * 초기화 버튼 클릭 시 실행되는 핸들러입니다.
 * - 기간 필터/키워드를
 *   "이번 달 1일 ~ 오늘"로 되돌리고 1페이지 재조회
 */
const onReset = (): void => {
  startDate.value = firstDayOfMonth;
  endDate.value = today;
  keyword.value = '';

  overtimeStore.setFilterDates(firstDayOfMonth, today);
  overtimeStore.fetchOvertime(1);
};

/* =========================
   표시 포맷터
   ========================= */

/**
 * 시간 문자열을 'HH:mm' 형식으로 변환합니다.
 *
 * @param {string | null | undefined} time - 서버에서 내려온 시간 문자열 (예: '18:30:00')
 * @returns {string} 표시용 시간 문자열 (예: '18:30'), 값이 없으면 빈 문자열
 */
const formatTime = (time?: string | null): string => {
  return time ? time.substring(0, 5) : '';
};

/**
 * 초과 근무 시간을 표시용 문자열로 변환합니다.
 * - 소수점 둘째 자리까지 반올림(= 2자리)
 * - 정수면 소수점 없이 표시
 *
 * @param {number | null | undefined} hours - 초과 근무 시간(숫자)
 * @returns {string} 예: '2시간', '1.5시간', '2.27시간', 값이 없으면 '-' 반환
 */
const formatOvertime = (hours?: number | null): string => {
  if (hours == null) {
    return '-'
  }

  // 소수점 2자리 반올림
  const rounded = Math.round((hours + Number.EPSILON) * 10) / 10

  // 정수면 소수점 없이
  if (Number.isInteger(rounded)) {
    return `${rounded}시간`
  }

  // 2자리까지 표기하되, 불필요한 0은 제거 (예: 1.50 -> 1.5)
  const text = rounded.toFixed(1).replace(/\.?0+$/, '')
  return `${text}시간`
}


/* =========================
   초기 진입 시: 상단 요약 + 이번 달 1일~오늘 데이터 조회
   ========================= */
onMounted(() => {
  // 요약 카드
  attendanceStore.fetchPersonalSummary();

  // 기본 기간: 이번 달 1일 ~ 오늘
  startDate.value = firstDayOfMonth;
  endDate.value = today;
  overtimeStore.setFilterDates(firstDayOfMonth, today);

  // 초과 근무 이력 1페이지 조회
  overtimeStore.fetchOvertime(1);
});
</script>

<style scoped src="@/assets/styles/attendance/attendance-common.css"></style>
<style scoped src="@/assets/styles/attendance/attendance-overtime.css"></style>

