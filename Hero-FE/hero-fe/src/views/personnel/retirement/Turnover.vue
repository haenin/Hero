<!--
  <pre>
  (File => TypeScript / Vue) Name   : Turnover.vue
  Description : 이직률 및 퇴직 현황 대시보드 페이지
                - 퇴직 현황 요약 카드 (잔존율, 정착률, 이직률 등)
                - 차트 시각화 (사유별, 근속기간별, 신입 통계)
                - 부서별 이직률 테이블

  History
  2025/12/31 - 최초 작성
  </pre>

  @author Gemini
  @version 1.0
-->

<template>
  <div class="turnover-wrapper">
    <div class="turnover-page">

      <!-- 1. 상단 요약 카드 -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-title-row">
            <span class="summary-title">잔존율</span>
            <div class="tooltip-wrapper">
              <span class="info-icon">i</span>
              <span class="tooltip-text">최근 3년 전 재직 인원 중 현재까지 근무 중인 비율</span>
            </div>
          </div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ summary?.retentionRate ?? 0 }}</span>
            <span class="summary-unit">%</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-title-row">
            <span class="summary-title">종합 이직률</span>
            <div class="tooltip-wrapper">
              <span class="info-icon">i</span>
              <span class="tooltip-text">1년 전 재직 인원 대비 최근 1년간 발생한 퇴사자 비율</span>
            </div>
          </div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ summary?.totalTurnoverRate ?? 0 }}</span>
            <span class="summary-unit">%</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-title-row">
            <span class="summary-title">신입 정착률</span>
            <div class="tooltip-wrapper">
              <span class="info-icon">i</span>
              <span class="tooltip-text">최근 1년 입사자 중 3개월 이상 근무한 사원의 비율</span>
            </div>
          </div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ summary?.settlementRate ?? 0 }}</span>
            <span class="summary-unit">%</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-title-row">
            <span class="summary-title">신입 이직률 (1년 내)</span>
            <div class="tooltip-wrapper">
              <span class="info-icon">i</span>
              <span class="tooltip-text">최근 1년 내 입사한 신규 입사자 중 퇴사한 인원의 비율</span>
            </div>
          </div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ summary?.newHireTurnoverRate ?? 0 }}</span>
            <span class="summary-unit">%</span>
          </div>
        </div>
      </div>

      <!-- 2. 탭 및 컨텐츠 영역 -->
      <div class="panel">
        <!-- 탭 헤더 -->
        <div class="panel-header">
          <button
            class="tab tab-start"
            :class="{ 'active': activeTab === 'reason' }"
            @click="activeTab = 'reason'"
          >
            <div class="tooltip-wrapper" style="cursor: pointer;">
              퇴사 사유별 통계
              <span class="tooltip-text">전체 및 1년 미만 조기 퇴사자의 사유를 비교 분석합니다.</span>
            </div>
          </button>
          <button
            class="tab"
            :class="{ 'active': activeTab === 'tenure' }"
            @click="activeTab = 'tenure'"
          >
            <div class="tooltip-wrapper" style="cursor: pointer;">
              근속 기간별 분포
              <span class="tooltip-text">전체 재직 인원 중 해당 연차에 해당하는 인원의 비율</span>
            </div>
          </button>
          <button
            class="tab"
            :class="{ 'active': activeTab === 'newHire' }"
            @click="activeTab = 'newHire'"
          >
            <div class="tooltip-wrapper" style="cursor: pointer;">
              신입 이직률 통계
              <span class="tooltip-text" style="width: 220px; text-align: left;">정착률: 3개월 이상 재직 신입<br>이직률: 1년 내 퇴사 신입</span>
            </div>
          </button>
          <button
            class="tab tab-end"
            :class="{ 'active': activeTab === 'department' }"
            @click="activeTab = 'department'"
          >
            <div class="tooltip-wrapper" style="cursor: pointer;">
              부서별 이직률 현황
              <span class="tooltip-text">각 부서의 퇴사자 비율을 나타냅니다.</span>
            </div>
          </button>
        </div>

        <!-- 탭 바디 -->
        <div class="panel-body">
          <!-- Tab 1: 퇴사 사유 -->
          <div v-if="activeTab === 'reason'" class="full-height" style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; align-items: center; justify-content: flex-end;">
              <div class="toggle-group">
                <button
                  class="toggle-btn"
                  :class="{ active: reasonMode === 'early' }"
                  @click="reasonMode = 'early'"
                >
                  1년 미만
                </button>
                <button
                  class="toggle-btn"
                  :class="{ active: reasonMode === 'total' }"
                  @click="reasonMode = 'total'"
                >
                  전체
                </button>
              </div>
            </div>
            <div class="chart-container">
              <Doughnut v-if="reasonChartData" :data="reasonChartData" :options="doughnutOptions" />
            </div>
          </div>

          <!-- Tab 2: 근속 기간 -->
          <div v-if="activeTab === 'tenure'" class="full-height" style="display: flex; flex-direction: column;">
            <div class="chart-container">
              <div class="chart-y-label">비율 (%)</div>
              <Line
                v-if="tenureChartData"
                :data="tenureChartData"
                :options="tenureOptions"
              />
            </div>
          </div>

          <!-- Tab 3: 신입 통계 -->
          <div v-if="activeTab === 'newHire'" class="full-height" style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; align-items: center; justify-content: flex-end;">
              <select v-if="availableYears.length > 0" v-model="selectedYear" class="year-select">
                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}년</option>
              </select>
            </div>
            <div class="chart-container">
              <div class="chart-y-label">비율 (%)</div>
              <Bar v-if="newHireChartData" :data="newHireChartData" :options="newHireOptions" />
            </div>
          </div>

          <!-- Tab 4: 부서별 이직률 테이블 -->
          <div v-if="activeTab === 'department'" class="table-container">
            <div class="panel-table-wrapper">
              <table class="turnover-table">
                <thead>
                  <tr>
                    <th>부서명</th>
                    <th class="text-center">현재 인원</th>
                    <th class="text-center">퇴사 인원</th>
                    <th class="text-center">이직률</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in filteredDepartmentStats" :key="row.departmentName" :class="{ 'row-striped': index % 2 === 1 }">
                    <td>{{ row.departmentName }}</td>
                    <td class="text-center">{{ row.currentCount }}명</td>
                    <td class="text-center">{{ row.retiredCount }}명</td>
                    <td class="text-center">
                      <span :class="getTurnoverClass(row.turnoverRate)">
                        {{ row.turnoverRate }}%
                      </span>
                    </td>
                  </tr>
                  <tr v-if="filteredDepartmentStats.length === 0">
                    <td colspan="4" class="empty-row">데이터가 없습니다.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'vue-chartjs';

import { useRetirementStore } from '@/stores/retirement/retirement.store';
import type { ExitReasonStatDTO, TenureDistributionDTO, NewHireStatDTO } from '@/types/retirement/retirement.types';

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement, Filler);

// --- State ---
const store = useRetirementStore();
const { summary, earlyLeavers, totalLeavers, tenureStats, newHireStats, departmentStats } = storeToRefs(store);

// --- Tab State ---
const activeTab = ref('reason'); // 'reason' | 'tenure' | 'newHire' | 'department'

// --- Reason Chart Mode ---
const reasonMode = ref<'early' | 'total'>('early');

// --- Year Filter State ---
const selectedYear = ref('');

const availableYears = computed(() => {
  if (!newHireStats.value.length) return [];
  const years = new Set(newHireStats.value.map((item: NewHireStatDTO) => item.quarter.split('년')[0]));
  return Array.from(years).sort((a, b) => Number(b) - Number(a));
});

watch(availableYears, (years) => {
  if (years.length > 0 && !selectedYear.value) {
    selectedYear.value = years[0];
  }
}, { immediate: true });

// --- API Call ---
onMounted(() => {
  store.fetchRetirementData();
});

// --- Chart Data Computeds ---

// 1. 사유별 퇴직 통계 (Doughnut)
const reasonChartData = computed(() => {
  const data = reasonMode.value === 'early' ? earlyLeavers.value : totalLeavers.value;
  if (!data || !data.length) return null;
  const colors = ['#1c398e', '#16a34a', '#eab308', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899', '#f97316'];
  return {
    labels: data.map((item: ExitReasonStatDTO) => `${item.reasonName} (${item.count}명)`),
    datasets: [
      {
        backgroundColor: data.map((_: ExitReasonStatDTO, i: number) => colors[i % colors.length]),
        data: data.map((item: ExitReasonStatDTO) => item.count),
        hoverOffset: 4
      }
    ]
  };
});

// 2. 근속 기간별 잔존율 (BaseLineChart용 데이터)
const tenureLabels = computed(() => tenureStats.value.map((item: TenureDistributionDTO) => item.tenureRange));
const tenureData = computed(() => tenureStats.value.map((item: TenureDistributionDTO) => item.percentage));

const tenureChartData = computed(() => {
  if (tenureStats.value.length === 0) return null;
  return {
    labels: tenureLabels.value,
    datasets: [
      {
        label: '비율',
        data: tenureData.value,
        borderColor: '#1c398e',
        backgroundColor: 'rgba(28, 57, 142, 0.1)',
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#1c398e',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.3
      }
    ]
  };
});

// 3. 신입 정착률/이직률 (Bar - Multi Dataset)
const newHireChartData = computed(() => {
  if (!selectedYear.value) return null;

  // 1~4분기 고정 레이블 생성 (오름차순)
  const quarters = ['1분기', '2분기', '3분기', '4분기'];
  const labels = quarters.map(q => `${selectedYear.value}년 ${q}`);

  // 해당 연도 데이터 필터링
  const yearStats = newHireStats.value.filter((item: NewHireStatDTO) => item.quarter.startsWith(selectedYear.value));

  return {
    labels,
    datasets: [
      {
        label: '정착률 (%)',
        backgroundColor: '#16a34a', // Green
        data: labels.map(label => {
          const stat = yearStats.find((item: NewHireStatDTO) => item.quarter === label);
          return stat ? stat.settlementRate : null;
        }),
        borderRadius: 4,
      },
      {
        label: '이직률 (%)',
        backgroundColor: '#ef4444', // Red
        data: labels.map(label => {
          const stat = yearStats.find((item: NewHireStatDTO) => item.quarter === label);
          return stat ? stat.turnoverRate : null;
        }),
        borderRadius: 4,
      }
    ]
  };
});

// 4. 부서별 이직률 테이블 데이터 (본부 제외)
const filteredDepartmentStats = computed(() => {
  if (!departmentStats.value) return [];
  return departmentStats.value.filter((stat: any) => !stat.departmentName.includes('본부'));
});

// --- Chart Options ---
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: { family: 'Inter-Regular', size: 12 }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#e2e8f0' },
      ticks: { 
        font: { family: 'Inter-Regular', size: 11 },
        color: '#64748b'
      }
    },
    x: {
      grid: { display: false },
      ticks: { 
        font: { family: 'Inter-Regular', size: 11 },
        color: '#64748b',
      },
      title: {
        display: false,
        color: '#64748b',
        font: {
          size: 12,
          weight: 'bold'
        },
        padding: { top: 10 }
      }
    }
  }
};

const barOptions = { ...commonOptions };
const newHireOptions = {
  ...commonOptions,
  layout: {
    padding: {
      left: 10,
      right: 20,
      top: 20,
      bottom: 10
    }
  },
  scales: {
    ...commonOptions.scales,
    y: {
      ...commonOptions.scales.y,
      title: {
        display: false,
        text: '비율 (%)',
        color: '#64748b',
        font: {
          size: 12,
          weight: 'bold'
        },
        padding: { bottom: 10 }
      },
      ticks: {
        ...commonOptions.scales.y.ticks,
        callback: function(value: any) {
          return value + '%';
        }
      }
    },
    x: {
      ...commonOptions.scales.x,
      title: {
        ...commonOptions.scales.x.title,
        text: '기간 (분기)'
      }
    }
  }
};

const tenureOptions = {
  ...commonOptions,
  layout: {
    padding: {
      left: 10,
      right: 20,
      top: 20,
      bottom: 10
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context: any) => `비율: ${context.parsed.y}%`
      }
    }
  },
  scales: {
    ...commonOptions.scales,
    y: {
      ...commonOptions.scales.y,
      title: {
        display: false,
        text: '비율 (%)',
        color: '#64748b',
        font: {
          size: 12,
          weight: 'bold'
        },
        padding: { bottom: 10 }
      },
      ticks: {
        ...commonOptions.scales.y.ticks,
        callback: function(value: any) {
          return value + '%';
        }
      }
    },
    x: {
      ...commonOptions.scales.x,
      title: {
        ...commonOptions.scales.x.title,
        text: '근속 기간'
      }
    }
  }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: 20
  },
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: { family: 'Inter-Regular', size: 14 }
      }
    }
  }
};

// --- Helper ---
const getTurnoverClass = (rate: number) => {
  if (rate >= 20) return 'text-danger';
  if (rate >= 10) return 'text-warning';
  return 'text-success';
};
</script>

<style scoped>
* {
  font-size: 14px;
  font-family: "Inter-Regular", sans-serif;
  box-sizing: border-box;
}

.turnover-wrapper {
  display: flex;
  /* background-color: #f8fafc; */
  min-height: 100vh;
}

.turnover-page {
  width: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 1. 상단 요약 카드 */
.summary-cards {
  display: flex;
  align-items: stretch;
  gap: 20px;
}

.summary-card {
  flex: 1;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 12px 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  font-size: 18px;
}

.summary-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.summary-title {
  color: #64748b;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.2;
}

/* 툴팁 스타일 */
.tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: help;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #e2e8f0;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  font-family: serif;
  font-style: italic;
}

.tooltip-text {
  visibility: hidden;
  width: 220px;
  background-color: #334155;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 8px 10px;
  position: absolute;
  z-index: 100;
  bottom: 135%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  pointer-events: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  white-space: normal;
  word-break: keep-all;
}

/* 첫 번째 탭 툴팁 위치 조정 (사이드바 가림 방지) */
.tab-start .tooltip-text {
  left: 0;
  transform: none;
}

.tab-start .tooltip-text::after {
  left: 20px;
}

.tooltip-text::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #334155 transparent transparent transparent;
}

/* 요약 카드 툴팁 위치 조정 (헤더 가림 방지 - 아래로 표시) */
.summary-card .tooltip-text {
  bottom: auto;
  top: 135%;
}

.summary-card .tooltip-text::after {
  top: auto;
  bottom: 100%;
  border-color: transparent transparent #334155 transparent;
}

/* 첫 번째 요약 카드 툴팁 위치 조정 (사이드바 가림 방지) */
.summary-card:first-child .tooltip-text {
  left: 0;
  transform: none;
}

.summary-card:first-child .tooltip-text::after {
  left: 8px;
}

.tooltip-wrapper:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.summary-value-wrapper {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
}

.summary-unit {
  font-size: 18px;
  font-weight: 500;
  color: #64748b;
}

/* 2. 패널 및 탭 스타일 */
.panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: visible; /* 툴팁이 잘리지 않도록 overflow 속성 추가 */
}

.panel-header {
  display: inline-flex;
  flex-direction: row;
  position: relative; /* 툴팁이 panel-body 위에 표시되도록 z-index 컨텍스트 생성 */
  z-index: 1;
}

.tab {
  padding: 10px 18px;
  display: flex;
  align-items: center;
  justify-content: center;

  border-top: 1px solid #e2e8f0;
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;

  background: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  white-space: nowrap;
}

.tab-start {
  border-top-left-radius: 14px;
}

.tab-end {
  border-top-right-radius: 14px;
}

.tab.active {
  color: #ffffff;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.panel-body {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  padding: 24px;
  flex: 1;
  /* overflow-y: auto; */
}

.full-height {
  height: 100%;
  min-height: 500px;
}

.chart-container {
  flex: 1;
  position: relative;
  width: 100%;
  min-height: 280px;
}

/* 3. 테이블 컨테이너 */
.table-container {
  width: 100%;
}

.panel-table-wrapper {
  overflow-x: auto;
  margin-left: -24px;
  margin-right: -24px;
}

.turnover-table {
  width: 100%;
  border-collapse: collapse;
}

.turnover-table thead tr {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.turnover-table th {
  padding: 14px 24px;
  text-align: left;
  font-weight: 600;
  color: #ffffff;
  font-size: 14px;
}

.turnover-table td {
  padding: 16px 24px;
  color: #475569;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.turnover-table tbody tr:last-child td {
  border-bottom: none;
}

.turnover-table tbody tr.row-striped {
  background-color: #f8fafc;
}

.text-center {
  text-align: center;
}

.empty-row {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}

/* 이직률 상태 색상 */
.text-danger {
  color: #ef4444;
  font-weight: 600;
}

.text-warning {
  color: #f59e0b;
  font-weight: 600;
}

.text-success {
  color: #16a34a;
  font-weight: 600;
}

.year-select {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #334155;
  background-color: #fff;
  cursor: pointer;
  outline: none;
}

/* 토글 버튼 스타일 */
.toggle-group {
  display: flex;
  background-color: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
}

.toggle-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background-color: #ffffff;
  color: #1c398e;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.chart-y-label {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: bold;
  color: #64748b;
  z-index: 10;
  writing-mode: vertical-rl;
}
</style>