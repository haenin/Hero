<!--
 * <pre>
 * Vue Name : AnalyticsOrgTab.vue
 * Description     : 급여 보고서(관리자) - 조직별 분석 탭 (Organization 연동)
 *
 * History
 *   2026/01/02 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-report-org-tab
 * @author 동근
 * @version 1.0
-->
<template>
  <div class="report-tab">
    <div class="top-row">
      <div class="left-actions">
        <span class="filter-label">부서</span>
        <select v-model="selectedDeptKey" class="select">
          <option value="ALL">전체</option>
          <option v-for="d in deptOptions" :key="d.departmentId" :value="String(d.departmentId)">
            {{ d.departmentName }}
          </option>
        </select>
      </div>
      <div class="right-actions">
        <span class="filter-label">정렬</span>
        <select v-model="sortKey" class="select">
          <option value="headcount">인원</option>
          <option value="grossTotal">총 급여</option>
          <option value="deductionTotal">총 공제</option>
          <option value="netTotal">실 지급</option>
          <option value="momChangeRate">전월 대비</option>
        </select>
        <select v-model="sortOrder" class="select">
          <option value="DESC">내림차순</option>
          <option value="ASC">오름차순</option>
        </select>
      </div>
    </div>
    <div class="card-grid">
      <div class="stat-card">
        <div class="label">부서 인원</div>
        <div class="value">
          <span v-if="isLoading">-</span>
          <span v-else>{{ formatInt(kpi?.headcount) }}명</span>
        </div>
        <div class="hint">{{ kpiScopeText }}</div>
      </div>

      <div class="stat-card">
        <div class="label">부서 총 인건비</div>
        <div class="value">
          <span v-if="isLoading">-</span>
          <span v-else>{{ formatWon(kpi?.laborCostTotal) }}</span>
        </div>
        <div class="hint">{{ kpiScopeText }}</div>
      </div>

      <div class="stat-card">
        <div class="label">1인 평균 실 지급액</div>
        <div class="value">
          <span v-if="isLoading">-</span>
          <span v-else>{{ formatWon(kpi?.avgNetPay) }}</span>
        </div>
        <div class="hint">{{ kpiScopeText }}</div>
      </div>

      <div class="stat-card">
        <div class="label">부서 인건비 비중</div>
        <div class="value">
          <span v-if="isLoading">-</span>
          <span v-else>{{ formatPct(kpi?.laborCostSharePct) }}</span>
        </div>
        <div class="hint">전체 대비(%)</div>
      </div>
    </div>

    <div v-if="isError" class="error-block">
      <div class="err-title">데이터를 불러오지 못했습니다.</div>
      <div class="err-desc">{{ store.errorMessage ?? '잠시 후 다시 시도해주세요.' }}</div>
      <button class="btn-retry" type="button" @click="reload">재시도</button>
    </div>

    <div class="card mt">
      <div class="card-title">부서별 비교 테이블</div>

      <div class="card-body">
        <div v-if="isLoading" class="empty">로딩 중...</div>
        <div v-else-if="departments.length === 0" class="empty">표시할 데이터가 없습니다.</div>
        <div v-else class="table-wrap">
          <table class="history-table">
            <thead>
              <tr class="table-header">
                <th>부서명</th>
                <th class="right">인원</th>
                <th class="right">총 급여</th>
                <th class="right">총 공제</th>
                <th class="right">실 지급</th>
                <th class="right">전월 대비</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="r in sortedDepartments" :key="r.departmentId">
                <td class="name">{{ r.departmentName }}</td>
                <td class="right">{{ formatInt(r.headcount) }}</td>
                <td class="right">{{ formatWon(r.grossTotal) }}</td>
                <td class="right">{{ formatWon(r.deductionTotal) }}</td>
                <td class="right">{{ formatWon(r.netTotal) }}</td>
                <td
                  class="right"
                  :class="{ plus: (r.momChangeRate ?? 0) > 0, minus: (r.momChangeRate ?? 0) < 0 }"
                >
                  {{ formatPctSigned(r.momChangeRate) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card mt">
      <div class="card-title">부서별 인건비 구성</div>

      <div class="card-body">
        <div v-if="isLoading" class="empty">로딩 중...</div>
        <div v-else-if="deptStacks.length === 0" class="empty">표시할 데이터가 없습니다.</div>
        <div v-else class="chart-wrap">
          <canvas ref="deptStackRef" class="chart-canvas"></canvas>
        </div>
      </div>
    </div>

    <div class="grid-3 mt">
      <div class="card">
        <div class="card-title">실급여 상위 Top10</div>

        <div class="card-body">
          <div v-if="isLoading" class="empty">로딩 중...</div>
          <div v-else-if="netPayTop10.length === 0" class="empty">데이터 없음</div>
          <table v-else class="history-table history-table--compact">
            <thead>
              <tr class="table-header">
                <th>사원</th>
                <th>부서</th>
                <th class="right">실지급액</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="r in netPayTop10" :key="r.employeeId">
                <td class="name">{{ r.employeeName }}</td>
                <td class="muted">{{ r.departmentName }}</td>
                <td class="right">{{ formatWon(r.netPay) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-title">실급여 하위 Top10</div>
        <div class="card-body">
          <div v-if="isLoading" class="empty">로딩 중...</div>
          <div v-else-if="netPayBottom10.length === 0" class="empty">데이터 없음</div>
          <table v-else class="history-table history-table--compact">
            <thead>
              <tr class="table-header">
                <th>사원</th>
                <th>부서</th>
                <th class="right">실지급액</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="r in netPayBottom10" :key="r.employeeId">
                <td class="name">{{ r.employeeName }}</td>
                <td class="muted">{{ r.departmentName }}</td>
                <td class="right">{{ formatWon(r.netPay) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-title">공제율 상위 10명</div>

        <div class="card-body">
          <div v-if="isLoading" class="empty">로딩 중...</div>
          <div v-else-if="deductionRateTop10.length === 0" class="empty">데이터 없음</div>
          <table v-else class="history-table history-table--compact">
            <thead>
              <tr class="table-header">
                <th>사원</th>
                <th>부서</th>
                <th class="right">공제율</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="r in deductionRateTop10" :key="r.employeeId">
                <td class="name">{{ r.employeeName }}</td>
                <td class="muted">{{ r.departmentName }}</td>
                <td class="right">{{ formatPct(r.deductionRatePct) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chart } from 'chart.js/auto';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { usePayrollAnalyticsStore } from '@/stores/payroll/payrollAnalytics.store';

const props = defineProps<{ month: string }>();
const store = usePayrollAnalyticsStore();

const org = computed(() => store.organization);

const kpi = computed(() => org.value?.kpi ?? null);
const HIDDEN_DEPT_NAMES = new Set(['관리자 부서', '발령 대기 부서','경영지원본부','개발본부','영업본부']);

const departments = computed(() =>
  (org.value?.departments ?? []).filter((d) => !HIDDEN_DEPT_NAMES.has(d.departmentName))
);
const deptStacks = computed(() =>
  (org.value?.deptStacks ?? []).filter((d) => !HIDDEN_DEPT_NAMES.has(d.departmentName))
);

const netPayTop10 = computed(() => org.value?.netPayTop10 ?? []);
const netPayBottom10 = computed(() => org.value?.netPayBottom10 ?? []);
const deductionRateTop10 = computed(() => org.value?.deductionRateTop10 ?? []);

const isLoading = computed(() => store.organizationState === 'loading');
const isError = computed(() => store.organizationState === 'error');

const selectedDeptKey = ref<string>('ALL');

type DeptSortKey = 'headcount' | 'grossTotal' | 'deductionTotal' | 'netTotal' | 'momChangeRate';
type SortOrder = 'ASC' | 'DESC';

const sortKey = ref<DeptSortKey>('netTotal'); 
const sortOrder = ref<SortOrder>('DESC'); 

const sortedDepartments = computed(() => {
  const list = [...(departments.value ?? [])];
  const key = sortKey.value;
  const dir = sortOrder.value === 'ASC' ? 1 : -1;

  return list.sort((a, b) => {
    const av = (a as any)?.[key];
    const bv = (b as any)?.[key];
    const an = typeof av === 'number' ? av : (av == null ? -Infinity : Number(av));
    const bn = typeof bv === 'number' ? bv : (bv == null ? -Infinity : Number(bv));

    if (an === bn) return String(a.departmentName ?? '').localeCompare(String(b.departmentName ?? ''), 'ko');
    return (an - bn) * dir;
  });
});

const deptOptions = computed(() => {
  return (departments.value ?? []).map((d) => ({
    departmentId: d.departmentId,
    departmentName: d.departmentName,
  }));
});

const kpiScopeText = computed(() => {
  if (selectedDeptKey.value === 'ALL') return '전체 기준';
  const deptId = Number(selectedDeptKey.value);
  const found = deptOptions.value.find((d) => d.departmentId === deptId);
  return found ? `${found.departmentName} 기준` : '부서 기준';
});

async function reload() {
    const deptId =
    selectedDeptKey.value === 'ALL'
      ? undefined
      : Number(selectedDeptKey.value);
  await store.loadOrganization(props.month, deptId);
  await nextTick();
  renderDeptStack();
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

watch(
  () => selectedDeptKey.value,
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
  return `${v.toFixed(2)}%`;
}
function formatPctSigned(v?: number | null) {
  if (v === null || v === undefined) return '-';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

const deptStackRef = ref<HTMLCanvasElement | null>(null);
let deptStackChart: Chart | null = null;

function destroyChart() {
  if (deptStackChart) {
    deptStackChart.destroy();
    deptStackChart = null;
  }
}

function renderDeptStack() {
  destroyChart();
  if (!deptStackRef.value) return;
  if (deptStacks.value.length === 0) return;

  const ctx = deptStackRef.value.getContext('2d');
  if (!ctx) return;

  const rows = deptStacks.value;

  const deptMap = new Map(
    (departments.value ?? []).map((d) => [d.departmentId, d])
  );

  const labels = rows.map((r) => r.departmentName);
  const base = rows.map((r) => r.baseTotal ?? 0);
  const allowance = rows.map((r) => r.allowanceTotal ?? 0);
  const overtime = rows.map((r) => r.overtimeTotal ?? 0);
  const bonus = rows.map((r) => r.bonusTotal ?? 0);

  const deductionNeg = rows.map((r) => -1 * (r.deductionTotal ?? 0));


    const avgNetPay = rows.map((r) => {
    const d = deptMap.get(r.departmentId);
    const head = d?.headcount ?? 0;
    const net = d?.netTotal ?? 0;
    return head > 0 ? Math.round(net / head) : 0;
  });


  deptStackChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: '기본급', data: base, stack: 'total', borderWidth: 1, yAxisID: 'y' },
        { label: '수당', data: allowance, stack: 'total', borderWidth: 1, yAxisID: 'y' },
        { label: '연장', data: overtime, stack: 'total', borderWidth: 1, yAxisID: 'y' },
        { label: '상여', data: bonus, stack: 'total', borderWidth: 1, yAxisID: 'y' },
        { label: '공제', data: deductionNeg, stack: 'total', borderWidth: 1, yAxisID: 'y' },
        {
          type: 'line',
          label: '1인 평균 실지급액',
          data: avgNetPay,
          yAxisID: 'y2',
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label ?? '';
              const raw = Number(context.parsed?.y ?? 0);
              if (label === '공제') return `${label}: ${formatWon(Math.abs(raw))}`;
              return `${label}: ${formatWon(raw)}`;
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
        y2: {
          position: 'right',
          grid: { drawOnChartArea: false },
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
  () => deptStacks.value,
  async () => {
    await nextTick();
    renderDeptStack();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  destroyChart();
});
</script>

<style scoped>
.report-tab { padding: 0 20px; }

.top-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.left-actions,
.right-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.right-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.select {
  height: 34px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 13px;
  color: #0f172a;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.stat-card {
  border: 1px solid #eef2f7;
  border-radius: 12px;
  background: #F8FAFC;
  padding: 14px;
}

.label { font-size: 18px; font-weight: 500; color: #334155; }
.value { margin-top: 8px; font-size: 18px; font-weight: 700; color: #0f172a; }
.hint { margin-top: 6px; font-size: 11px; font-weight: 800; color: #94a3b8; }

.card {
  border: 1px solid #eef2f7;
  border-radius: 12px;
  background: #fff;
  padding: 16px 0;
}

.mt { margin-top: 12px; }

.card-title { font-size: 18px; font-weight: 700; color: #0f172a; padding-left:12px;}
.card-desc { margin-top: 4px; font-size: 12px; font-weight: 700; color: #64748b; }
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

.note {
  margin-top: 10px;
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  line-height: 1.45;
}

.table-wrap { border: 1px solid #eef2f7; overflow: hidden; }

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.history-table th,
.history-table td {
  text-align: left;
  padding: 12px 20px;
}

.history-table td:last-child,
.history-table th.right,
.history-table td.right {
  text-align: right;
}

.table-header {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: #fff;
}

.name { font-weight: 900; color: #0f172a; }
.muted { color: #64748b; font-weight: 800; }
.right { font-weight: 900; }

.plus { color: #16a34a; }
.minus { color: #b91c1c; }
.history-table td.right { color: #0f172a; }
.table-header th { color: #fff; }
.history-table--compact th,
.history-table--compact td {
  padding: 10px 12px;
  font-size: 12px;
}

.chart-wrap {
  height: 320px;
  border-radius: 10px;
  overflow: hidden;
  padding: 8px;
}
.chart-canvas { width: 100%; height: 100%; display: block; }

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.error-block {
  margin-top: 12px;
  padding: 14px 12px;
  border-radius: 12px;
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

@media (max-width: 1100px) {
  .card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-3 { grid-template-columns: 1fr; }
  .chart-wrap { height: 280px; }
}

</style>
