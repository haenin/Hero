<!--
 * <pre>
 * Vue Name        : PayrollBatchTab.vue
 * Description     : 관리자 - 월별 급여 배치 관리 탭 컴포넌트
 *
 * 컴포넌트 연계
 *  - CreateBatchModal : 신규 배치 생성 모달
 *  - BatchDetailDrawer : 선택된 배치 상세 드로어
 *  - PayrollAdminStore : 배치 목록 / 선택 / 상세 / 생성 상태 관리
 *
 * History
 *  2025/12/15 - 동근 최초 작성
 *  2025/12/29 - 동근 총 공제액/실지급액 컬럼 추가
 * </pre>
 *
 * @module payroll-admin-batch-tab
 * @author 동근
 * @version 1.1
 -->
<template>
  <section class="panel">
    <header class="panel-head">
      <div class="left">
        <button class="btn-primary" type="button" @click="openCreate = true">
          + 배치 생성
        </button>

        <select v-model="status" class="select" @change="reload">
          <option value="">전체 상태</option>
          <option value="READY">준비</option>
          <option value="CALCULATED">계산완료</option>
          <option value="CONFIRMED">확정</option>
          <option value="PAID">지급완료</option>
        </select>
      </div>
    </header>

    <div class="table-wrap">
      <table>
        <thead>
          <tr class="thead">
          <th>급여월</th>
          <th>상태</th>
          <th>대상 인원</th>
          <th>총 급여액</th>
          <th>총 공제액</th>
          <th>실지급액</th>
          <th>생성일</th>
          <th>종료일시</th>
          <th>작업</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="store.loading" class="empty">
            <td colspan="9">로딩 중…</td>
          </tr>

          <tr v-else-if="store.batches.length === 0" class="empty">
            <td colspan="9">배치가 없습니다. “+ 배치 생성”으로 시작하세요.</td>
          </tr>

          <tr
            v-else
            v-for="b in store.batches"
            :key="b.batchId"
            :class="['row', store.selectedBatchId === b.batchId ? 'row--active' : '']"
            @click="onClickBatch(b.batchId)"
          >
            <td>{{ b.salaryMonth }}</td>
            <td>
              <span :class="['badge', badgeClass(b.status)]">{{ statusLabel(b.status) }}</span>
            </td>

            <td>
 {{ store.employeeCountByBatchId?.[b.batchId] ?? '-' }}
            </td>

            <td>{{ formatMoneyOrDash(b.totalGrossPay) }}</td>
            <td>{{ formatMoneyOrDash(b.totalDeduction) }}</td>
            <td class="strong">{{ formatMoneyOrDash(b.totalNetPay) }}</td>
            <td>{{ formatDateTime(b.createdAt) }}</td>
            <td>{{ formatDateTime(b.closedAt) }}</td>

            <td @click.stop>
              <button
                class="mini-btn"
                :disabled="store.selectedBatchId !== b.batchId"
                title="배치를 선택하면 상세 드로어가 열립니다"
                @click="drawerOpen = true"
              >
                상세
              </button>

              <button
                class="mini-btn primary"
                :disabled="store.selectedBatchId !== b.batchId"
                title="다음 단계(급여 계산)로 이동"
                @click="emit('next')"
              >
                다음 단계
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="store.errorMessage" class="error">{{ store.errorMessage }}</p>

    <CreateBatchModal
      v-model="openCreate"
      :loading="store.loading"
      @submit="onSubmitCreate"
    />

    <BatchDetailDrawer
      v-model="drawerOpen"
      :detail="store.batchDetail"
      :loading="store.loading"
      @next="emit('next')"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CreateBatchModal from './CreateBatchModal.vue';
import BatchDetailDrawer from './BatchDetailDrawer.vue';

import { usePayrollAdminStore } from '@/stores/payroll/payrollBatchStore';
import type { PayrollBatchStatus } from '@/types/payroll/payroll.batch';

const store = usePayrollAdminStore();

const emit = defineEmits<{
  (e: 'select', batchId: number): void;
  (e: 'next'): void;
}>();

const openCreate = ref(false);
const drawerOpen = ref(false);

const status = ref<PayrollBatchStatus | ''>('');

const reload = async () => {
  await store.loadBatches({ status: status.value });
};

onMounted(async () => {
  if (store.batches.length === 0) {
    await reload();
  }
});

const onClickBatch = async (batchId: number) => {
  emit('select', batchId);
  drawerOpen.value = true;
};

const onSubmitCreate = async (month: string) => {
  await store.createBatch(month);
  openCreate.value = false;
  drawerOpen.value = true;
};

const formatDateTime = (v: string | null) => {
  if (!v) return '-';
  return v.replace('T', ' ').slice(0, 16);
};

const formatMoneyOrDash = (v?: number | null) => {
  if (v === null || v === undefined) return '-';
  return `${v.toLocaleString()}원`;
};

const statusLabel = (s: PayrollBatchStatus) => {
  switch (s) {
    case 'READY': return '준비';
    case 'CALCULATED': return '계산완료';
    case 'CONFIRMED': return '확정';
    case 'PAID': return '지급완료';
    default: return s;
  }
};

const badgeClass = (s: PayrollBatchStatus) => {
  switch (s) {
    case 'CALCULATED': return 'ok';
    case 'CONFIRMED': return 'confirm';
    case 'PAID': return 'paid';
    default: return 'wait';
  }
};
</script>

<style scoped>
.panel {
  background: #ffffff;
  border-radius: 16px;
  overflow-y: auto;
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
  padding: 12px 16px;
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

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.row {
  cursor: pointer;
}

.row:hover td {
  background: #f8fafc;
}

.row--active td {
  background: #eef2ff;
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

.mini-btn {
  border-radius: 999px;
  font-size: 12px;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  margin-right: 6px;
}

.mini-btn.primary {
   background: linear-gradient(
    180deg,
    rgba(28, 57, 142, 1) 0%,
    rgba(22, 36, 86, 1) 100%
  );
  color: #fff;
  border-color: #162456;
}

.mini-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.error {
  margin-top: 10px;
  color: #dc2626;
  font-size: 13px;
}
</style>
