<!--
 * <pre>
 * Vue Name        : PayrollCalculateTab.vue
 * Description     : 관리자 - 월별 급여 배치 계산 탭 컴포넌트
 *
 * 컴포넌트 연계
 *  - PayrollAdminStore : 선택된 배치, 사원 급여 결과, 계산 실행 상태 관리
 *  - BatchPage.vue : 탭 전환 및 상위 플로우 제어
 *
 * History
 *   2025/12/15 - 동근 최초 작성
 *   2025/12/29 - 동근 수당(연장 포함) 컬럼 추가
 * </pre>
 *
 * @module payroll-admin-batch-calculate-tab
 * @author 동근
 * @version 1.1
 -->
<template>
  <section class="panel">
    <header class="panel-head">
      <div class="left">
        <select class="select" disabled>
          <option v-if="store.batchDetail">
            {{ store.batchDetail.salaryMonth }}
          </option>
          <option v-else>배치를 먼저 선택하세요</option>
        </select>

        <button
          class="btn-primary"
          type="button"
          :disabled="!canCalculateSelected"
          title="선택된 사원만 계산"
          @click="runSelectedCalculate"
        >
          선택 사원 계산
        </button>

        <button
          class="btn-secondary"
          type="button"
          :disabled="!canCalculateAll"
          :title="calculateDisabledReason"
          @click="runAllCalculate"
        >
          전체 계산
        </button>
        <button
  class="btn-secondary"
  type="button"
  :disabled="!store.selectedBatchId || !hasFailed || isConfirmed || store.loading"
  :title="!hasFailed ? 'FAILED 인원이 없습니다' : 'FAILED 인원만 재계산'"
  @click="runFailedRecalculate"
>
  실패자 재계산
</button>

<button
  class="btn-secondary btn-filter"
  type="button"
  :disabled="!store.selectedBatchId || store.employees.length === 0"
  :title="showFailedOnly ? '전체 보기로 전환' : 'FAILED만 보기'"
  @click="showFailedOnly = !showFailedOnly"
>
  {{ showFailedOnly ? '전체 보기' : 'FAILED만 보기' }}
</button>

<button
  class="btn-secondary btn-filter"
  type="button"
  :disabled="!store.selectedBatchId || store.employees.length === 0 || !hasNoAttendance"
  :title="showNoAttendanceOnly ? '전체 보기로 전환' : '근태 없는 사원만 보기'"
  @click="showNoAttendanceOnly = !showNoAttendanceOnly"
>
<template v-if="showNoAttendanceOnly">
  전체 보기
</template>
<template v-else>
  근태없는사원
  <span class="count-danger">{{ noAttendanceCount }}명</span>
</template>
</button>
        <span v-if="isConfirmed" class="lock-hint">
          확정된 배치는 재계산할 수 없습니다.
        </span>
      </div>

    </header>

    <div class="table-wrap">
      <table>
        <thead>
          <tr class="thead">
            <th>
              <input
                type="checkbox"
                :disabled="isConfirmed || filteredEmployees.length === 0"
                :checked="isAllChecked"
                @change="toggleAll"
              />
            </th>
            <th>사원명</th>
            <th>부서</th>
            <th>기본급</th>
            <th>수당(연장 포함)</th>
            <th>공제</th>
            <th>실수령액</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="!store.selectedBatchId" class="empty">
            <td colspan="9">배치를 먼저 선택해주세요. (배치 탭에서 선택)</td>
          </tr>

          <tr v-else-if="store.loading" class="empty">
            <td colspan="9">로딩 중…</td>
          </tr>

          <tr v-else-if="filteredEmployees.length === 0" class="empty">
            <td colspan="9">대상 사원이 없습니다.</td>
          </tr>

          <tr
            v-else
            v-for="e in pagedEmployees"
            :key="e.payrollId"
          >
            <td>
              <input
                type="checkbox"
                :value="e.employeeId"
                v-model="selectedIds"
                :disabled="isConfirmed || e.status === 'CONFIRMED'"
              />
            </td>

                  <td class="employee-name">
              {{ e.employeeName }}
              <span
                v-if="e.attendanceDays === 0"
                class="badge attendance-warn"
                title="해당 급여월에 근태 기록이 없어 연장근무 수당은 0원으로 계산되었습니다."
              >
                근태없음
              </span>
            </td>
            <td>{{ e.departmentName ?? '-' }}</td>
            <td>{{ formatMoney(e.baseSalary) }}</td>
            <td>{{ formatMoney(e.allowanceTotal) }}</td>
            <td>{{ formatMoney(e.deductionTotal) }}</td>
            <td>{{ formatMoney(e.totalPay) }}</td>

            <td>
              <span :class="['badge', badgeClass(e.status)]">
                {{ statusLabel(e.status) }}
              </span>
            </td>

            <td>
              <button
                v-if="e.status === 'FAILED'"
                class="mini-btn danger"
                type="button"
                @click="openError(e)"
              >
                오류 보기
              </button>

              <button
                v-else
                class="mini-btn"
                disabled
                title="추후(개별 재계산)"
              >
                재계산
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="store.selectedBatchId && filteredEmployees.length > 0" class="pager">
      <button
        class="pbtn"
        type="button"
        :disabled="store.loading || page <= 1"
        @click="goPage(page - 1)"
      >
        이전
      </button>

      <button
        v-for="p in pageNumbers"
        :key="p"
        class="pnum"
        type="button"
        :class="{ active: p === page }"
        :disabled="store.loading"
        @click="goPage(p)"
      >
        {{ p }}
      </button>

      <button
        class="pbtn"
        type="button"
        :disabled="store.loading || page >= (totalPages || 1)"
        @click="goPage(page + 1)"
      >
        다음
      </button>
    </div>


    <p v-if="store.errorMessage" class="error">{{ store.errorMessage }}</p>

    <PayrollErrorModal
      v-model="errorOpen"
      title="계산/검증 실패"
      :employee-name="errorTarget?.employeeName"
      :department-name="errorTarget?.departmentName ?? null"
      :salary-month="errorTarget?.salaryMonth"
      :message="errorTarget?.errorMessage ?? null"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { usePayrollAdminStore } from '@/stores/payroll/payrollBatchStore';
import type { PayrollEmployeeResultResponse, PayrollStatus } from '@/types/payroll/payroll.batch';
import PayrollErrorModal from './PayrollErrorModal.vue';

const store = usePayrollAdminStore();
const selectedIds = ref<number[]>([]);
const errorOpen = ref(false);
const errorTarget = ref<PayrollEmployeeResultResponse | null>(null);

const isConfirmed = computed(() => store.batchDetail?.status === 'CONFIRMED');
const showFailedOnly = ref(false);
const showNoAttendanceOnly = ref(false);

const noAttendanceCount = computed(() =>
(store.employees ?? []).filter(e => (e.attendanceDays ?? 0) === 0).length
);
const hasNoAttendance = computed(() => noAttendanceCount.value > 0);

const filteredEmployees = computed(() => {
  const list = store.employees ?? [];
  let r = list;
  if (showFailedOnly.value) r = r.filter(e => e.status === 'FAILED');
  if (showNoAttendanceOnly.value) r = r.filter(e => (e.attendanceDays ?? 0) === 0);
  return r;
});

const failedEmployeeIds = computed(() =>
  (store.employees ?? [])
    .filter(e => e.status === 'FAILED')
    .map(e => e.employeeId)
);

const hasFailed = computed(() => failedEmployeeIds.value.length > 0);

const runFailedRecalculate = async () => {
  if (isConfirmed.value) return;
  if (store.loading) return;
  if (!hasFailed.value) return;

  await store.calculateSelectedBatch(failedEmployeeIds.value);
  await store.selectBatch(store.selectedBatchId!);
  if (showFailedOnly.value) {
    const stillFailed = (store.employees ?? []).some(e => e.status === 'FAILED');
    if (!stillFailed) showFailedOnly.value = false;
  }

  selectedIds.value = [];
};

const isAllChecked = computed(() =>
  selectableEmployeeIds.value.length > 0 &&
  selectedIds.value.length === selectableEmployeeIds.value.length
);

const selectableEmployeeIds = computed(() =>
  pagedEmployees.value
    .filter(e => e.status !== 'CONFIRMED')
    .map(e => e.employeeId)
);

const toggleAll = () => {
  if (isAllChecked.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = [...selectableEmployeeIds.value];
  }
};

const canCalculateSelected = computed(() => {
  if (isConfirmed.value) return false;
  if (store.loading) return false;
  return selectedIds.value.length > 0;
});

const canCalculateAll = computed(() => {
  if (!store.selectedBatchId) return false;
  if (store.loading) return false;
  if (isConfirmed.value) return false;
  return true;
});

const pageSize = 10;
const page = ref(1);

const totalPages = computed(() => {
  const total = filteredEmployees.value.length;
  return Math.max(1, Math.ceil(total / pageSize));
});

const pagedEmployees = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredEmployees.value.slice(start, start + pageSize);
});

const pageNumbers = computed(() => {
  const tp = totalPages.value || 1;
  const cur = page.value || 1;
  if (tp <= 3) return Array.from({ length: tp }, (_, i) => i + 1);

  let start = cur - 1;
  let end = cur + 1;

  if (start < 1) {
    start = 1;
    end = 3;
  }
  if (end > tp) {
    end = tp;
    start = tp - 2;
  }

  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
});

const goPage = (p: number) => {
  const next = Math.min(Math.max(1, p), totalPages.value);
  page.value = next;
};

const calculateDisabledReason = computed(() => {
  if (!store.selectedBatchId) return '배치를 먼저 선택하세요';
  if (store.loading) return '처리 중입니다';
  if (isConfirmed.value) return '확정된 배치는 재계산할 수 없습니다';
  return '';
});

const runSelectedCalculate = async () => {
  if (!canCalculateSelected.value) return;
  await store.calculateSelectedBatch(selectedIds.value);
  selectedIds.value = [];
};

const runAllCalculate = async () => {
  if (!canCalculateAll.value) return;
  await store.calculateAllBatch();
  selectedIds.value = [];
};

const openError = (e: PayrollEmployeeResultResponse) => {
  errorTarget.value = e;
  errorOpen.value = true;
};

const formatMoney = (n?: number | null) => `${(n ?? 0).toLocaleString()}원`;

const statusLabel = (s: PayrollStatus) => {
  switch (s) {
    case 'READY': return '대기';
    case 'CALCULATED': return '계산완료';
    case 'FAILED': return '실패';
    case 'CONFIRMED': return '확정';
    default: return s;
  }
};

const badgeClass = (s: PayrollStatus) => {
  switch (s) {
    case 'CALCULATED': return 'ok';
    case 'FAILED': return 'danger';
    case 'CONFIRMED': return 'confirm';
    default: return 'wait';
  }
};

watch(
  () => store.selectedBatchId,
  () => {
    page.value = 1;
    showFailedOnly.value = false;
    showNoAttendanceOnly.value = false;
    selectedIds.value = [];
  }
);

watch([showFailedOnly, showNoAttendanceOnly], () => {
  page.value = 1;
});

</script>

<style scoped>
.panel {
  background: #ffffff;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 0px 20px 0px;
}

.left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.lock-hint {
  font-size: 12px;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 6px 10px;
  border-radius: 999px;
}

.select {
  border-radius: 999px;
  padding: 7px 12px;
  border: 1px solid #d1d5db;
  font-size: 13px;
  background: #fff;
}

.table-wrap {
  overflow: hidden;
  }

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.thead {
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  color: #ffffff;
}

th, td {
  padding: 12px 14px;
  text-align: left;
}

.empty td {
  color: #6b7280;
  background: #f8fafc;
}

.btn-primary,
.btn-secondary {
  border-radius: 999px;
  font-size: 13px;
  padding: 8px 14px;
  border: none;
  cursor: pointer;
}

.btn-primary {
   background: linear-gradient(
    180deg,
    rgba(28, 57, 142, 1) 0%,
    rgba(22, 36, 86, 1) 100%
  );
  color: white;
}

.btn-secondary {
  background-color: #eef2ff;
  color: #374151;
}

 .btn-filter {
   background: #f8fafc;
   border: 1px dashed #c7d2fe;
   color: #3730a3;
 }

 .btn-filter.active {
   background: #eef2ff;
   border-style: solid;
   font-weight: 600;
 }
.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pager {
  margin-top: 14px;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  color: #334155;
}

.badge.ok {
  background: #ecfeff;
  border-color: #a5f3fc;
  color: #155e75;
}

.badge.danger {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.badge.confirm {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #1e3a8a;
}

.badge.wait {
  background: #f8fafc;
  border-color: #e5e7eb;
  color: #475569;
}

.mini-btn {
  border-radius: 999px;
  font-size: 12px;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
}

.mini-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.mini-btn.danger {
  border-color: #fecaca;
  background: #fef2f2;
  color: #991b1b;
  font-weight: 800;
}

.error {
  margin-top: 10px;
  color: #dc2626;
  font-size: 13px;
}

.employee-name {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.badge.attendance-warn {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #9a3412;
  font-size: 10px;
  height: 18px;
  padding: 0 6px;
  line-height: 18px;
}

.count-danger {
  color: #dc2626;
  font-weight: 700;
  margin-left: 4px;
}

.pager {
  margin-top: 14px;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.pbtn,
.pnum {
  height: 30px;
  min-width: 32px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #334155;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
}

.pnum.active {
  background: #2855ff;
  color: #fff;
  border-color: #2855ff;
}

.pbtn:disabled,
.pnum:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-wrap table {
  table-layout: fixed;
  width: 100%;
}

.table-wrap th,
.table-wrap td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-wrap td:nth-child(4),
.table-wrap td:nth-child(5),
.table-wrap td:nth-child(6),
.table-wrap td:nth-child(7) {
  font-variant-numeric: tabular-nums;
}

.table-wrap th:nth-child(1),
.table-wrap td:nth-child(1) { width: 46px; }

.table-wrap th:nth-child(2),
.table-wrap td:nth-child(2) { width: 160px; }

.table-wrap th:nth-child(3),
.table-wrap td:nth-child(3) { width: 160px; }

.table-wrap th:nth-child(4),
.table-wrap td:nth-child(4) { width: 120px; }

.table-wrap th:nth-child(5),
.table-wrap td:nth-child(5) { width: 140px; }

.table-wrap th:nth-child(6),
.table-wrap td:nth-child(6) { width: 120px; }

.table-wrap th:nth-child(7),
.table-wrap td:nth-child(7) { width: 130px; }

.table-wrap th:nth-child(8),
.table-wrap td:nth-child(8) { width: 90px; }

.table-wrap th:nth-child(9),
.table-wrap td:nth-child(9) { width: 110px; }

</style>
