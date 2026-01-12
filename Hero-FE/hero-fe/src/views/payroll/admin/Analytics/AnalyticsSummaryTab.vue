<!--
 * <pre>
 * Vue Name : AnalyticsSummaryTab.vue
 * Description     : 급여 보고서(관리자) - 전체 요약 탭 (Overview 연동)
 *
 * History
 *   2026/01/02 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-report-summary-tab
 * @author 동근
 * @version 1.0
-->
<template>
  <div class="report-tab">
    <div class="card-grid">
      <div class="stat-card">
        <div class="label">대상 인원</div>
        <div class="value">
          <span v-if="isLoading">-</span>
          <span v-else>{{ formatInt(kpi?.headcount) }}명</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="label">총 급여액</div>
        <div class="value">
          <span v-if="isLoading">-</span>
          <span v-else>{{ formatWon(kpi?.grossTotal) }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="label">총 공제액</div>
        <div class="value">
          <span v-if="isLoading">-</span>
          <span v-else>{{ formatWon(kpi?.deductionTotal) }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="label">총 인건비 (회사 비용)</div>
        <div class="value">
          <span v-if="isLoading">-</span>
          <span v-else>{{ formatWon(kpi?.laborCostTotal) }}</span>
        </div>
      </div>
    </div>

    <div class="chart-card mt">
      <div class="chart-title">월별 총 인건비 추이</div>
      <div class="chart-body">
        <div v-if="isLoading" class="chart-empty">로딩 중...</div>
        <div v-else-if="isError" class="chart-error">
          <div class="err-title">데이터를 불러오지 못했습니다.</div>
          <div class="err-desc">{{ store.errorMessage ?? '잠시 후 다시 시도해주세요.' }}</div>
          <button class="btn-retry" type="button" @click="reload">재시도</button>
        </div>
        <div v-else-if="!trend || trend.length === 0" class="chart-empty">표시할 데이터가 없습니다.</div>
        <div v-else-if="!hasSelectedMonthData" class="chart-empty">
          선택한 월({{ props.month }}) 데이터가 없습니다.
        </div>
        <canvas v-else ref="canvasRef" class="chart-canvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Chart } from 'chart.js/auto';

import { usePayrollAnalyticsStore } from '@/stores/payroll/payrollAnalytics.store';
import type { PayrollAnalyticsOverviewTrendPoint } from '@/types/payroll/payroll-analytics.types';

const props = defineProps<{
  month: string;
}>();

const store = usePayrollAnalyticsStore();

const TREND_MONTHS = 6;

const overview = computed(() => store.overview);
const kpi = computed(() => overview.value?.kpi ?? null);
const trend = computed(() => overview.value?.trend ?? []);
const hasSelectedMonthData = computed(() => {
  const m = props.month;
  return trend.value?.some((r) => r.month === m) ?? false;
});

const isLoading = computed(() => store.overviewState === 'loading');
const isError = computed(() => store.overviewState === 'error');
async function reload() {
  await store.loadOverview(props.month, TREND_MONTHS);
  await nextTick();
  renderChart();
}

onMounted(async () => {
  await reload();
});

watch(
  () => props.month,
  async () => {
    await reload();
  }
);
function formatInt(v?: number | null) {
  const n = typeof v === 'number' ? v : 0;
  return new Intl.NumberFormat('ko-KR').format(n);
}

function formatWon(v?: number | null) {
  const n = typeof v === 'number' ? v : 0;
  return `${new Intl.NumberFormat('ko-KR').format(n)}원`;
}

function formatPct(v?: number | null) {
  if (v === null || v === undefined) return '-';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}
const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

function destroyChart() {
  if (chart) {
    chart.destroy();
    chart = null;
  }
}

function buildTooltipLabel(p: PayrollAnalyticsOverviewTrendPoint | undefined) {
  if (!p) return '';
  const mom = p.momChangeRate;
    const momText =
    mom === null || mom === undefined
 ? '전월 대비 증감율: -'
 : `전월 대비 증감율: ${formatPct(mom)}`;
  return momText;
}

function renderChart() {
  destroyChart();

  if (!canvasRef.value) return;
  const rows = trend.value;
  if (!rows || rows.length === 0) return;
  if (!rows.some((r) => r.month === props.month)) return;

  const labels = rows.map((r) => r.month);
  const values = rows.map((r) => r.laborCostTotal);

  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '총 인건비',
          data: values,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const idx = context.dataIndex ?? 0;
              const row = rows[idx];
              const amount = context.parsed?.y ?? 0;
              const amountText = `총 인건비: ${formatWon(Number(amount))}`;
              const momText = buildTooltipLabel(row);
              return [amountText, momText];
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { maxRotation: 0, autoSkip: true },
          grid: { display: false },
        },
        y: {
          ticks: {
            callback: (v) => {
              const n = typeof v === 'number' ? v : Number(v);
              if (!Number.isFinite(n)) return '';
              return new Intl.NumberFormat('ko-KR').format(n);
            },
          },
        },
      },
    },
  });
}

watch(
  () => trend.value,
  async () => {
    await nextTick();
    renderChart();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  destroyChart();
});
</script>

<style scoped>
.report-tab {
  padding: 0 20px;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.stat-card {
  border: 1px solid #eef2f7;
  border-radius: 12px;
  background: #F8FAFC;
  padding: 14px;
}

.label {
  font-size: 18px;
  font-weight: 500;
  color: #334155;
}

.value {
  margin-top: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.hint {
  margin-top: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
}

.mt { margin-top: 12px; }
.chart-card {
  border: 1px solid #eef2f7;
  border-radius: 12px;
  background: #fff;
  padding: 14px;
  display: flex;
  flex-direction: column;
  min-height: 220px;
}

.chart-title {
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
}

.chart-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
}

.chart-body {
  margin-top: 10px;
  height: 450px;
  position: relative;
  border-radius: 10px;
  border: 1px solid #eef2f7;
  overflow: hidden;
}

.chart-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.chart-empty {
  height: 100%;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-weight: 900;
  font-size: 13px;
}

.chart-error {
  height: 100%;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  text-align: center;
}

.err-title {
  font-size: 13px;
  font-weight: 900;
  color: #0f172a;
}

.err-desc {
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
  line-height: 1.5;
}

.btn-retry {
  margin-top: 4px;
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 12px;
  font-weight: 900;
  color: #0f172a;
  cursor: pointer;
}

.btn-retry:hover {
  background: #f8fafc;
}

@media (max-width: 1100px) {
  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-card {
    min-height: 260px;
  }
}
</style>
