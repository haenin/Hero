<!--
 * <pre>
 * Vue Name        : History.vue
 * Description     : 사원의 내 급여 이력 화면
 *
 * 기능
 *  - 최근 12개월 급여 요약 지표
 *  - 월별 실수령액 추이 라인 차트
 *  - 급여 내역(기본급/수당/공제/실수령액) 테이블 조회
 *
 * History
 *   2025/12/09 - 동근 최초 작성
 *   2026/01/04 - 동근 요약 카드 UI 수정
 * </pre>
 *
 * @module payroll-history
 * @author 동근
 * @version 1.1
-->
<template>
  <div class="pay-history-page">
    <!-- 요약 카드 -->
    <section v-if="history" class="history-cards">
        <div class="summary-card">
       <span class="summary-label">수당 비중</span>
    <p class="summary-value">{{ formatPercentOrDash(allowanceRate) }}</p>
  </div>

  <div class="summary-card">
    <span class="summary-label">공제 비중</span>
    <p class="summary-value">{{ formatPercentOrDash(deductionRate) }}</p>
  </div>

  <div class="summary-card">
    <span class="summary-label">전월 대비 증감액</span>
    <p class="summary-value" :class="momDeltaNetPayClass">
      {{ formatSignedMoneyOrDash(momDeltaNetPay) }}
    </p>
  </div>

  <div class="summary-card">
    <span class="summary-label">최근 3개월 평균 실수령액</span>
    <p class="summary-value">{{ formatMoneyOrDash(avgNetPay3m) }}</p>
  </div>

  <div class="summary-card">
    <span class="summary-label">최근 12개월 실수령액</span>
    <p class="summary-value">{{ formatMoneyOrDash(last12mNetPay) }}</p>
  </div>
    </section>

    <!-- 차트 -->
    <section v-if="history" class="history-chart">
      <h2 class="panel-title">급여 추이</h2>
      <BaseLineChart
        :labels="chartLabels"
        :data="chartData"
        tooltip-label-prefix="실수령액: "
        :currency="true"
      />
    </section>

    <!-- 테이블 표 -->
    <section v-if="history" class="history-table">
      <h2 class="panel-title">급여 이력</h2>

      <table>
        <thead>
          <tr class="table-header">
            <th>급여월</th>
            <th>기본급</th>
            <th>수당</th>
            <th>공제</th>
            <th class="net-pay-head">실수령액</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-for="row in history.rows" :key="row.salaryMonth">
            <td class="table-cell">{{ row.salaryMonth }}</td>
            <td>{{ formatMoney(row.baseSalary) }}</td>
            <td class="plus">+{{ formatMoney(row.allowanceTotal) }}</td>
            <td class="minus">-{{ formatMoney(row.deductionTotal) }}</td>
            <td >{{ formatMoney(row.netPay) }}</td>
          </tr>
        </tbody>
      </table>

      <p class="history-note">
        <br />
        · 급여 이력은 최근 12개월까지 조회 가능합니다. <br />
        · 상세 내역은 각 월의 급여명세서에서 확인하실 수 있습니다.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { usePayrollStore } from '@/stores/payroll/payrollMeStore';
import BaseLineChart from '@/components/charts/BaseLineChart.vue';

// store : loadHistory() -> API 호출
const store = usePayrollStore();
const history = computed(() => store.history);

// 컴포넌트 mount 시 급여 이력 데이터 초기 로딩
onMounted(async () => {
  await store.loadHistory();
});

// 차트용 라벨
const chartLabels = computed(() =>
  history.value ? history.value.chart.map((c) => c.salaryMonth) : []
);

// 차트용 실수령액 데이터
const chartData = computed(() =>
  history.value ? history.value.chart.map((c) => c.netPay) : []
);

/**
 * rows는 XML에서 ORDER BY salary_month(오름차순)이라면
 * 최신 월은 맨 마지막 요소가 됨.
 */
const rows = computed(() => history.value?.rows ?? []);

const latestRow = computed(() => {
  const r = rows.value;
  return r.length ? r[r.length - 1] : null;
});

const prevRow = computed(() => {
  const r = rows.value;
  return r.length >= 2 ? r[r.length - 2] : null;
});

// 총지급액(gross) = 기본급 + 수당합계 (필요 시 기준 변경 가능)
const latestGrossPay = computed(() => {
  const lr = latestRow.value;
  if (!lr) return null;
  const gross = (lr.baseSalary ?? 0) + (lr.allowanceTotal ?? 0);
  return gross > 0 ? gross : null;
});

/** KPI 1) 수당 비율 = allowanceTotal / grossPay */
const allowanceRate = computed(() => {
  const lr = latestRow.value;
  const gross = latestGrossPay.value;
  if (!lr || gross === null) return null;
  return (lr.allowanceTotal / gross) * 100;
});

/** KPI 2) 공제 비율 = deductionTotal / grossPay */
const deductionRate = computed(() => {
  const lr = latestRow.value;
  const gross = latestGrossPay.value;
  if (!lr || gross === null) return null;
  return (lr.deductionTotal / gross) * 100;
});

/** KPI 3) 전월 대비 증감액(원) = 이번달 netPay - 전월 netPay */
const momDeltaNetPay = computed(() => {
  const lr = latestRow.value;
  const pr = prevRow.value;
  if (!lr || !pr) return null;
  return (lr.netPay ?? 0) - (pr.netPay ?? 0);
});

const momDeltaNetPayClass = computed(() => {
  if (momDeltaNetPay.value === null) return '';
  if (momDeltaNetPay.value > 0) return 'rate-up';
  if (momDeltaNetPay.value < 0) return 'rate-down';
  return '';
});

/** KPI 4) 최근 3개월 평균 실수령액 */
const avgNetPay3m = computed(() => {
  const r = rows.value;
  if (r.length === 0) return null;
  const last3 = r.slice(Math.max(0, r.length - 3));
  const sum = last3.reduce((acc, cur) => acc + (cur.netPay ?? 0), 0);
  return Math.round(sum / last3.length);
});

/** KPI 5) 최근 12개월 실수령액 (최근 12개 월 합산) */
const last12mNetPay = computed(() => {
  const r = rows.value;
  if (r.length === 0) return null;

  const last12 = r.slice(Math.max(0, r.length - 12));
  return last12.reduce((acc, cur) => acc + (cur.netPay ?? 0), 0);
});


// --------------------
// 포맷터
// --------------------
const formatMoney = (value: number) => `₩${value.toLocaleString()}`;

const formatMoneyOrDash = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  return formatMoney(value);
};

const formatSignedMoneyOrDash = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${formatMoney(Math.abs(value))}`;
};

const formatPercentOrDash = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(1)}%`;
};

</script>

<style scoped>
.pay-history-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.history-cards {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 12px 12px;
  border: 1px solid #e5e7eb;
}

.summary-label {
  font-size: 18px;
  font-weight:500;
  color: #64748b;
    display: block;
  line-height: 1.2;
  margin-top: 4px;
}

.summary-value {
  margin-top: 6px;
  margin-bottom: 0;
  line-height: 1.3;
  font-size: 18px;
  font-weight: 700;
}

.history-chart {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding-bottom: 72px;
  height: 260px;
  margin-bottom: 24px;
}

.history-table {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding-bottom: 10px;
}

.history-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 13px;
}

.history-table th {
  text-align: left;
  padding: 12px 16px;
}

.history-table td {
  text-align: left;
  padding: 12px 16px;
}

.history-table td:last-child {
  text-align: right;
}

.history-table th:first-child,
.history-table td:first-child,
.history-table th:last-child,
.history-table td:last-child {
  text-align: left;
}

.plus {
  color: #16a34a;
}

.minus {
  color: #b91c1c;
}

.history-note {
  padding-left: 18px;
  margin-top: 12px;
  font-size: 12px;
  color: #6b7280;
}

.history-table th:nth-child(5) {
  text-align: right !important;
}

.rate-up {
  color: #16a34a;
}

.rate-down {
  color: #dc2626;
}

.table-header {
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  color: white;
}


.table-cell {
  color: #155dfc;
}

.table-body tr td:last-child {
  text-align: right;
}

.panel-title {
  padding-left: 20px;
}

.net-pay-head {
  text-align: left !important;
}
</style>
