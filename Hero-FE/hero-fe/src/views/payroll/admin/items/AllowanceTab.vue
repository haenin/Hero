<!--
 * <pre>
 * Vue Name        : AllowanceTab.vue
 * Description     : 급여 항목 관리 - 수당(Allowance) 목록/관리 화면
 *
 * History
 *  2025/12/23 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-allowance-tab
 * @author 동근
 * @version 1.0
 -->
<template>
  <section>
    <div class="toolbar">
      <button class="btn-add" @click="openCreate">+ 수당 추가</button>

      <div class="right">
        <select class="filter" :value="store.allowanceActiveFilter" @change="onFilterChange">
          <option value="">전체</option>
          <option value="Y">활성</option>
          <option value="N">비활성</option>
        </select>
      </div>
    </div>

    <p v-if="store.errorMessage" class="error">{{ store.errorMessage }}</p>

    <div class="table-wrap">
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 80px;">순서</th>
            <th style="width: 140px;">코드</th>
            <th>수당명</th>
            <th style="width: 140px;">구분</th>
            <th style="width: 140px;">금액/비율</th>
            <th style="width: 160px;">과세여부</th>
            <th style="width: 120px;">상태</th>
            <th style="width: 100px;">노출</th>
            <th style="width: 100px;">관리</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, idx) in store.pagedAllowances" :key="row.allowanceId">
            <td>{{ indexOfRow(idx) }}</td>
            <td>{{ row.allowanceId }}</td>
            <td>{{ row.allowanceName }}</td>
            <td>정액</td>
            <td>{{ formatMoney(row.defaultAmount ?? 0) }}</td>
            <td>
              <span class="pill" :class="row.taxableYn === 'Y' ? 'pill-tax' : 'pill-free'">
                {{ row.taxableYn === 'Y' ? '과세' : '비과세' }}
              </span>
            </td>
            <td>
              <span class="pill" :class="row.activeYn === 'Y' ? 'pill-on' : 'pill-off'">
                {{ row.activeYn === 'Y' ? '활성' : '비활성' }}
              </span>
            </td>
            <td class="icon-cell">
<button
  class="icon-btn"
  :disabled="store.loading"
  @click="toggleActive(row)"
>
  <img
    :src="row.activeYn === 'Y'
      ? '/images/preview.svg'
      : '/images/eye-off.svg'"
    :alt="row.activeYn === 'Y' ? '활성' : '비활성'"
    class="status-icon"
  />
</button>
            </td>
            <td class="icon-cell">
              <button class="icon-btn" :disabled="store.loading" @click="openEdit(row)">
                <img src="/images/alarm/alarmsetting.svg" alt="설정" class="status-icon"/>
              </button>
            </td>
          </tr>

          <tr v-if="!store.loading && store.allowances.length === 0">
            <td class="empty" colspan="9">수당 항목이 없습니다.</td>
          </tr>
        </tbody>
      </table>

      <div class="pager">
        <button class="pbtn" :disabled="store.allowancePage <= 1" @click="store.setAllowancePage(store.allowancePage - 1)">
          이전
        </button>

        <button
          v-for="p in store.allowanceTotalPages"
          :key="p"
          class="pnum"
          :class="{ active: p === store.allowancePage }"
          @click="store.setAllowancePage(p)"
        >
          {{ p }}
        </button>

        <button
          class="pbtn"
          :disabled="store.allowancePage >= store.allowanceTotalPages"
          @click="store.setAllowancePage(store.allowancePage + 1)"
        >
          다음
        </button>
      </div>
    </div>

    <AllowanceModal
      v-model="modalOpen"
      :mode="modalMode"
      :initial="editing"
      :loading="store.loading"
      @submit="onSubmit"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePayrollItemsStore } from '@/stores/payroll/payrollItemsStore';
import type { AllowanceResponse, AllowanceCreateRequest, Yn } from '@/types/payroll/payroll.items';
import AllowanceModal from './AllowanceModal.vue';

const store = usePayrollItemsStore();

onMounted(async () => {
  await store.loadAllowances();
});

const modalOpen = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const editing = ref<AllowanceResponse | null>(null);

  /**
   * 모달 열기 - 생성 모드
   */
const openCreate = () => {
  modalMode.value = 'create';
  editing.value = null;
  modalOpen.value = true;
};

/**
 * 모달 열기 - 수정 모드
 */
const openEdit = (row: AllowanceResponse) => {
  modalMode.value = 'edit';
  editing.value = row;
  modalOpen.value = true;
};

/**
 * 모달 submit 처리
 *  - create / edit 모드 분기
 */
const onSubmit = async (payload: AllowanceCreateRequest) => {
  if (modalMode.value === 'create') {
    await store.createAllowance(payload);
  } else {
    await store.updateAllowance(editing.value!.allowanceId, payload);
  }
  modalOpen.value = false;
};

/**
 * 수당 활성/비활성 토글
 */
const toggleActive = async (row: AllowanceResponse) => {
  if (row.activeYn === 'Y') await store.deactivateAllowance(row.allowanceId);
  else await store.activateAllowance(row.allowanceId);
};

/**
 * 필터 변경 처리
 */
const onFilterChange = (e: Event) => {
  const v = (e.target as HTMLSelectElement).value as '' | Yn;
  store.setAllowanceFilter(v);
};

const formatMoney = (v: number) => `₩${v.toLocaleString('ko-KR')}`;

/**
 * 테이블 행 번호 계산 (현재 페이지 기준 순번 계산)
 */
const indexOfRow = (idxInPage: number) => {
  return (store.allowancePage - 1) * store.pageSize + idxInPage + 1;
};
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 0px 20px;
}

.btn-add {
  background:linear-gradient(
    180deg,
    rgba(28, 57, 142, 1) 0%,
    rgba(22, 36, 86, 1) 100%
  );
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 400;
  cursor: pointer;
}

.right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter {
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 0 10px;
  font-size: 13px;
  color: #334155;
  background: #fff;
}

.error {
  margin: 0 0 10px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 700;
}

.table-wrap {
  overflow: hidden;
  background: #fff;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table thead th {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: #ffffff;
  font-size: 13px;
  padding: 12px 16px;
  text-align: left;
}

.items-table thead th:nth-last-child(-n + 2) {
  text-align: center;
}

.items-table tbody td {
  padding: 12px 16px;
  border-top: 1px solid #eef2f7;
  font-size: 13px;
  color: #334155;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
}

.pill-free {
  background: #eaf7ef;
  color: #1f7a3a;
}

.pill-tax {
  background: #fff1e7;
  color: #b45309;
}

.pill-on {
  background: #eaf7ef;
  color: #1f7a3a;
}

.pill-off {
  background: #f1f5f9;
  color: #64748b;
}

.icon-cell {
  text-align: center;
}

.icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  color: #64748b;
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty {
  text-align: center;
  padding: 24px 12px;
  color: #64748b;
  font-weight: 700;
}

.pager {
  padding: 12px;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.pbtn, .pnum {
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

.pbtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
