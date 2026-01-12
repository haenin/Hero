<!-- 
 * <pre>
 * Vue Name : Search.vue
 * Description     : 사원 급여 조회(관리자)
 *
 * History
 *   2025/12/09 - 동근 최초 작성
 *   2025/12/28 - 동근 급여 조회 기능 추가
 * </pre>
 *
 * @module payroll-search
 * @author 동근
 * @version 1.0
-->
<template>
  <div class="pay-search-page">
    <section class="panel">
      <div class="filter-bar">
        <span class="total">총 {{ displayTotal }}건</span>
        <div class="filter-right">
        <span class="filter-label">필터</span>

        <input
          v-model="salaryMonth"
          type="month"
          class="filter-select"
          :min="minMonth"
          :max="currentMonth"
          :disabled="loading"
        />

<select
  v-model.number="departmentId"
  class="filter-select"
  :disabled="loading || deptLoading"
>
  <option :value="null">전체 부서</option>
  <option
    v-for="dept in visibleDepartmentOptions"
    :key="dept.departmentId"
    :value="dept.departmentId"
  >
    {{ dept.departmentName }}
  </option>
</select>
        <!-- 정렬 기준 -->
        <select v-model="sortKey" class="filter-select">
          <option value="TOTAL">지급액</option>
          <option value="DEDUCTION">공제</option>
          <option value="NET">실수령액</option>
        </select>

        <!-- 정렬 방향 -->
        <select v-model="sortOrder" class="filter-select">
          <option value="DESC">내림차순</option>
          <option value="ASC">오름차순</option>
        </select>

        <!-- 사원명/사번 -->
        <input
          v-model="keyword"
          class="filter-input"
          placeholder="사원명 또는 사번"
          @keyup.enter="onSearch"
        />


        <!-- 조회 -->
        <button
          class="btn-primary"
          type="button"
          @click="onSearch"
          :disabled="loading"
        >
          조회
        </button>

        <!-- 총 건수 / 에러 -->
        <div class="filter-meta">

          <span v-if="errorMessage" class="error">{{ errorMessage }}</span>
        </div>
        </div>
      </div>

      <!-- =====================
           테이블 영역 (panel 내부)
      ====================== -->
      <div class="paneltwo">
        <table class="table">
          <thead>
            <tr class="table-header">
              <th>사번</th>
              <th>사원명</th>
              <th>부서</th>
              <th>직책</th>
              <th class="right">지급액</th>
              <th class="right">공제</th>
              <th class="right">실수령액</th>
              <th>작업</th>
            </tr>
          </thead>

          <tbody class="table-body">
            <tr v-for="row in filteredRows" :key="row.payrollId">
              <td class="table-cell link" @click="openDetail(row.payrollId)">
                {{ row.employeeNumber }}
              </td>
              <td>{{ row.employeeName }}</td>
              <td>{{ row.departmentName }}</td>
              <td>{{ row.jobTitleName }}</td>
              <td class="right">{{ money(getGrossPay(row)) }}</td>
              <td class="right minus">-{{ money(row.deductionTotal) }}</td>
               <td class="right">{{ money(getRealNetPay(row)) }}</td>
              <td>
                <button
                  class="btn-link"
                  type="button"
                  @click="openDetail(row.payrollId)"
                >
                  상세
                </button>
              </td>
            </tr>

            <tr v-if="!loading && filteredRows.length === 0">
              <td colspan="8" class="empty">조회 결과가 없습니다.</td>
            </tr>
          </tbody>
        </table>

        <!-- 페이지네이션 -->
        <div class="pager">
          <button
            class="pbtn"
            type="button"
            :disabled="loading || page <= 1"
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
            :disabled="loading"
            @click="goPage(p)"
          >
            {{ p }}
          </button>

          <button
            class="pbtn"
            type="button"
            :disabled="loading || page >= (totalPages || 1)"
            @click="goPage(page + 1)"
          >
            다음
          </button>
        </div>
      </div>
    </section>
    <Teleport to="body">
      <div v-if="detailOpen" class="modal-backdrop" @click.self="closeDetail">
        <div class="modal">
          <header class="modal-header">
            <h2>급여 상세</h2>
            <button class="modal-close" type="button" @click="closeDetail">✕</button>
          </header>

          <section class="modal-body" v-if="detail">
            <div class="detail-summary">
              <div class="detail-top">
                <div>
                  <p class="detail-name">
                    {{ detail.employeeName }}
                    <span class="detail-eno">({{ detail.employeeNumber }})</span>
                  </p>
                  <p class="detail-sub">
                    {{ detail.departmentName }} · {{ detail.jobTitleName }}
                  </p>
                </div>

                <div class="detail-meta">
                  <p>급여월: {{ detail.salaryMonth }}</p>
                  <p>상태: {{ detail.payrollStatus }}</p>
                </div>
              </div>

              <div class="detail-totals">
                <div class="total-card">
                  <span class="total-label">총지급액</span>
                  <p class="total-value">{{ money(detail.totalPay) }}</p>
                </div>
                <div class="total-card">
                  <span class="total-label">공제</span>
                  <p class="total-value minus">{{ money(detail.deductionTotal) }}</p>
                </div>
                <div class="total-card">
                  <span class="total-label">실수령액</span>
                  <p class="total-value">{{ money(detail.netPay) }}</p>
                </div>
              </div>
            </div>

            <div class="detail-table">
              <table class="table">
                <thead>
                  <tr class="table-header">
                    <th>구분</th>
                    <th>항목</th>
                    <th class="right">금액</th>
                  </tr>
                </thead>
                <tbody class="table-body">
                  <tr v-for="it in detail.items" :key="it.payrollItemId">
                    <td>{{ itemTypeLabel(it.itemType) }}</td>
                    <td>{{ it.itemName }}</td>
                    <td class="right">{{ money(it.amount) }}</td>
                  </tr>
                  <tr v-if="detail.items.length === 0">
                    <td colspan="3" class="empty">항목이 없습니다.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <footer class="modal-footer">
            <button class="btn-secondary" type="button" @click="closeDetail">
              닫기
            </button>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, onMounted, watch, onUnmounted } from 'vue';
import { useAttendanceDashboardStore } from '@/stores/attendance/dashboard';
import { usePayrollPaymentStore } from '@/stores/payroll/payrollPaymentStore';

const store = usePayrollPaymentStore();
const {
  loading,
  errorMessage,

  salaryMonth,
  keyword,
  departmentId,
  page,
  totalElements,
  totalPages,

  rows,

  detailOpen,
  detail,
} = storeToRefs(store);

const { search, goPage, openDetail, closeDetail } = store;

const DEFAULT_MONTH = '2025-12'
const initialLoaded = ref(false)

const getGrossPay = (r: any) => (r?.totalPay ?? r?.netPay ?? 0);
const getRealNetPay = (r: any) => getGrossPay(r) - (r?.deductionTotal ?? 0);

const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return;
  if (!detailOpen.value) return;
  closeDetail();
};

watch(detailOpen, (open) => {
  if (open) {
    window.addEventListener('keydown', onKeydown);
  } else {
    window.removeEventListener('keydown', onKeydown);
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});


const getTotalPay = (r: any) => {
  const total = r?.totalPay;
  if (total !== null && total !== undefined) return total;

  const net = r?.netPay ?? 0;
  const ded = r?.deductionTotal ?? 0;
  return net + ded;
};

const getNetPay = (r: any) => {
  const net = r?.netPay;
  if (net !== null && net !== undefined) return net;

  const total = getTotalPay(r);
  const ded = r?.deductionTotal ?? 0;
  return total - ded;
};

 const attendanceStore = useAttendanceDashboardStore()
 const { departmentOptions, deptLoading } = storeToRefs(attendanceStore)
 
const now = new Date()
now.setMonth(now.getMonth() - 1)
const currentMonth = now.toISOString().slice(0, 7)

const minMonth = '2025-01'

 const filteredRows = computed(() => {
   let result = rows.value

   const getValue = (r: any): number => {
     switch (sortKey.value) {
       case 'TOTAL':
         return getGrossPay(r)
       case 'DEDUCTION':
         return r.deductionTotal ?? 0
       case 'NET':
         return getRealNetPay(r)
       default:
         return 0
     }
   }

   result = [...result].sort((a, b) => {
     const diff = getValue(a) - getValue(b)
     return sortOrder.value === 'ASC' ? diff : -diff
   })

   return result
 })

type SortKey = 'TOTAL' | 'DEDUCTION' | 'NET'
type SortOrder = 'ASC' | 'DESC'

const sortKey = ref<SortKey>('NET')   
const sortOrder = ref<SortOrder>('DESC')  

  onMounted(async () => {
   if (!departmentOptions.value.length) {
     await attendanceStore.fetchDepartmentOptions()
   }
     if (!salaryMonth.value) {
    salaryMonth.value = DEFAULT_MONTH
  }

  if (!initialLoaded.value) {
    initialLoaded.value = true
    page.value = 1
    await search()
  }
 })

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

const displayTotal = computed(() => {
 return totalElements.value;

});
 const money = (v?: number | null) =>
   v === null || v === undefined ? '-' : `₩${v.toLocaleString()}`;


const itemTypeLabel = (t?: string) => {
  switch ((t ?? '').toUpperCase()) {
    case 'ALLOWANCE':
      return '수당';
    case 'DEDUCTION':
      return '공제';
    default:
      return t ?? '-';
  }
};

async function onSearch() {
  page.value = 1;
  await search();
}

const PAYROLL_EXCLUDED_DEPARTMENTS = [
  '관리자 부서',
  '발령 대기 부서',
]

const visibleDepartmentOptions = computed(() => {
  return departmentOptions.value.filter(
    d => !PAYROLL_EXCLUDED_DEPARTMENTS.includes(d.departmentName)
  )
})

watch(rows, (list) => {
  if (!list?.length) return;
  const r = list[0];
  console.log({
    grossShown: getGrossPay(r),
    deduction: r.deductionTotal,
    netShown: getRealNetPay(r),
    formulaOk: getGrossPay(r) - (r.deductionTotal ?? 0) === getRealNetPay(r),
  });
}, { deep: true });


</script>

<style scoped>
.pay-search-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.panel {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 16px 0px;
}

.paneltwo {
  background-color: #ffffff;
  padding: 12px 0 16px;
}
.field{
  padding: 0 20px;
}
 .filter-bar {
   display: flex;
   align-items: center;
   gap: 10px;
   padding: 10px 12px;
   background: #ffffff;
   margin: 0 20px;
 }
 
 .filter-label {
   color: #64748b;
   font-size: 13px;
   font-weight: 600;
   white-space: nowrap;
 }
 
 .filter-select {
   width: 180px;
   height: 38px;
   border-radius: 10px;
   border: 1px solid #d1d5db;
   padding: 0 10px;
   font-size: 13px;
   color: #1f2933;
   background: #fff;
 }
 
 .filter-input {
   width: 220px;
   height: 38px;
   border-radius: 10px;
   border: 1px solid #d1d5db;
   padding: 0 12px;
   font-size: 13px;
   background: #fff;
 }
 
 .filter-meta {
   display: flex;
   align-items: center;
   gap: 10px;
   white-space: nowrap;
 }

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  display: block;
  margin-bottom: 6px;
}

.req {
  margin-left: 4px;
  color: #b91c1c;
}

.field-input {
  width: 100%;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  padding: 0 12px;
  font-size: 13px;
  background: #fff;
}

.filter-actions {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.left-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.total {
  font-size: 13px;
  color: #155dfc;
}

.error {
  font-size: 12px;
  color: #b91c1c;
}

.right-actions {
  display: flex;
  gap: 8px;
}
.btn-primary,
.btn-secondary {
  border-radius: 999px;
  font-size: 13px;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
}

.btn-secondary {
  background-color: #eef2ff;
  color: #374151;
}

.btn-link {
  padding: 0;
  border: none;
  background: none;
  color: #2563eb;
  font-size: 13px;
  cursor: pointer;
}

.btn-lite:disabled,
.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  padding-top:6px;
}

.table-header {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
}

.table th,
.table td {
  text-align: left;
  padding: 12px 16px;
}

.table-cell {
  color: #155dfc;
}

.link {
  cursor: pointer;
}

.right {
  text-align: right;
}

.plus {
  color: #16a34a;
}

.minus {
  color: #b91c1c;
}

.empty {
  text-align: center;
  padding: 22px 0;
  color: #6b7280;
}

.pager {
  padding: 12px;
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

.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 40;
}

.modal {
  background-color: #ffffff;
  border-radius: 16px;
  width: 760px;
  max-width: calc(100vw - 40px);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
}

.modal-body {
  padding: 16px 20px;
  overflow-y: auto;
}

.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.detail-summary {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 14px;
}

.detail-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.detail-name {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
}

.detail-eno {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  margin-left: 6px;
}

.detail-sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.detail-meta {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-totals {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.total-card {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 10px 12px;
}

.total-label {
  font-size: 12px;
  color: #6b7280;
}

.total-value {
  margin: 6px 0 0;
  font-weight: 700;
  font-size: 14px;
}
 .filter-right {
   margin-left: auto;          
   display: flex;
   align-items: center;
   gap: 10px;
   flex-wrap: wrap;        
   justify-content: flex-end;  
 }

@media (max-width: 1100px) {
  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .detail-totals {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
     .filter-bar {
     flex-wrap: wrap;
   }
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  padding-top: 6px;

  table-layout: fixed;
}

.table th,
.table td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table th,
.table td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>