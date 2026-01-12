<!--
 * <pre>
 * Vue Name        : PayrollPolicy.vue
 * Description     : 급여 정책 목록 조회 및 정책 생성(모달) 페이지

 * History
 *  2025/12/26 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-policy
 * @author 동근
 * @version 1.0
 -->
<template>
  <div class="page-content">
    <div class="page-header">
      <div class="right header-actions">
        <button class="btn-save" @click="openCreateModal">+ 정책 생성</button>
      </div>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 90px;">정책번호</th>
            <th>정책명</th>
            <th style="width: 120px;">상태</th>
            <th style="width: 180px;">적용기간</th>
            <th style="width: 160px;" class="text-center">관리</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="p in policiesSorted"
            :key="p.policyId"
            class="row-clickable"
            :class="{
              'row-active': activePolicyId === p.policyId,
              'row-expired': p.status === 'EXPIRED'
            }"
            @click="goDetail(p.policyId)"
          >
            <td>{{ p.policyId }}</td>

            <td class="policy-name">
              <div class="policy-name-main">
                <span class="policy-title">{{ p.policyName }}</span>
                <span v-if="activePolicyId === p.policyId" class="badge badge-active">ACTIVE</span>
              </div>
              <div class="policy-sub">
                <span class="muted">{{ formatPeriod(p.salaryMonthFrom, p.salaryMonthTo) }}</span>
              </div>
            </td>

            <td>
              <span class="badge" :class="statusClass(p.status)">{{ p.status }}</span>
            </td>

            <td>{{ formatPeriod(p.salaryMonthFrom, p.salaryMonthTo) }}</td>

            <td class="text-center" @click.stop>
              <button class="btn-link" @click="goDetail(p.policyId)">상세보기</button>
            </td>
          </tr>

          <tr v-if="!loading && policiesSorted.length === 0">
            <td colspan="5" class="no-data">
              <div class="empty-title">조건에 맞는 급여 정책이 없습니다.</div>
              <div class="empty-sub">필터를 초기화하거나, 새로운 정책을 생성해보세요.</div>
            </td>
          </tr>

          <tr v-if="loading">
            <td colspan="5" class="no-data">불러오는 중...</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="createModalOpen" class="modal-backdrop" @click.self="closeCreateModal">
      <div class="modal">
        <div class="modal-header">
          <h4 class="modal-title">급여 정책 생성</h4>
          <button class="btn-icon-x" @click="closeCreateModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label class="label">정책명</label>
            <input
              v-model="form.policyName"
              class="input-text"
              type="text"
              placeholder="예) 2026년 표준 정책"
            />
          </div>

          <div class="form-grid">
            <div class="form-row">
              <label class="label">적용 시작 급여월</label>
              <input v-model="form.salaryMonthFrom" class="input-text" type="text" placeholder="YYYY-MM" />
            </div>

            <div class="form-row">
              <label class="label">적용 종료 급여월</label>
              <input v-model="form.salaryMonthTo" class="input-text" type="text" placeholder="YYYY-MM (선택)" />
            </div>
          </div>

          <p v-if="formError" class="error-text">⚠ {{ formError }}</p>
          <p class="hint">급여월은 YYYY-MM 형식으로 입력해주세요. 예) 2026-01</p>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeCreateModal">취소</button>
          <button class="btn-save" @click="submitCreate" :disabled="creating">
            {{ creating ? '생성 중...' : '생성' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { settingsPayrollApi } from '@/api/settings/settings-payroll.api';
import type { PolicyResponse } from '@/types/settings/settings-payroll.types';

const router = useRouter();

const loading = ref(false);
const creating = ref(false);

const policies = ref<PolicyResponse[]>([]);
const activePolicyId = ref<number | null>(null);

const createModalOpen = ref(false);
const formError = ref<string | null>(null);
const form = ref({
  policyName: '',
  salaryMonthFrom: '',
  salaryMonthTo: '' as string | null,
});


const formatPeriod = (from: string, to?: string | null) => (to ? `${from} ~ ${to}` : `${from} ~ (현재)`);

const statusClass = (status: string) => {
  if (status === 'ACTIVE') return 'badge-active';
  if (status === 'DRAFT') return 'badge-draft';
  if (status === 'EXPIRED') return 'badge-expired';
  return '';
};

const goDetail = (policyId: number) => {
  router.push(`/settings/payroll-policy/${policyId}`);
};

const openCreateModal = () => {
  formError.value = '';
  form.value = { policyName: '', salaryMonthFrom: '', salaryMonthTo: null };
  createModalOpen.value = true;
};

const closeCreateModal = () => {
  createModalOpen.value = false;
};


const ymKey = (v?: string | null) => (v ? v.replace('-', '') : '000000');

const policiesSorted = computed(() => {
  const list = policies.value.slice();
  list.sort((a, b) => {
    const aActive = a.policyId === activePolicyId.value ? 1 : 0;
    const bActive = b.policyId === activePolicyId.value ? 1 : 0;
    if (aActive !== bActive) return bActive - aActive;
    const p = ymKey(b.salaryMonthFrom).localeCompare(ymKey(a.salaryMonthFrom));
    if (p !== 0) return p;
    return (b.policyId ?? 0) - (a.policyId ?? 0);
  });
  return list;
});

const reload = async () => {
  loading.value = true;
  try {
    const [list, active] = await Promise.allSettled([
      settingsPayrollApi.listPolicies(),
      settingsPayrollApi.getActivePolicy(),
    ]);

    const listValue = list.status === 'fulfilled' ? list.value : [];
    policies.value = Array.isArray(listValue) ? listValue : [];

    const activeValue = active.status === 'fulfilled' ? active.value : null;
    activePolicyId.value = activeValue?.policyId ?? null;

  } catch (e: any) {
    alert(e?.message || '급여 정책 조회 실패');
  } finally {
    loading.value = false;
  }
};

const submitCreate = async () => {
  formError.value = '';

  if (!form.value.policyName.trim()) {
    formError.value = '정책명은 필수입니다.';
    return;
  }
  if (!form.value.salaryMonthFrom.trim()) {
    formError.value = '적용 시작 급여월은 필수입니다.';
    return;
  }

  creating.value = true;
  try {
    await settingsPayrollApi.createPolicy({
      policyName: form.value.policyName.trim(),
      salaryMonthFrom: form.value.salaryMonthFrom.trim(),
      salaryMonthTo: form.value.salaryMonthTo?.trim() || null,
    });

    closeCreateModal();
    await reload();
  } catch (e: any) {
    formError.value = e?.response?.data?.message || e?.message || '정책 생성 실패';
  } finally {
    creating.value = false;
  }
};

onMounted(reload);
</script>

<style scoped>
.page-content { display:flex; flex-direction:column; flex:1; min-height:0; overflow:hidden; }
.page-header { display:flex; justify-content:flex-end; align-items:center; padding:24px 24px 0; margin-bottom:20px; }
.header-actions { display:flex; gap:10px; }
.muted{ color:#94a3b8; font-weight:800; }

.table-container {
  overflow-x: auto;
  overflow-y: auto;
  height: calc(100vh - 300px);
  border: 1px solid #e2e8f0;
  background: white;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  table-layout: fixed;
}

.data-table th, .data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-table th { position:sticky; top:0; z-index:1; background:linear-gradient(180deg,#1c398e 0%,#162456 100%); color:white; font-weight:600; font-size:14px; }

.text-center { text-align:center; }
.no-data { padding:40px 0; text-align:center; color:#94a3b8; }
.empty-title{ font-weight:900; color:#475569; }
.empty-sub{ margin-top:6px; font-weight:700; color:#94a3b8; }

.policy-name { display:flex; flex-direction:column; gap:6px; }
.policy-name-main{ display:flex; align-items:center; gap:10px; }
.policy-title{ font-weight:900; color:#0f172b; }
.policy-sub{ font-size:.85rem; font-weight:800; color:#94a3b8; }

.row-clickable{ cursor:pointer; }
.row-clickable:hover{ background:#f8fafc; }
.row-active{ background:#eff6ff; }
.row-expired{ opacity:.72; }

.btn-save { padding: 0 15px; height: 40px; background:linear-gradient(180deg,#1c398e 0%,#162456 100%); color:white; border:none; border-radius:10px; cursor:pointer; font-weight:700; }
.btn-save:hover { background-color: #162456; }
.btn-save:disabled { opacity:.7; cursor:not-allowed; }

.btn-secondary { background-color:#f1f5f9; color:#475569; border:1px solid #cbd5e1; height:40px; padding:0 16px; border-radius:10px; cursor:pointer; font-weight:700; }
.btn-secondary:hover { background-color: #e2e8f0; }
.btn-secondary:disabled { opacity:.7; cursor:not-allowed; }

.btn-link { height: 40px; padding: 0 15px; border-radius: 10px; border: 1px solid #cbd5e1; background-color: #ffffff; color: #475569; font-weight: 700; cursor: pointer; }
.btn-link:hover { background-color: #f1f5f9; }

.badge { display:inline-flex; align-items:center; height:22px; padding:0 10px; border-radius:999px; font-size:12px; font-weight:800; border:1px solid #e2e8f0; background:#f8fafc; color:#334155; }
.badge-active { border-color:#93c5fd; background:#eff6ff; color:#1d4ed8; }
.badge-draft { border-color:#e5e7eb; background:#f9fafb; color:#475569; }
.badge-expired { border-color:#fecaca; background:#fef2f2; color:#b91c1c; }
.modal-backdrop { position:fixed; inset:0; background:rgba(15,23,43,.45); display:flex; align-items:center; justify-content:center; padding:24px; z-index:1000; }
.modal { width:640px; max-width:100%; background:#fff; border-radius:14px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 12px 30px rgba(0,0,0,.18); }
.modal-header { display:flex; justify-content:space-between; align-items:center; padding:16px 18px; border-bottom:1px solid #e2e8f0; }
.modal-title { margin:0; font-size:1rem; font-weight:900; color:#0f172b; }
.btn-icon-x { width:34px; height:34px; border-radius:10px; border:1px solid #e2e8f0; background:white; cursor:pointer; font-size:18px; line-height:1; }
.modal-body { padding:18px; }
.form-row { display:flex; flex-direction:column; gap:8px; margin-bottom:14px; }
.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.label { font-size:.85rem; color:#475569; font-weight:800; }
.input-text { width:100%; height: 40px; padding:0 12px; border-radius:10px; border:2px solid #cad5e2; background:#ffffff; outline:none; box-sizing: border-box; }
.input-text:focus { border-color:#155dfc; }
.error-text { margin:6px 0 0; color:#ef4444; font-weight:700; }
.hint { margin:10px 0 0; color:#64748b; font-size:.85rem; font-weight:600; }
.modal-footer { padding:16px 18px; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; gap:10px; }
</style>
