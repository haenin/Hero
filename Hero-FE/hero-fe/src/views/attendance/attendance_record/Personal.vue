<!--
  TypeScript Name   : AttendancePersonal.vue
  Description : 개인 근태 이력 페이지
                - 상단 요약 카드로 이번 달 근태 현황 요약
                - 탭을 통해 개인 근태 / 초과 근무 / 근태 정정 / 근무제 변경 이력 이동
                - 기간 필터 + 페이지네이션을 통한 개인 근태 이력 조회

  History
  2025/12/10 - (지윤) 최초 작성
  2025/12/29 - (지윤) 행 간격/테이블 정렬 및 근무시간 표시 형식 개선
  2025/12/30 - (지윤) 지연 근무 로직 추가 및 디자인 수정
  2025/12/30 - (지윤) 초과 근무 로직 추가
  2026/01/01 - (지윤) 페이지네이션 디자인 수정 및 필터링 부분 수정
  2026/01/03 - (지윤) 그래프 표시 부분 수정
  2026/01/05 - (지윤) 디자인 수정

  @author 이지윤
  @version 1.6
-->

<template>
  <div class="attendance-wrapper">
    <div class="attendance-page">
      <!-- 상단 요약 카드 5개 -->
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
        <!-- 상단 탭 (라우터 탭으로 동작) -->
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
          <!-- 검색 영역 (기간 필터) -->
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
                    <th>상태</th>
                    <th class="col-time">출근시간</th>
                    <th class="col-time">퇴근시간</th>
                    <th class="col-personal">근무시간</th>
                    <th>근무제</th>
                    <th>빠른 결재 작성</th>
                  </tr>
                </thead>

                <tbody>
                    <tr v-if="!personalList.length">
                    <td colspan="7" class="empty-row">
                    조회된 개인 근태 이력이 없습니다.
                    </td>
                      </tr>
                    <tr
                      v-for="(row, index) in personalList"
                      :key="row.attendanceId"
                      :class="{ 'row-striped': index % 2 === 1 }"
                    >
                    <td>{{ row.workDate }}</td>

                    <td>
                      <span
                        class="status-pill"
                        :class="{
                          'status-normal': row.state === '정상',
                          'status-late': row.state === '지각',
                          'status-absent': row.state === '결근',
                          'status-early': row.state === '조퇴'
                        }"
                      >
                        {{ row.state }}
                      </span>
                    </td>

                    <td class="time-cell">
                      {{ formatTime(row.startTime) }}
                    </td>
                    <td class="time-cell">
                      {{ formatTime(row.endTime) }}
                    </td>

                    <td class="duration-cell">
                      {{ formatWorkDuration(row.workDuration) }}
                    </td>

                    <td>{{ row.workSystemName }}</td>

                    <td class="action-cell">
                      <div class="action-button-group">
                        <button
                          type="button"
                          class="link-button"
                          @click="goToLateRequest(row)"
                        >
                          지연 출근 신청
                        </button>

                        <span class="action-divider">/</span>

                        <button
                          type="button"
                          class="link-button"
                          @click="goToOvertimeRequest(row)"
                        >
                          초과 근무 신청
                        </button>
                      </div>
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

              <!-- ✅ 최대 3개 페이지(표준처럼 1,2,3 형태 가능) -->
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
import { onMounted, computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAttendanceStore } from '@/stores/attendance/attendanceStore';

const attendanceStore = useAttendanceStore();
const route = useRoute();
const router = useRouter();

// 오늘 날짜
const now = new Date();
const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
const today = formatDate(now);

// 2025-01-01부터 선택 가능
const minDate = '2025-01-01';

// 이번 달 1일 (YYYY-MM-DD)
const firstDayOfMonth = formatDate(
  new Date(now.getFullYear(), now.getMonth(), 1),
);

const {
  personalList,
  startDate,
  endDate,
  currentPage,
  totalPages,
  workDays,
  todayWorkSystemName,
  lateCount,
  absentCount,
  earlyCount,
} = storeToRefs(attendanceStore);



const isActiveTab = (name: string): boolean => {
  return route.name === name;
};

const formatTime = (time?: string | null): string => {
  return time ? time.substring(0, 5) : '';
};

const visiblePages = computed<number[]>(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages: number[] = [];

  if (total <= 0) return pages;

  // total이 3 이하면 1..total
  if (total <= 3) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  // total > 3
  // 처음이면 1,2,3
  if (current <= 1) return [1, 2, 3];

  // 마지막이면 total-2, total-1, total
  if (current >= total) return [total - 2, total - 1, total];

  // 그 외는 current-1, current, current+1
  return [current - 1, current, current + 1];
});

const goPage = (page: number): void => {
  const maxPage = totalPages.value || 1;
  if (page < 1 || page > maxPage) return;

  attendanceStore.fetchPersonal(page);
};

const onSearch = (): void => {
  // 사용자가 입력한 기간을 그대로 store 필터에 반영
  attendanceStore.setFilterDates(startDate.value, endDate.value);
  attendanceStore.fetchPersonal(1);
};

const onReset = (): void => {
  // 필터를 이번 달 1일 ~ 오늘로 되돌림
  startDate.value = firstDayOfMonth;
  endDate.value = today;

  attendanceStore.setFilterDates(firstDayOfMonth, today);
  attendanceStore.fetchPersonal(1);
};

const formatWorkDuration = (minutes?: number | null): string => {
  if (minutes == null) return '';

  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return `${hours}시간`;
  }
  return `${hours.toFixed(1)}시간`;
};

onMounted(() => {
  // 최초 진입 시 기본 기간: 이번 달 1일 ~ 오늘
  startDate.value = firstDayOfMonth;
  endDate.value = today;

  attendanceStore.setFilterDates(firstDayOfMonth, today);
  attendanceStore.fetchPersonal(1);        // 기간에 맞는 개인 근태 이력
  attendanceStore.fetchPersonalSummary();  // 상단 요약 카드
});
type PersonalRow = {
  attendanceId: number;
  workDate: string;
  startTime?: string | null;
  endTime?: string | null;
};

const goToLateRequest = (row: any): void => {
  attendanceStore.setSelectdRow({
    attendanceId: row.attendanceId,
    workDate: row.workDate,
    startTime: row.startTime,
    endTime: row.endTime,
  });

  router.push({
    name: 'ApprovalCreate',
    params: { formName: 'modifyworkrecord' },
    query: {
      templateId: '5',
      attendanceId: String(row.attendanceId),
    },
  });
};

const goToOvertimeRequest = (row: any): void => {
  attendanceStore.setSelectdRow({
    attendanceId: row.attendanceId,
    workDate: row.workDate,
    startTime: row.startTime,
    endTime: row.endTime,
  });

  router.push({
    name: 'ApprovalCreate',
    params: { formName: 'overtime' },
    query: {
      templateId: '7',
      workDate: row.workDate,
    },
  });
};
</script>


<style scoped src="@/assets/styles/attendance/attendance-common.css"></style>
<style scoped src="@/assets/styles/attendance/attendance-personal.css"></style>



