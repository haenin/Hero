<!-- 
  <pre>
  TypeScript Name   : VacationHistory.vue
  Description : 개인 휴가 이력 조회 페이지
                - 상단 요약 카드(총 연차 / 사용 연차 / 남은 연차 / 소멸 예정)
                - 기간 필터(시작일 / 종료일) + 검색 / 초기화 버튼
                - 휴가 이력 테이블 + 페이지네이션

  History
  2025/12/16(이지윤) 최초 작성
  2026/01/01 - (지윤) 페이지네이션 디자인 수정
  2026/01/06 - (지윤) 디자인 수정
  </pre>

  @author 이지윤
  @version 1.3
-->

<template>
  <div class="attendance-wrapper vacation-history">
    <div class="attendance-page">
      <!-- 상단 요약 카드 4개 (공통 summary-card 구조로 맞춤) -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-title">총 연차</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ totalAnnualLeave }}</span>
            <span class="summary-unit">일</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-title">사용 연차</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ usedLeave }}</span>
            <span class="summary-unit">일</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-title">남은 연차</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ remainingLeave }}</span>
            <span class="summary-unit">일</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-title">소멸 예정</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ expiringLeave }}</span>
            <span class="summary-unit">일</span>
          </div>
        </div>
      </div>

      <!-- 패널(표준 panel + panel-body) -->
      <div class="panel vacation-panel">
        <div class="panel-body">
          <!-- 검색 영역(표준) -->
          <div class="panel-search">
            <div class="panel-search-inner">
              <p class="search-info"></p>

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

          <!-- 테이블 + 페이지네이션(표준 attendance-table + pagination) -->
          <div class="panel-table-wrapper">
            <div class="panel-table">
              <table class="attendance-table vacation-table">
                <thead>
                  <tr>
                    <th class="col-period">휴가 기간</th>
                    <th class="col-type">휴가 종류</th>
                    <th class="col-reason">휴가 사유</th>
                    <th class="col-status">승인 현황</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="(row, index) in uiRows"
                    :key="row.key"
                    :class="{ 'row-striped': index % 2 === 1 }"
                  >
                    <td class="cell-period">
                      {{ row.period }}
                    </td>

                    <td class="cell-type">
                      <span >
                        {{ row.type }}
                      </span>
                    </td>

                    <td class="cell-reason">
                      {{ row.reason }}
                    </td>

                    <td class="cell-status">
                      <!-- ✅ 승인현황은 표준 뱃지 느낌으로 (페이지 전용 CSS에서 정의) -->
                      <span class="approval-pill" :class="row.statusClass">
                        {{ row.statusLabel }}
                      </span>
                    </td>
                  </tr>

                  <tr v-if="!loading && uiRows.length === 0">
                    <td colspan="4" class="empty-row">
                      조회된 휴가 이력이 없습니다.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 페이지네이션(표준 패턴) -->
            <div v-if="totalPages > 0" class="pagination">
              <button
                type="button"
                class="page-button arrow-button"
                :disabled="currentPage === 1"
                @click="goPage(currentPage - 1)"
              >
                ‹
              </button>

              <button
                v-if="prevPage !== null"
                type="button"
                class="page-button"
                @click="goPage(prevPage)"
              >
                {{ prevPage }}
              </button>

              <button type="button" class="page-button page-active" disabled>
                {{ currentPage }}
              </button>

              <button
                v-if="nextPage !== null"
                type="button"
                class="page-button"
                @click="goPage(nextPage)"
              >
                {{ nextPage }}
              </button>

              <button
                type="button"
                class="page-button arrow-button"
                :disabled="currentPage >= totalPages"
                @click="goPage(currentPage + 1)"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useVacationHistoryStore } from '@/stores/vacation/vacationHistory';
import { useVacationSummaryStore } from '@/stores/vacation/vacationSummary';

const today = new Date().toISOString().slice(0, 10);
const minDate = '2025-01-01';

const vacationStore = useVacationHistoryStore();
const {
  vacationList,
  currentPage,
  totalPages,
  startDate,
  endDate,
  loading,
} = storeToRefs(vacationStore);

const vacationSummaryStore = useVacationSummaryStore();
const {
  totalAnnualLeave,
  usedLeave,
  remainingLeave,
  expiringLeave,
} = storeToRefs(vacationSummaryStore);

/** 안전 totalPages */
const safeTotalPages = computed<number>(() => Math.max(1, totalPages.value || 0));

const formatPeriod = (from: string, to: string): string => {
  if (!from) return '-';
  if (!to || from === to) return from;
  return `${from} ~ ${to}`;
};

/** 승인 상태 표기/색상 매핑 (PENDING/APPROVED/REJECTED 기준) */
const mapApprovalStatus = (status: string): { label: string; className: string } => {
  switch (status) {
    case 'APPROVED':
      return { label: '승인', className: 'approval-approved' };
    case 'REJECTED':
      return { label: '반려', className: 'approval-rejected' };
    case 'PENDING':
    default:
      return { label: '진행중', className: 'approval-pending' };
  }
};

interface UiRow {
  key: string;
  period: string;
  type: string;
  reason: string;
  statusLabel: string;
  statusClass: string;
}

const uiRows = computed<UiRow[]>(() => {
  return (vacationList.value ?? []).map((v, idx) => {
    const mapped = mapApprovalStatus(v.approvalStatus);

    return {
      key: `${v.startDate}-${v.endDate}-${v.vacationTypeName}-${idx}`,
      period: formatPeriod(v.startDate, v.endDate),
      type: v.vacationTypeName,
      reason: v.reason,
      statusLabel: mapped.label,
      statusClass: mapped.className,
    };
  });
});

onMounted(async () => {
  await Promise.all([
    vacationSummaryStore.fetchVacationSummary(),
    vacationStore.fetchVacationHistory(1),
  ]);
});

const onSearch = async (): Promise<void> => {
  await vacationStore.fetchVacationHistory(1);
};

const onReset = async (): Promise<void> => {
  await vacationStore.resetFilters();
};

const prevPage = computed<number | null>(() => {
  return currentPage.value > 1 ? currentPage.value - 1 : null;
});

const nextPage = computed<number | null>(() => {
  // totalPages가 0일 때 흔들리지 않게 safeTotalPages 기준 사용해도 됨
  return currentPage.value < (totalPages.value || 0) ? currentPage.value + 1 : null;
});

const goPage = async (page: number): Promise<void> => {
  if (page < 1 || page > safeTotalPages.value) return;
  await vacationStore.fetchVacationHistory(page);
};
</script>

<!-- ✅ 공통 -->
<style scoped src="@/assets/styles/attendance/attendance-common.css"></style>
<style scoped src="@/assets/styles/vacation/vacation-history.css"></style>

