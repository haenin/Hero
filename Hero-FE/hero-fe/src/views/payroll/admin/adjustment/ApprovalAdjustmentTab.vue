<!-- 
 * <pre>
 * Vue Name : ApprovalAdjustmentTab.vue
 * Description     : 급여 조정(관리자) - 조정 요청(결재) 탭 페이지
 *
 * History
 *   2025/12/31 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-adjust-approval-tab
 * @author 동근
 * @version 1.0
-->
<template>
  <div class="approval-tab">
    <div class="toolbar">
      <div class="toolbar-right">
        <select v-model="statusFilter" class="select">
          <option value="">전체 상태</option>
          <option value="PENDING">승인대기</option>
          <option value="APPROVED">승인완료</option>
          <option value="REJECTED">반려</option>
          <option value="CANCELED">취소</option>
        </select>
      </div>
    </div>

    <div class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th class="col-emp">사원명(직급)</th>
            <th class="col-dept">부서</th>
            <th>사유</th>
            <th class="col-amount">금액</th>
            <th class="col-date">요청일</th>
            <th class="col-status">상태</th>
            <th class="col-action">작업</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in pagedRows" :key="row.docId">
            <td class="emp">
              <div class="emp-wrap">
                <span class="emp-name">{{ row.employeeName }}</span>
                <span class="emp-sub">{{ row.jobTitle }}</span>
              </div>
            </td>
            <td class="dept">{{ row.departmentName }}</td>
            <td class="reason">{{ row.reason }}</td>

            <td class="amount" :class="row.sign === '+' ? 'plus' : 'minus'">
              {{ formatSignedAmount(row.sign, row.amount) }}
            </td>

            <td>
  <div class="date-only">
    {{ (row.createdAt || '').slice(0, 10) }}
  </div>
            </td>

            <td class="td-center">
  <span class="cell-center">
    <span class="badge" :class="badgeClass(row.status)">
      {{ statusLabel(row.status) }}
    </span>
  </span>
            </td>

            <td class="td-center">

                <span class="cell-center">
    <button class="link" @click="openApproval(row)">상세</button>
  </span>
            </td>
          </tr>

          <tr v-if="filtered.length === 0">
            <td colspan="7" class="empty">
              조건에 해당하는 조정 요청이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

 <div class="pager">
   <button
     class="pbtn"
     type="button"
     :disabled="page <= 1"
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
     @click="goPage(p)"
   >
     {{ p }}
   </button>

   <button
     class="pbtn"
     type="button"
     :disabled="page >= totalPages"
     @click="goPage(page + 1)"
   >
     다음
   </button>
 </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePayrollAdjustmentStore } from '@/stores/payroll/payrollAdjustment.store';
import type { AdjustmentStatus, ApprovalAdjustmentRow } from '@/types/payroll/payroll-adjustment.types';


const statusFilter = ref<string>('');
const router = useRouter();
const store = usePayrollAdjustmentStore();


onMounted(store.fetchList);

const filtered = computed(() => {
  if (!statusFilter.value) return store.rows;
  return store.rows.filter((r) => r.status === statusFilter.value);
});

const page = ref(1);       
const size = ref(10);       

const totalPages = computed(() => {
  const total = filtered.value.length;
  return Math.max(1, Math.ceil(total / size.value));
});

const pagedRows = computed(() => {
  const start = (page.value - 1) * size.value;
  return filtered.value.slice(start, start + size.value);
});

const pageNumbers = computed(() => {
  const tp = totalPages.value;
  const pages: number[] = [];
  for (let i = 1; i <= tp; i++) pages.push(i);
  return pages;
});

const goPage = (p: number) => {
  if (p < 1) p = 1;
  if (p > totalPages.value) p = totalPages.value;
  page.value = p;
};

watch(statusFilter, () => {
  page.value = 1;
});

watch(
  pagedRows,
  (rows) => {
    store.hydrateRows(rows.map((r) => r.docId));
  },
  { immediate: true }
);

const statusLabel = (s: AdjustmentStatus) => {
return store.statusLabel(s);
};

const badgeClass = (s: AdjustmentStatus) => {
return store.badgeClass(s);
};

const formatSignedAmount = (sign: '+' | '-', amount: number) => {
  const formatted = amount.toLocaleString('ko-KR');
  return `${sign}${formatted}`;
};

const openApproval = (row: ApprovalAdjustmentRow) => {
  // 결재 상세 페이지로 이동
  router.push(`/approval/documents/${row.docId}`);
};
</script>


<style scoped>

.approval-tab{
    padding:0;
    margin:0;
}
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
  padding-right:20px;
}

.toolbar-right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.title {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.desc {
  margin-top: 4px;
  font-size: 12px;
  color: #62748e;
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

.table-card {
  border: 1px solid #eef2f7;
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead th {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  text-align: left;
  padding: 12px 20px;
}

.table tbody td {
  font-size: 13px;
  color: #0f172a;
  padding: 20px;
  border-top: 1px solid #eef2f7;
  vertical-align: middle;
}

.table tbody tr:hover {
  background: #f8fafc;
}

.mono {
  color: #334155;
}

.reason {
  color: #0f172a;
}
.col-emp { width: 130px; }
.col-dept { width: 160px; }
.col-amount { width: 140px; }
.col-date { width: 120px; }
.col-status { width: 120px; text-align: center; }
.col-action { width: 110px; text-align: center; }
.td-center { text-align: center; }

.cell-center {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-width: 84px; 
}

td:last-child .cell-center {
  min-width: 60px;
}

.amount {
  text-align: right;
  font-weight: 800;
}
.amount.plus { color: #16a34a; }
.amount.minus { color: #dc2626; }

.dt .date { font-size: 12px; color: #475569; }
.dt .time { font-size: 11px; color: #94a3b8; margin-top: 2px; }

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.badge-green { background: #eaf7ee; color: #15803d; border: 1px solid #bfe6cc; }
.badge-yellow { background: #fff7e6; color: #a16207; border: 1px solid #fde68a; }
.badge-red { background: #feecec; color: #b91c1c; border: 1px solid #fecaca; }
.badge-gray { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

.link {
  border: 0;
  background: transparent;
  color: #2563eb;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}
.link:hover { text-decoration: underline; }

.empty {
  padding: 26px 12px;
  text-align: center;
  color: #94a3b8;
}

.pager {
  padding: 14px 0 10px;
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

.emp .emp-name { font-weight: 800; color: #0f172a; line-height: 1;}
.emp .emp-sub {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  line-height: 1;
}
.dept { color: #334155; }

.table thead th.col-amount {
  text-align: center;
}

.emp-wrap {
   display: inline-flex;
   align-items: center;
   gap: 6px;
   line-height: 1;
 }

.date-only {
  font-size: 13px;
  color: #475569;
}

.table thead th.col-status,
.table thead th.col-action {
  text-align: center;
}
</style>
