<!--
 * <pre>
 * Vue Name : AnalyticsStructureTab.vue
 * Description     : 급여 보고서(관리자) - 구조 분석 탭 (Composition 연동)
 *
 * History
 *   2026/01/02 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-report-structure-tab
 * @author 동근
 * @version 1.0
-->
<template>
  <div class="report-tab">
    <div class="grid-2">
      <div class="card">
        <div class="card-title">부서별 인건비 비율</div>

        <div class="card-body">
          <div v-if="isLoading" class="empty">로딩 중...</div>
          <div v-else-if="isError" class="error">
            <div class="err-title">데이터를 불러오지 못했습니다.</div>
            <div class="err-desc">{{ store.errorMessage ?? '잠시 후 다시 시도해주세요.' }}</div>
            <button class="btn-retry" type="button" @click="reload">재시도</button>
          </div>
          <div v-else-if="deptShare.length === 0" class="empty">표시할 데이터가 없습니다.</div>

          <div v-else class="dept-share-wrap">
            <div class="pie-wrap">
              <canvas ref="deptPieRef" class="pie-canvas"></canvas>
            </div>
            <div class="legend">
              <div v-for="r in deptShareTop" :key="r.departmentId" class="legend-row">
                <div class="legend-left">
                  <span class="dot"></span>
                  <span class="name">{{ r.departmentName }}</span>
                </div>
                <div class="legend-right">
                  <span class="pct">{{ formatPct(r.sharePct) }}</span>
                  <span class="amt">{{ formatWon(r.laborCostTotal) }}</span>
                </div>
              </div>
              <div v-if="deptShare.length > deptShareTopLimit" class="legend-more">
                * 상위 {{ deptShareTopLimit }}개만 표시 (나머지는 차트에 포함)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">수당 · 공제 항목 요약</div>

        <div class="card-body">
          <div v-if="isLoading" class="empty">로딩 중...</div>
          <div v-else-if="isError" class="error">
            <div class="err-title">데이터를 불러오지 못했습니다.</div>
            <div class="err-desc">{{ store.errorMessage ?? '잠시 후 다시 시도해주세요.' }}</div>
            <button class="btn-retry" type="button" @click="reload">재시도</button>
          </div>
          <div v-else class="item-grid">
            <div class="mini">
              <div class="mini-title">
                수당 Top 3
                <span class="mini-sub">총 {{ formatWon(allowanceTotal) }}</span>
              </div>

              <div v-if="allowance.length === 0" class="mini-empty">데이터 없음</div>
              <table v-else class="history-table history-table--compact">
                <thead>
                  <tr class="table-header">
                    <th>항목</th>
                    <th class="right">총액</th>
                    <th class="right">비율</th>
                  </tr>
                </thead>
                <tbody class="table-body">
                  <tr v-for="r in allowanceTop" :key="r.itemCode">
                    <td class="name">{{ r.itemName }}</td>
                    <td class="right">{{ formatWon(r.amountTotal) }}</td>
                    <td class="right">{{ formatPct(r.sharePct) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mini">
              <div class="mini-title">
                공제 Top 3
                <span class="mini-sub">총 {{ formatWon(deductionTotal) }}</span>
              </div>

              <div v-if="deduction.length === 0" class="mini-empty">데이터 없음</div>
              <table v-else class="history-table history-table--compact">
                <thead>
                  <tr class="table-header">
                    <th>항목</th>
                    <th class="right">총액</th>
                    <th class="right">비율</th>
                  </tr>
                </thead>
                <tbody class="table-body">
                  <tr v-for="r in deductionTop" :key="r.itemCode">
                    <td class="name">{{ r.itemName }}</td>
                    <td class="right">{{ formatWon(r.amountTotal) }}</td>
                    <td class="right">{{ formatPct(r.sharePct) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt">
      <div class="card-title">부담 종류</div>
      <div class="card-body">
        <div v-if="isLoading" class="empty">로딩 중...</div>
        <div v-else-if="isError" class="error">
          <div class="err-title">데이터를 불러오지 못했습니다.</div>
          <div class="err-desc">{{ store.errorMessage ?? '잠시 후 다시 시도해주세요.' }}</div>
          <button class="btn-retry" type="button" @click="reload">재시도</button>
        </div>
        <div v-else-if="burden.length === 0" class="empty">표시할 데이터가 없습니다.</div>

        <div v-else class="table-wrap">
          <table class="history-table">
            <thead>
              <tr class="table-header">
                <th>공제 항목</th>
                <th class="right">근로자 부담</th>
                <th class="right">회사 부담</th>
                <th class="right">합계</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="r in burden" :key="r.deductionId">
                <td class="name">{{ r.deductionName }}</td>
                <td class="right">{{ formatWon(r.employeeAmount) }}</td>
                <td class="right">{{ formatWon(r.employerAmount) }}</td>
                <td class="right">{{ formatWon(r.totalAmount) }}</td>
              </tr>

              <tr class="total-row">
                <td class="name">총계</td>
                <td class="right">{{ formatWon(burdenTotals.employee) }}</td>
                <td class="right">{{ formatWon(burdenTotals.employer) }}</td>
                <td class="right">{{ formatWon(burdenTotals.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card mt">
      <div class="card-title">급여 구성 변화</div>
      <div class="card-desc">
        최근 {{ trendMonths }}개월 월별 구성 스택 차트
      </div>
      <div class="card-body">
        <div v-if="isLoading" class="empty">로딩 중...</div>
        <div v-else-if="isError" class="error">
          <div class="err-title">데이터를 불러오지 못했습니다.</div>
          <div class="err-desc">{{ store.errorMessage ?? '잠시 후 다시 시도해주세요.' }}</div>
          <button class="btn-retry" type="button" @click="reload">재시도</button>
        </div>
        <div v-else-if="stackTrend.length === 0" class="empty">표시할 데이터가 없습니다.</div>

        <div v-else class="stack-wrap">
          <canvas ref="stackBarRef" class="stack-canvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Chart } from 'chart.js/auto';

import { usePayrollAnalyticsStore } from '@/stores/payroll/payrollAnalytics.store';
import type {
  PayrollAnalyticsCompositionDeptShareRow,
  PayrollAnalyticsCompositionItemRow,
  PayrollAnalyticsCompositionBurdenRow,
  PayrollAnalyticsCompositionMonthStackRow,
} from '@/types/payroll/payroll-analytics.types';

const props = defineProps<{ month: string }>();

const store = usePayrollAnalyticsStore();
const trendMonths = 6;
const composition = computed(() => store.composition);

const deptShare = computed<PayrollAnalyticsCompositionDeptShareRow[]>(() => composition.value?.deptShare ?? []);
const allowance = computed<PayrollAnalyticsCompositionItemRow[]>(() => composition.value?.items?.allowance ?? []);
const deduction = computed<PayrollAnalyticsCompositionItemRow[]>(() => composition.value?.items?.deduction ?? []);
const burden = computed<PayrollAnalyticsCompositionBurdenRow[]>(() => composition.value?.burden ?? []);
const stackTrend = computed<PayrollAnalyticsCompositionMonthStackRow[]>(() => composition.value?.stackTrend ?? []);

const isLoading = computed(() => store.compositionState === 'loading');
const isError = computed(() => store.compositionState === 'error');
const deptShareTopLimit = 8;
const deptShareTop = computed(() => deptShare.value.slice(0, deptShareTopLimit));

const ITEM_TOP_LIMIT = 3;

const allowanceTop = computed(() => allowance.value.slice(0, ITEM_TOP_LIMIT));
const deductionTop = computed(() => deduction.value.slice(0, ITEM_TOP_LIMIT));

const allowanceTotal = computed(() => allowance.value.reduce((a, r) => a + (r.amountTotal ?? 0), 0));
const deductionTotal = computed(() => deduction.value.reduce((a, r) => a + (r.amountTotal ?? 0), 0));

const burdenTotals = computed(() => {
  const employee = burden.value.reduce((a, r) => a + (r.employeeAmount ?? 0), 0);
  const employer = burden.value.reduce((a, r) => a + (r.employerAmount ?? 0), 0);
  const total = burden.value.reduce((a, r) => a + (r.totalAmount ?? 0), 0);
  return { employee, employer, total };
});
async function reload() {
  await store.loadComposition(props.month, trendMonths);
  await nextTick();
  renderDeptPie();
  renderStackBar();
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
function formatWon(v?: number | null) {
  const n = typeof v === 'number' ? v : 0;
  return `${new Intl.NumberFormat('ko-KR').format(n)}원`;
}
function formatPct(v?: number | null) {
  const n = typeof v === 'number' ? v : 0;
  return `${n.toFixed(2)}%`;
}

const deptPieRef = ref<HTMLCanvasElement | null>(null);
const stackBarRef = ref<HTMLCanvasElement | null>(null);

let deptPieChart: Chart | null = null;
let stackBarChart: Chart | null = null;

function destroyCharts() {
  if (deptPieChart) {
    deptPieChart.destroy();
    deptPieChart = null;
  }
  if (stackBarChart) {
    stackBarChart.destroy();
    stackBarChart = null;
  }
}

function renderDeptPie() {
  if (!deptPieRef.value) return;
  if (deptShare.value.length === 0) return;

  if (deptPieChart) {
    deptPieChart.destroy();
    deptPieChart = null;
  }

  const ctx = deptPieRef.value.getContext('2d');
  if (!ctx) return;

  const rows = deptShare.value;
  const top = rows.slice(0, deptShareTopLimit);
  const rest = rows.slice(deptShareTopLimit);

  const labels = [...top.map((r) => r.departmentName), ...(rest.length ? ['기타'] : [])];
  const data = [
    ...top.map((r) => r.laborCostTotal ?? 0),
    ...(rest.length ? [rest.reduce((a, r) => a + (r.laborCostTotal ?? 0), 0)] : []),
  ];

  deptPieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          label: '인건비',
          data,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
                cutout: '62%',
      plugins: {
        legend: { display: false },
        
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label ?? '';
              const value = context.parsed ?? 0;
              return `${label}: ${formatWon(Number(value))}`;
            },
          },
        },
      },
    },
  });
}

function renderStackBar() {
  if (!stackBarRef.value) return;
  if (stackTrend.value.length === 0) return;

  if (stackBarChart) {
    stackBarChart.destroy();
    stackBarChart = null;
  }

  const ctx = stackBarRef.value.getContext('2d');
  if (!ctx) return;

  const rows = stackTrend.value;
  const labels = rows.map((r) => r.month);
  const base = rows.map((r) => r.baseTotal ?? 0);
  const allowanceTotal = rows.map((r) => r.allowanceTotal ?? 0);
  const overtime = rows.map((r) => r.overtimeTotal ?? 0);
  const bonus = rows.map((r) => r.bonusTotal ?? 0);
  const deductionNeg = rows.map((r) => -1 * (r.deductionTotal ?? 0));

  stackBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: '기본급', data: base, stack: 'total', borderWidth: 1 },
        { label: '수당', data: allowanceTotal, stack: 'total', borderWidth: 1 },
        { label: '연장', data: overtime, stack: 'total', borderWidth: 1 },
        { label: '상여', data: bonus, stack: 'total', borderWidth: 1 },
        { label: '공제', data: deductionNeg, stack: 'total', borderWidth: 1 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      datasets: {
        bar: {
          categoryPercentage: 0.6,
          barPercentage: 0.6,
        },
      },
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label ?? '';
              const raw = Number(context.parsed?.y ?? 0);
              const v = label === '공제' ? Math.abs(raw) : raw;
              return `${label}: ${formatWon(v)}`;
            },
          },
        },
      },
      scales: {
        x: { stacked: true, grid: { display: false } },
        y: {
          stacked: true,
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
  () => [deptShare.value, stackTrend.value],
  async () => {
    await nextTick();
    renderDeptPie();
    renderStackBar();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  destroyCharts();
});
</script>

<style scoped>
.report-tab { padding: 0 20px; }

.grid-2 {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 12px;
}

.card {
  border: 1px solid #eef2f7;
  border-radius: 12px;
  background: #fff;
  padding: 16px;
}

.mt { margin-top: 12px; }

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.card-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
}

.card-body { margin-top: 12px; }

.empty {
  padding: 22px 12px;
  border-radius: 10px;
  border: 1px dashed #e2e8f0;
  text-align: center;
  color: #94a3b8;
  font-weight: 900;
  font-size: 13px;
}

.error {
  padding: 18px 12px;
  border-radius: 10px;
  border: 1px solid #fee2e2;
  background: #fff;
  text-align: center;
}
.err-title { font-size: 13px; font-weight: 900; color: #0f172a; }
.err-desc { margin-top: 4px; font-size: 12px; font-weight: 800; color: #64748b; line-height: 1.5; }

.btn-retry {
  margin-top: 10px;
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
.btn-retry:hover { background: #f8fafc; }

/* dept share */
.dept-share-wrap {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 12px;
  align-items: stretch;
}

.pie-wrap {
  height: 220px;
  border: 1px solid #eef2f7;
  border-radius: 10px;
  overflow: hidden;
  padding: 8px;
}
.pie-canvas { width: 100%; height: 100%; display: block; }

.legend { padding: 4px 2px; }
.legend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 0;
  border-top: 1px dashed #e2e8f0;
}
.legend-row:first-child { border-top: 0; }
.legend-left { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }
.dot { width: 8px; height: 8px; border-radius: 999px; background: #94a3b8; flex: 0 0 auto; }
.name { font-size: 12px; font-weight: 900; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.legend-right { display: inline-flex; align-items: baseline; gap: 10px; }
.pct { font-size: 12px; font-weight: 900; color: #334155; }
.amt { font-size: 11px; font-weight: 800; color: #64748b; }
.legend-more { margin-top: 6px; font-size: 11px; font-weight: 800; color: #94a3b8; }
.item-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.mini { border: 1px solid #eef2f7; border-radius: 10px; overflow: hidden; }
.mini-title {
  padding: 10px 12px;
  border-bottom: 1px solid #eef2f7;
  font-size: 12px;
  font-weight: 900;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mini-sub { font-size: 11px; font-weight: 800; color: #64748b; }

.mini-empty { padding: 16px 12px; text-align: center; color: #94a3b8; font-weight: 900; font-size: 12px; }
.table-wrap { border: 1px solid #eef2f7; overflow: hidden; }
.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.history-table th,
.history-table td {
  text-align: left;
  padding: 12px;
}
.right { text-align: right; font-weight: 900; }
.table-header {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: #fff;
}
.table-header th { color: #fff; }
.history-table td.right { color: #0f172a; }
.name { font-weight: 900; color: #0f172a; }
.history-table--compact th,
.history-table--compact td {
  padding: 10px 12px;
  font-size: 12px;
}
.total-row td {
  background: #f8fafc;
  font-weight: 900;
}

.stack-wrap {
  height: 300px;
  border: 1px solid #eef2f7;
  border-radius: 10px;
  overflow: hidden;
  padding: 8px;
}
.stack-canvas { width: 100%; height: 100%; display: block; }

.note {
  margin-top: 10px;
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  line-height: 1.45;
  grid-column: 1 / -1;
}


@media (max-width: 1100px) {
  .grid-2 { grid-template-columns: 1fr; }
  .dept-share-wrap { grid-template-columns: 1fr; }
  .item-grid { grid-template-columns: 1fr; }
  .stack-wrap { height: 280px; }
}
</style>
