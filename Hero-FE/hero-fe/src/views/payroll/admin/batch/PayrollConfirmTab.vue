<!--
 * <pre>
 * Vue Name        : PayrollConfirmTab.vue
 * Description     : 관리자 - 월별 급여 배치 승인/확정 탭 컴포넌트
 *
 * 컴포넌트 연계
 *  - PayrollAdminStore : 배치 목록/선택/상태 전이(확정/지급) 상태 관리
 *  - BatchPage.vue : 탭 전환 및 상위 플로우 제어
 *
 * History
 *   2025/12/15 - 동근 최초 작성
 *   2025/12/21 - 동근 지급(PAID) 처리 버튼 및 UI 추가
 *   2025/12/29 - 동근 총 공제액/실지급액 컬럼 추가
 * </pre>
 *
 * @module payroll-admin-batch-confirm-tab
 * @author 동근
 * @version 1.2
 -->
<template>
  <section class="panel">
    <header class="panel-head">
      <div class="left">
        <select v-model="statusFilter" class="select" @change="reload">
          <option value="">전체 상태</option>
          <option value="CALCULATED">승인 대기(계산완료)</option>
          <option value="CONFIRMED">승인 완료(확정)</option>
          <option value="PAID">지급 완료</option>
        </select>
      </div>
    </header>

    <div class="table-wrap">
      <table>
        <thead>
          <tr class="thead">
          <th>급여월</th>
          <th>신청자</th>
          <th>신청일시</th>
          <th>대상 인원</th>
          <th>총 급여액</th>
          <th>총 공제액</th>
          <th>실지급액</th>
          <th>상태</th>
          <th>승인자</th>
          <th>지급/승인일시</th>
          <th>작업</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="store.loading" class="empty">
            <td colspan="11">로딩 중…</td>
          </tr>

          <tr v-else-if="store.batches.length === 0" class="empty">
            <td colspan="11">배치 목록이 없습니다.</td>
          </tr>

          <tr
            v-else
            v-for="b in store.batches"
            :key="b.batchId"
            :class="['row', store.selectedBatchId === b.batchId ? 'row--active' : '']"
            @click="onSelect(b.batchId)"
          >
            <td>{{ b.salaryMonth }}</td>
            <td>{{ displayRequester(b) }}</td>
            <td>{{ formatDateTime(b.createdAt) }}</td>

            <td>
              {{ store.employeeCountByBatchId?.[b.batchId] ?? '-' }}
            </td>
            <td>{{ formatMoneyOrDash(b.totalGrossPay) }}</td>
            <td>{{ formatMoneyOrDash(b.totalDeduction) }}</td>
            <td class="strong">{{ formatMoneyOrDash(b.totalNetPay) }}</td>

            <td>
              <span :class="['badge', batchBadge(b.status)]">{{ b.status }}</span>
            </td>

            <td>{{ displayActor(b) }}</td>
            <td>{{ displayActionAt(b) }}</td>

            <td @click.stop>
              <div class="action-buttons">
              <button
                class="btn-primary small"
                :disabled="store.selectedBatchId !== b.batchId || !canConfirm"
                :title="
                  b.status !== 'CALCULATED'
                    ? '계산완료(CALCULATED) 상태만 확정 가능합니다'
                    : hasFailed
                      ? 'FAILED 인원이 있어 확정할 수 없습니다'
                      : '확정'
                "
                @click="confirm(b.batchId)"
              >
                확정
              </button>

              <button
                class="btn-primary small"
                :disabled="store.selectedBatchId !== b.batchId || !canPay(b)"
                :title="
                  b.status === 'PAID'
                    ? '이미 지급 완료된 배치입니다'
                    : b.status !== 'CONFIRMED'
                      ? '확정(CONFIRMED) 상태만 지급 처리 가능합니다'
                      : '지급 처리'
                "
                @click="pay(b.batchId)"
              >
                지급 처리
              </button>

              <button class="btn-secondary small" disabled title="추후 API 예정">
                반려
              </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="hasFailed" class="warn">
      FAILED 인원이 있어 급여 배치를 확정할 수 없습니다.
      실패 사유 확인 후 재계산해주세요.
    </p>
    <p v-if="store.errorMessage" class="error">{{ store.errorMessage }}</p>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { usePayrollAdminStore } from '@/stores/payroll/payrollBatchStore';
import type { PayrollBatchStatus } from '@/types/payroll/payroll.batch';
import type { PayrollBatchListResponse } from '@/types/payroll/payroll.batch';

const store = usePayrollAdminStore();

const statusFilter = ref<PayrollBatchStatus | ''>('');

const reload = async () => {
  await store.loadBatches({ status: statusFilter.value });
};

onMounted(async () => {
  if (store.batches.length === 0) {
    await reload();
  }
});

const onSelect = async (batchId: number) => {
  await store.selectBatch(batchId);
};

const confirm = async (batchId: number) => {
  if (store.selectedBatchId !== batchId) {
    await store.selectBatch(batchId);
  }
  await store.confirmSelectedBatch();
  await reload();
};

const pay = async (batchId: number) => {
  if (store.selectedBatchId !== batchId) {
    await store.selectBatch(batchId);
  }
  await store.paySelectedBatch();
  await reload();
};

const formatDateTime = (v: string | null) => {
  if (!v) return '-';
  return v.replace('T', ' ').slice(0, 16);
};
// 신청자(배치 생성자)
const displayRequester = (batch: PayrollBatchListResponse) => {
  if (batch.createdByName) return batch.createdByName;
  if (batch.createdBy != null) return `#${batch.createdBy}`;
  return '-';
};

// 승인자/지급처리자
const displayActor = (batch: PayrollBatchListResponse) => {
  if (batch.status === 'PAID') {
    if (batch.paidByName) return batch.paidByName;
    if (batch.paidBy != null) return `#${batch.paidBy}`;
    return '-';
  }
  // CONFIRMED면 승인자
  if (batch.status === 'CONFIRMED') {
    if (batch.approvedByName) return batch.approvedByName;
    if (batch.approvedBy != null) return `#${batch.approvedBy}`;
    return '-';
  }
  // CALCULATED(승인대기)면 아직 없음
  return '-';
};

// 지급/승인 일시 (상태에 따라 보여줄 값 선택)
const displayActionAt = (batch: PayrollBatchListResponse) => {
  if (batch.status === 'PAID') return formatDateTime(batch.paidAt ?? null);
  if (batch.status === 'CONFIRMED') return formatDateTime(batch.approvedAt ?? null);
  // 필요하면 CALCULATED에서는 createdAt/closedAt 등으로 변경 가능
  return '-';
};

const formatMoneyOrDash = (v?: number | null) => {
  if (v === null || v === undefined) return '-';
  return `${v.toLocaleString()}원`;
};

const batchBadge = (s: PayrollBatchStatus) => {
  switch (s) {
    case 'CALCULATED': return 'ok';
    case 'CONFIRMED': return 'confirm';
    case 'PAID': return 'paid';
    default: return 'wait';
  }
};

const hasFailed = computed(() => {
  return (store.batchDetail?.failedCount ?? 0) > 0;
});

const canConfirm = computed(() => {
  const b = store.selectedBatch;
  if (!b) return false;
  if (b.status !== 'CALCULATED') return false;
  if (hasFailed.value) return false;
  if (store.loading) return false;
  return true;
});

const canPay = (batch: Pick<PayrollBatchListResponse, 'status'>) => {
  if (store.loading) return false;
  if (batch.status === 'PAID') return false;
  return batch.status === 'CONFIRMED';
};
</script>

<style scoped>
.panel {
  background: #ffffff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
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
}

.select {
  border-radius: 999px;
  padding: 7px 12px;
  border: 1px solid #d1d5db;
  font-size: 13px;
  background: #fff;
}

.table-wrap {
  overflow: auto;
  flex: 1;
  min-height: 0;
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

.row {
  cursor: pointer;
}

.row--active td {
  background: #eef2ff;
}

.pager {
  margin-top: 14px;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.pager-btn {
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
}

.pager-btn.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.pager-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
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

.small {
  padding: 6px 10px;
  font-size: 12px;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.badge.confirm {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #1e3a8a;
}

.badge.paid {
  background: #ecfdf5;
  border-color: #bbf7d0;
  color: #065f46;
}

.badge.wait {
  background: #f8fafc;
  border-color: #e5e7eb;
  color: #475569;
}

.error {
  margin-top: 10px;
  color: #dc2626;
  font-size: 13px;
}

.warn {
  padding:20px;
  margin-top: 10px;
  color: #b45309;
  font-size: 13px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
