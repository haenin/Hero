<!--
 * <pre>
 * Vue Name        : PayrollPolicyDetail.vue
 * Description     : 급여 정책 상세 설정 및 관리 페이지
 *
 * History
 *  2025/12/26 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-policy-detail
 * @author 동근
 * @version 1.0
 -->
<template>
  <div class="page-content">
    <div class="page-header">
      <div class="left">
      <div class="policy-mini-header" v-if="detail?.policy">
        <span class="pid">#{{ detail.policy.policyId }}</span>
        <span class="dot">·</span>
        <span class="pname">{{ detail.policy.policyName }}</span>
        <span class="dot">·</span>
        <span class="period">{{ formatPeriod(detail.policy.salaryMonthFrom, detail.policy.salaryMonthTo) }}</span>
      </div>
      </div>

      <div class="right" v-if="detail">
        <button class="btn-secondary" @click="goBack">← 목록</button>
        <button
          class="btn-save"
          @click="openActivateModal"
          :disabled="loading || !canActivate"
          :title="canActivate ? '' : '필수 설정(PAYDAY_DAY/CLOSE_DAY/ROUNDING_MODE/ROUNDING_UNIT)이 부족해요.'"
        >
          정책 활성화
        </button>
      </div>
    </div>
    <div v-if="loading" class="state-area">불러오는 중...</div>
    <div v-else-if="!detail" class="state-area">정책 정보를 불러오지 못했습니다.</div>
    <template v-else>
      <div class="settings-container">
        <div class="side-nav">
          <button class="nav-item" :class="{ active: tab === 'pay' }" @click="tab = 'pay'">
            급여 지급 & 정산 설정
            <span class="sub">급여일/휴일 처리</span>
          </button>
          <button class="nav-item" :class="{ active: tab === 'calc' }" @click="tab = 'calc'">
            급여 계산 기준
            <span class="sub">반올림/단위/기준</span>
          </button>
          <button class="nav-item" :class="{ active: tab === 'basic' }" @click="tab = 'basic'">
            수당/공제 설정
            <span class="sub">수당/공제 자동 계산</span>
          </button>
        </div>
        <div class="content-area">
          <div class="panel">
            <div v-if="tab === 'pay'" class="content-stack">
              <div class="card">
                <div class="form-grid-2">
                  <div class="form-row">
                    <label class="label">급여 지급일</label>
                    <input class="input-text" type="number" min="1" max="31" v-model.number="scheduleForm.paydayDay" placeholder="예) 25" />
                  </div>
                  <div class="form-row">
                    <label class="label">정산 마감일</label>
                    <input class="input-text" type="number" min="1" max="31" v-model.number="scheduleForm.closeDay" placeholder="예) 20" />
                  </div>
                </div>
                <div class="form-grid-2">
                  <div class="form-row">
                    <label class="label">휴일 처리</label>
                    <select class="input-text" v-model="scheduleForm.holidayRule">
                      <option value="PREV_BUSINESS_DAY">전 영업일</option>
                      <option value="NEXT_BUSINESS_DAY">다음 영업일</option>
                      <option value="NONE">미적용</option>
                    </select>
                  </div>
                  <div class="form-row">
                    <label class="label">명세서 발송일</label>
                    <input class="input-text" type="number" min="1" max="31" v-model.number="scheduleForm.payslipSendDay" placeholder="예) 25 (지급일과 동일)" />
                  </div>
                </div>
                <p class="hint-under">{{ payrollPreviewText }}</p>
              </div>
            </div>
            <div v-else-if="tab === 'calc'" class="content-stack">
              <div class="card">
                <div class="form-grid-2">
                  <div class="form-row">
                    <label class="label">반올림 방식</label>
                    <select class="input-text" v-model="calcForm.roundingMode">
                      <option value="">선택</option>
                      <option value="HALF_UP">반올림</option>
                      <option value="FLOOR">버림</option>
                      <option value="CEIL">올림</option>
                    </select>
                  </div>
                  <div class="form-row">
                    <label class="label">처리 단위</label>
                    <select class="input-text" v-model="calcForm.roundingUnit">
                      <option value="">선택</option>
                      <option value="1">1원</option>
                      <option value="10">10원</option>
                      <option value="100">100원</option>
                    </select>
                  </div>
                </div>

                <div class="form-grid-2">
                  <div class="form-row">
                    <label class="label">계산 기준</label>
                    <select class="input-text" v-model="calcForm.baseAmountType">
                      <option value="">선택</option>
                      <option value="BASE_SALARY">기본급 기준</option>
                      <option value="NORMAL_WAGE">통상임금 기준</option>
                    </select>
                  </div>

                  <div class="form-row">
                    <label class="label">비고</label>
                    <input class="input-text" v-model="calcForm.memo" placeholder="설명(선택)" />
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="content-stack">
              <div class="card">
                <div class="basic-topbar">
                  <div class="seg">
                    <button class="seg-btn" :class="{ active: basicItemType === 'ALLOWANCE' }" @click="basicItemType = 'ALLOWANCE'">
                      수당
                    </button>
                    <button class="seg-btn" :class="{ active: basicItemType === 'DEDUCTION' }" @click="basicItemType = 'DEDUCTION'">
                      공제
                    </button>
                  </div>
                  <div class="actions">
                    <button class="btn-save" :disabled="savingItems || !itemsDirty" @click="saveItems">
                      {{ savingItems ? '저장 중...' : itemsDirty ? '항목 저장' : '항목 저장됨' }}
                    </button>
                  </div>
                </div>
                <div class="master-picker">
                  <div class="picker-head">
                    <div class="picker-title">
                      <span class="t">마스터 항목 선택</span>
                      <span class="meta">
                        전체 {{ filteredMasters.length }} · 선택 {{ selectedMasterCodes.length }} · 적용됨 {{ alreadyAddedCount }}
                      </span>
                    </div>
                    <label class="toggle">
                      <input type="checkbox" v-model="hideAlreadyAdded" />
                      <span>이미 적용됨 숨기기</span>
                    </label>
                  </div>
                  <div v-if="selectedPreview.length > 0" class="selected-chips">
                    <button
                      v-for="m in selectedPreview"
                      :key="m.code"
                      class="chip"
                      type="button"
                      @click="unselectMaster(m.code)"
                      :title="'클릭하면 선택 해제'"
                    >
                      {{ m.name }} <span class="x">×</span>
                    </button>
                    <div v-if="selectedMasterCodes.length > selectedPreview.length" class="more">
                      +{{ selectedMasterCodes.length - selectedPreview.length }}
                    </div>
                  </div>

                  <div class="picker-list">
                    <label
                      v-for="m in visibleMasters"
                      :key="m.code"
                      class="picker-item"
                      :class="{ disabled: isAlreadyAdded(m.code) }"
                    >
                      <input
                        type="checkbox"
                        :value="m.code"
                        v-model="selectedMasterCodes"
                        :disabled="isAlreadyAdded(m.code)"
                      />
                      <span class="name">{{ m.name }}</span>
                      <span v-if="isAlreadyAdded(m.code)" class="tag">이미 적용됨</span>
                    </label>
                    <div v-if="visibleMasters.length === 0" class="hint-under">항목이 없습니다.</div>
                  </div>
                  <div class="picker-actions">
                    <button
                      class="btn-save"
                      :disabled="selectedMasterCodes.length === 0"
                      @click="addSelectedMasters"
                    >
                      정책에 추가 ({{ selectedMasterCodes.length }})
                    </button>
                  </div>
                </div>


                <div v-if="mastersError" class="error-text">⚠ {{ mastersError }}</div>
                <div v-if="itemsError" class="error-text">⚠ {{ itemsError }}</div>
              </div>
              <div class="card">
                <div class="card-title">적용 항목 목록</div>
                <div class="table-wrap">
                  <table class="items-table">
                    <thead>
                      <tr>
                        <th style="width: 220px">항목</th>
                        <th style="width: 240px">마스터 정보</th>
                        <th style="width: 110px">활성</th>
                        <th style="width: 170px">적용 시작</th>
                        <th style="width: 170px">적용 종료</th>
                        <th style="width: 140px">대상</th>
                        <th style="width: 90px">삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="currentRows.length === 0">
                        <td colspan="7" class="empty-td">아직 추가된 항목이 없습니다. 위에서 마스터 항목을 선택하고 “정책에 추가”를 눌러주세요.</td>
                      </tr>

                      <template v-for="row in currentRows" :key="row._key">
                        <tr>
                        <td>
                          <div class="item-cell">
                            <div class="item-name">{{ getMasterName(row) }}</div>
                            <!-- <div class="item-code">{{ row.itemCode }}</div> -->
                          </div>
                        </td>

                        <td>
                            <div class="master-cell">
                            <div class="master-line">{{ masterInfo(row).line1 }}</div>
                            <div class="master-badges">
                              <span v-for="b in masterInfo(row).badges" :key="b" class="badge">{{ b }}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <label class="switch">
                            <input
                              type="checkbox"
                              :checked="row.activeYn === 'Y'"
                              @change="(e) => (row.activeYn = (e.target as HTMLInputElement).checked ? 'Y' : 'N')"
                            />
                            <span class="slider"></span>
                          </label>
                        </td>
                        <td>
                          <div class="period-cell">
                          <div class="period-text">{{ row.salaryMonthFrom }}</div>
                            <button class="btn-secondary btn-small" type="button" @click="row._editPeriod = !row._editPeriod">
                              {{ row._editPeriod ? '닫기' : '수정' }}
                            </button>
                          </div>
                        </td>
                        <td>
                          <div class="period-cell">
                            <div class="period-text">{{ row.salaryMonthTo ? row.salaryMonthTo : '∞' }}</div>
                          </div>
                        </td>
                        <td>
                          <button class="btn-secondary btn-small" @click="openTargetsModal(row)">
                      {{ targetSummary(row) }}
                          </button>
                        </td>
                        <td>
                          <button class="btn-danger btn-small" @click="removeRow(row)">삭제</button>
                        </td>
                      </tr>
                      <tr v-if="row._editPeriod" class="edit-row">
                        <td colspan="7">
                          <div class="edit-panel">
                            <div class="edit-field">
                              <div class="edit-label">적용 시작</div>
                              <input class="input-text" type="month" v-model="row.salaryMonthFrom" />
                            </div>
                            <div class="edit-field">
                              <div class="edit-label">적용 종료</div>
                              <input class="input-text" type="month" v-model="row.salaryMonthTo" placeholder="YYYY-MM(선택)" />
                            </div>
                            <div class="edit-hint">종료를 비우면 무기한으로 적용됩니다.</div>
                          </div>
                        </td>
                      </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
                      <div v-if="tab !== 'basic'" class="panel-footer-actions">
              <button class="btn-save" :disabled="!configsDirty || savingConfigs" @click="saveConfigs">
                <template v-if="savingConfigs">저장 중...</template>
                <template v-else>{{ configsDirty ? '저장' : '저장됨' }}</template>
              </button>
            </div>
            <div v-if="configsDirty" class="dirty-hint">
               변경사항이 있어요. 우측 하단 <b>저장</b>을 눌러 반영해주세요.
            </div>
          </div>
        </div>
      </div>
    </template>
    <div v-if="activateModalOpen" class="modal-backdrop" @click.self="closeActivateModal">
      <div class="modal">
        <div class="modal-header">
          <h4 class="modal-title">정책 활성화</h4>
          <button class="btn-icon-x" @click="closeActivateModal">×</button>
        </div>
        <div class="modal-body">
          <p class="hint-modal">
            선택한 정책을 <b>ACTIVE</b>로 전환합니다. 기존 ACTIVE 정책이 있으면 EXPIRED 처리됩니다.
          </p>
          <div class="form-grid-2">
            <div class="form-row">
              <label class="label">적용 시작 급여월</label>
              <input v-model="activateForm.salaryMonthFrom" class="input-text" type="text" placeholder="YYYY-MM" />
            </div>
            <div class="form-row">
              <label class="label">적용 종료 급여월</label>
              <input v-model="activateForm.salaryMonthTo" class="input-text" type="text" placeholder="YYYY-MM (선택)" />
            </div>
          </div>

          <p v-if="activateError" class="error-text">⚠ {{ activateError }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeActivateModal">취소</button>
          <button class="btn-save" @click="submitActivate" :disabled="activating">
            {{ activating ? '처리 중...' : '활성화' }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="targetsModal.open" class="modal-backdrop" @click.self="closeTargetsModal">
      <div class="modal">
        <div class="modal-header">
          <h4 class="modal-title">적용 대상 설정</h4>
          <button class="btn-icon-x" @click="closeTargetsModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label class="label">대상 유형</label>
            <select class="input-text" v-model="targetsModal.targetType">
              <option value="ALL">전체</option>
              <option value="DEPARTMENT">부서</option>
              <option value="POSITION">직급</option>
              <option value="EMPLOYEE">사원</option>
            </select>
          </div>
          <div v-if="targetsModal.targetType === 'ALL'" class="hint-under">
            전체(ALL)로 설정하면 추가 값 없이 모든 대상에게 적용됩니다.
          </div>
          <template v-else>
            <div class="target-add">
              <input class="input-text" v-model="targetsModal.newValue" placeholder="예) DEV / P001 / 1001" />
              <button class="btn-secondary" @click="addTargetValue">추가</button>
            </div>
            <div class="chips">
              <button v-for="(v, idx) in targetsModal.values" :key="v + '_' + idx" class="chip" @click="removeTargetValue(idx)">
                {{ v }} <span class="x">×</span>
              </button>
              <div v-if="targetsModal.values.length === 0" class="hint-under">아직 추가된 대상 값이 없어요.</div>
            </div>
          </template>

          <p v-if="targetsModal.error" class="error-text">⚠ {{ targetsModal.error }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeTargetsModal">취소</button>
          <button class="btn-save" @click="applyTargetsModal">적용</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch,nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSettingsPayrollStore } from '@/stores/settings/settings-payroll.store';
import type {
  PolicyActivateRequest,
  PolicyConfigUpsertRequest,
  ItemType,
  ItemPolicyUpsertRequest,
} from '@/types/settings/settings-payroll.types';
import { settingsPayrollApi } from '@/api/settings/settings-payroll.api';


const route = useRoute();
const router = useRouter();
const store = useSettingsPayrollStore();
const isHydrating = ref(false);
const policyId = computed(() => Number(route.params.policyId ?? route.params.id));
const hasValidPolicyId = computed(() => Number.isFinite(policyId.value) && policyId.value > 0);
const loading = computed(() => store.loading);
const saving = computed(() => store.saving);
const detail = computed(() => store.detail);
const policy = computed(() => store.detail?.policy ?? null);
type EditableConfig = PolicyConfigUpsertRequest & { _key: string };
const mkKey = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;
function normalizeBlankToNull(v: any): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  const s = String(v);
  return s.trim() === '' ? null : s;
}
function stripConfig(row: EditableConfig): PolicyConfigUpsertRequest {
  return {
    configKey: row.configKey,
    valueType: row.valueType,
    configValue: row.configValue,
    description: row.description ?? null,
    activeYn: row.activeYn ?? null,
  };
}
function snapshotConfigs(rows: EditableConfig[]) {
  return JSON.stringify(rows.map(stripConfig));
}
const ui = reactive({
  configRows: [] as EditableConfig[],
});
const snap = reactive({ config: '' });
type ItemTypeUi = 'ALLOWANCE' | 'DEDUCTION';
type CalcMethodUi = 'FIXED' | 'RATE';
type PayrollTargetTypeUi = 'ALL' | 'DEPARTMENT' | 'POSITION' | 'EMPLOYEE';
type MasterItem = {
  code: string;
  name: string;
  description?: string | null;
  defaultAmount?: number | null;
  taxableYn?: 'Y' | 'N' | null;
  deductionType?: string | null;
  calculationType?: string | null;
  rate?: number | null;
  fixedAmount?: number | null;
};
function getMasterName(row: ItemPolicyRow) {
  const list = row.itemType === 'ALLOWANCE' ? masters.allowances : masters.deductions;
  const found = (list ?? []).find((m) => m.code === (row.itemCode ?? '').trim());
  return found?.name ?? '(알 수 없음)';
}
function targetSummary(row: ItemPolicyRow) {
  const targets = row.targets ?? [];
  if (targets.length === 0) return '대상 미설정';
  const type = targets[0]?.payrollTargetType ?? 'ALL';
  if (type === 'ALL') return '전체';
  const label =
    type === 'DEPARTMENT' ? '부서' :
    type === 'POSITION' ? '직급' :
    type === 'EMPLOYEE' ? '사원' : '대상';
  const cnt = targets.filter((t) => t.payrollTargetType === type).length;
  const unit = type === 'EMPLOYEE' ? '명' : '개';
  return `${label} ${cnt}${unit}`;
}

type ItemPolicyRow = {
  _key: string;
  _editPeriod?: boolean;
  itemPolicyId: number | null;
  itemType: ItemTypeUi;
  itemCode: string;
  calcMethod: CalcMethodUi;
  fixedAmount: number | null;
  rate: number | null;
  salaryMonthFrom: string;
  salaryMonthTo: string;
  activeYn: 'Y' | 'N';
  priority: number | null;
  targets: Array<{ payrollTargetType: PayrollTargetTypeUi; targetValue: string | null }>;
};

const basicItemType = ref<ItemTypeUi>('ALLOWANCE');
const masters = reactive({
  allowances: [] as MasterItem[],
  deductions: [] as MasterItem[],
});
const itemUi = reactive({
  allowanceRows: [] as ItemPolicyRow[],
  deductionRows: [] as ItemPolicyRow[],
});
const itemSnap = reactive({ allowance: '', deduction: '' });
const savingItems = ref(false);
const itemsError = ref<string | null>(null);
const mastersError = ref<string | null>(null);

function snapshotRows(rows: ItemPolicyRow[]) {
  return JSON.stringify(
    rows.map((r) => ({
      itemPolicyId: r.itemPolicyId,
      itemType: r.itemType,
      itemCode: r.itemCode,
      calcMethod: r.calcMethod,
      fixedAmount: r.fixedAmount,
      rate: r.rate,
      salaryMonthFrom: r.salaryMonthFrom,
      salaryMonthTo: r.salaryMonthTo,
      activeYn: r.activeYn,
      priority: r.priority,
      targets: r.targets,
    }))
  );
}
const currentRows = computed(() => (basicItemType.value === 'ALLOWANCE' ? itemUi.allowanceRows : itemUi.deductionRows));
const currentMasters = computed(() => (basicItemType.value === 'ALLOWANCE' ? masters.allowances : masters.deductions));
const masterSearch = ref('');
const selectedMasterCodes = ref<string[]>([]);
const hideAlreadyAdded = ref(true);
const alreadyAddedCount = computed(() => {
  const list = filteredMasters.value ?? [];
  return list.filter((m) => isAlreadyAdded(m.code)).length;
});
const visibleMasters = computed(() => {
  const list = filteredMasters.value ?? [];
  if (!hideAlreadyAdded.value) return list;
  return list.filter((m) => !isAlreadyAdded(m.code));
});
const selectedPreview = computed(() => {
  const set = new Set(selectedMasterCodes.value);
  return (currentMasters.value ?? []).filter((m) => set.has(m.code)).slice(0, 6);
});
function unselectMaster(code: string) {
  selectedMasterCodes.value = selectedMasterCodes.value.filter((c) => c !== code);
}
const filteredMasters = computed(() => {
  const q = masterSearch.value.trim().toLowerCase();
  const list = currentMasters.value ?? [];
  if (!q) return list;
  return list.filter((m) => `${m.name} ${m.code}`.toLowerCase().includes(q));
});
function isAlreadyAdded(code: string) {
  const list = currentRows.value ?? [];
  return list.some((r) => (r.itemCode ?? '').trim() === code);
}
function toggleAllMasters(on: boolean) {
  if (!on) {
    selectedMasterCodes.value = [];
    return;
  }
  selectedMasterCodes.value = filteredMasters.value
    .map((m) => m.code)
    .filter((code) => !isAlreadyAdded(code));
}
function formatWon(v: number) {
  return `${v.toLocaleString()}원`;
}
function formatRate(v: number) {
  const n = Math.round(v * 100) / 100;
  return `${n}%`;
}
function masterInfo(row: ItemPolicyRow) {
  const list = row.itemType === 'ALLOWANCE' ? masters.allowances : masters.deductions;
  const m = (list ?? []).find((x) => x.code === (row.itemCode ?? '').trim());
  if (!m) return { line1: '-', badges: [] as string[], desc: null as string | null };
  const desc = m.description ?? null;
  if (row.itemType === 'ALLOWANCE') {
    const amount = m.defaultAmount ?? 0;
    const tax = m.taxableYn === 'Y' ? '과세' : m.taxableYn === 'N' ? '비과세' : '과세정보없음';
    return {
      line1: `기본 ${formatWon(amount)}`,
      badges: [tax],
      desc,
    };
  }
  const type = m.deductionType ?? 'ETC';
  const calc = m.calculationType ?? 'FIXED';
  const line1 =
    calc === 'RATE'
      ? `기본 ${formatRate(m.rate ?? 0)}`
      : `기본 ${formatWon(m.fixedAmount ?? 0)}`;
  const typeBadge = type === 'TAX' ? '세금' : type === 'INSURANCE' ? '보험' : '기타';
  const calcBadge = calc === 'RATE' ? '정률' : '정액';
  return {
    line1,
    badges: [typeBadge, calcBadge],
    desc,
  };
}
function addSelectedMasters() {
  if (!detail.value) return;
  itemsError.value = null;
  const codes = selectedMasterCodes.value.filter((c) => !isAlreadyAdded(c));
  if (codes.length === 0) {
    itemsError.value = '적용할 항목을 선택해주세요.';
    return;
  }
  const baseFrom = detail.value.policy.salaryMonthFrom ?? '';
  const newRows: ItemPolicyRow[] = codes.map((code) => ({
    _key: mkKey(),
    _editPeriod: false,
    itemPolicyId: null,
    itemType: basicItemType.value,
    itemCode: code,
    calcMethod: 'FIXED',
    fixedAmount: null,
    rate: null,
    salaryMonthFrom: baseFrom,
    salaryMonthTo: '',
    activeYn: 'Y',
    priority: null,
    targets: [{ payrollTargetType: 'ALL', targetValue: null }],
  }));
  if (basicItemType.value === 'ALLOWANCE') itemUi.allowanceRows.unshift(...newRows);
  else itemUi.deductionRows.unshift(...newRows);
  selectedMasterCodes.value = [];
}
const itemsDirty = computed(() => {
  const now = basicItemType.value === 'ALLOWANCE' ? snapshotRows(itemUi.allowanceRows) : snapshotRows(itemUi.deductionRows);
  const prev = basicItemType.value === 'ALLOWANCE' ? itemSnap.allowance : itemSnap.deduction;
  return now !== prev;
});
const targetsModal = reactive({
  open: false,
  rowKey: '' as string,
  targetType: 'ALL' as PayrollTargetTypeUi,
  values: [] as string[],
  newValue: '',
  error: '' as string,
});
function openTargetsModal(row: ItemPolicyRow) {
  targetsModal.open = true;
  targetsModal.rowKey = row._key;
  targetsModal.error = '';
  targetsModal.newValue = '';
  if (!row.targets || row.targets.length === 0) {
    targetsModal.targetType = 'ALL';
    targetsModal.values = [];
    return;
  }
  const type = row.targets[0]?.payrollTargetType ?? 'ALL';
  targetsModal.targetType = type;
  targetsModal.values =
    type === 'ALL'
      ? []
      : row.targets.filter((t) => t.payrollTargetType === type).map((t) => (t.targetValue ?? '').trim()).filter(Boolean);
}
function closeTargetsModal() {
  targetsModal.open = false;
}
function addTargetValue() {
  targetsModal.error = '';
  const v = (targetsModal.newValue ?? '').trim();
  if (!v) return;
  if (targetsModal.values.includes(v)) {
    targetsModal.error = '이미 추가된 값이에요.';
    return;
  }
  targetsModal.values.push(v);
  targetsModal.newValue = '';
}
function removeTargetValue(idx: number) {
  targetsModal.values.splice(idx, 1);
}
function applyTargetsModal() {
  const row = [...itemUi.allowanceRows, ...itemUi.deductionRows].find((r) => r._key === targetsModal.rowKey);
  if (!row) {
    closeTargetsModal();
    return;
  }
  if (targetsModal.targetType === 'ALL') {
    row.targets = [{ payrollTargetType: 'ALL', targetValue: null }];
    closeTargetsModal();
    return;
  }
  if (targetsModal.values.length === 0) {
    targetsModal.error = '대상 값을 1개 이상 추가해주세요. (또는 전체(ALL) 선택)';
    return;
  }
  row.targets = targetsModal.values.map((v) => ({
    payrollTargetType: targetsModal.targetType,
    targetValue: v,
  }));
  closeTargetsModal();
}

function normalizeTargetsFromDetail(targets: any[]): Array<{ payrollTargetType: PayrollTargetTypeUi; targetValue: string | null }> {
  if (!targets || targets.length === 0) return [{ payrollTargetType: 'ALL', targetValue: null }];
  return targets.map((t) => ({
    payrollTargetType: (t.payrollTargetType ?? 'ALL') as PayrollTargetTypeUi,
    targetValue: t.targetValue ?? null,
  }));
}
function loadItemsFromDetail() {
  if (!detail.value) return;
  const map = (type: ItemTypeUi) => {
    const list = (detail.value as any).items?.[type] ?? [];
    const rows: ItemPolicyRow[] = list.map((wrap: any) => {
      const item = wrap.item;
      const targets = wrap.targets ?? [];
      return {
        _key: mkKey(),
        _editPeriod: false,
        itemPolicyId: item.itemPolicyId ?? null,
        itemType: type,
        itemCode: item.itemCode ?? '',
        calcMethod: (item.calcMethod ?? 'FIXED') as CalcMethodUi,
        fixedAmount: item.fixedAmount ?? null,
        rate: item.rate ?? null,
        salaryMonthFrom: item.salaryMonthFrom ?? detail.value!.policy.salaryMonthFrom ?? '',
        salaryMonthTo: item.salaryMonthTo ?? '',
        activeYn: (item.activeYn ?? 'Y') as 'Y' | 'N',
        priority: item.priority ?? null,
        targets: normalizeTargetsFromDetail(targets),
      };
    });
    return rows;
  };
  itemUi.allowanceRows = map('ALLOWANCE');
  itemUi.deductionRows = map('DEDUCTION');
  itemSnap.allowance = snapshotRows(itemUi.allowanceRows);
  itemSnap.deduction = snapshotRows(itemUi.deductionRows);
}
async function loadMasters() {
  try {
    mastersError.value = null;
    const [allow, ded] = await Promise.all([
      settingsPayrollApi.listAllowances('Y'),
      settingsPayrollApi.listDeductions('Y'),
    ]);
    masters.allowances =
      (allow as any[]).map((a) => ({
        code: (a.code ?? a.allowanceCode ?? a.itemCode ?? a.itemCodeName ?? '') || String(a.allowanceId ?? ''),
        name: a.allowanceName ?? a.name ?? a.itemName ?? '',
                description: a.description ?? null,
        defaultAmount: a.defaultAmount ?? null,
        taxableYn: a.taxableYn ?? null,
      })) ?? [];
    masters.deductions =
      (ded as any[]).map((d) => ({
        code: (d.code ?? d.deductionCode ?? d.itemCode ?? d.itemCodeName ?? '') || String(d.deductionId ?? ''),
        name: d.deductionName ?? d.name ?? d.itemName ?? '',
                description: d.description ?? null,
        deductionType: d.deductionType ?? null,
        calculationType: d.calculationType ?? null,
        rate: d.rate ?? null,
        fixedAmount: d.fixedAmount ?? null,
      })) ?? [];
  } catch (e: any) {
    mastersError.value = `마스터(수당/공제) 목록을 불러오지 못했어요. (${e?.message ?? 'unknown'})`;
  }
}
function addPolicyRow() {
  if (!detail.value) return;
  const baseFrom = detail.value.policy.salaryMonthFrom ?? '';
  const row: ItemPolicyRow = {
    _key: mkKey(),
    itemPolicyId: null,
    itemType: basicItemType.value,
    itemCode: '',
    calcMethod: 'FIXED',
    fixedAmount: null,
    rate: null,
    salaryMonthFrom: baseFrom,
    salaryMonthTo: '',
    activeYn: 'Y',
    priority: null,
    targets: [{ payrollTargetType: 'ALL', targetValue: null }],
  };
  if (basicItemType.value === 'ALLOWANCE') itemUi.allowanceRows.unshift(row);
  else itemUi.deductionRows.unshift(row);
}
function removeRow(row: ItemPolicyRow) {
  const list = row.itemType === 'ALLOWANCE' ? itemUi.allowanceRows : itemUi.deductionRows;
  const idx = list.findIndex((r) => r._key === row._key);
  if (idx >= 0) list.splice(idx, 1);
}
function validateYm(s: string, allowBlank: boolean) {
  const v = (s ?? '').trim();
  if (!v) return allowBlank;
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
}
function buildItemUpsertPayload(type: ItemType, rows: ItemPolicyRow[]): ItemPolicyUpsertRequest[] {
  return rows.map((r) => ({
    itemPolicyId: r.itemPolicyId ?? null,
    itemType: type,
    itemCode: (r.itemCode ?? '').trim(),
    calcMethod: r.calcMethod as any,
    fixedAmount: r.calcMethod === 'FIXED' ? (r.fixedAmount ?? 0) : null,
    rate: r.calcMethod === 'RATE' ? (r.rate ?? 0) : null,
    baseAmountType: null as any,
    roundingUnit: null as any,
    roundingMode: null as any,
    salaryMonthFrom: (r.salaryMonthFrom ?? '').trim(),
    salaryMonthTo: normalizeBlankToNull(r.salaryMonthTo) as any,
    priority: r.priority ?? 0,
    activeYn: r.activeYn,
    targets: (r.targets ?? []).map((t) => ({
      payrollTargetType: t.payrollTargetType as any,
      targetValue: t.targetValue ?? null,
    })),
  }));
}
async function saveItems() {
  if (!hasValidPolicyId.value) return;
  itemsError.value = null;
  const rows = currentRows.value;
  for (const r of rows) {
    if (!r.itemCode?.trim()) {
      itemsError.value = '항목을 선택하지 않은 행이 있어요.';
      return;
    }
    if (!validateYm(r.salaryMonthFrom, false)) {
      itemsError.value = '적용 시작 급여월은 YYYY-MM 형식이어야 해요.';
      return;
    }
    if (!validateYm(r.salaryMonthTo, true)) {
      itemsError.value = '적용 종료 급여월은 YYYY-MM 형식이어야 해요. (또는 비워두기)';
      return;
    }
        if (r.salaryMonthTo && r.salaryMonthFrom && r.salaryMonthTo < r.salaryMonthFrom) {
      itemsError.value = '적용 종료 급여월은 시작 급여월보다 빠를 수 없어요.';
      return;
    }
  }
  savingItems.value = true;
  try {
    const type = basicItemType.value as unknown as ItemType;
    const payload = buildItemUpsertPayload(type, rows);
    await settingsPayrollApi.upsertItemPolicies(policyId.value!, type, payload);
    await store.fetchPolicyDetail(policyId.value);
    loadItemsFromDetail();
    itemSnap.allowance = snapshotRows(itemUi.allowanceRows);
    itemSnap.deduction = snapshotRows(itemUi.deductionRows);
  } catch (e: any) {
    itemsError.value = '항목 저장 중 오류가 발생했어요.';
  } finally {
    savingItems.value = false;
  }
}
function loadLocalFromDetail() {
  if (!detail.value) return;
  ui.configRows = (detail.value.configs ?? []).map((c: any) => ({
    _key: mkKey(),
    configKey: c.configKey,
    valueType: c.valueType,
    configValue: String(c.configValue ?? ''),
    description: c.description ?? null,
    activeYn: c.activeYn,
  }));
  snap.config = snapshotConfigs(ui.configRows);
  syncScheduleFormFromConfigs();
  syncCalcFormFromConfigs();
  syncBasicFormFromConfigs();
  loadItemsFromDetail();
}
const calcForm = reactive({
  roundingMode: '',
  roundingUnit: '',
  baseAmountType: '',
  memo: '',
});

watch(
  () => store.detail,
  async () => {
    isHydrating.value = true;
    loadLocalFromDetail();
    await nextTick();
    isHydrating.value = false;
  },
  { deep: false }
);


watch(
  calcForm,
  () => {
    if (isHydrating.value) return;

    if (calcForm.roundingMode) upsertLocalConfig('ROUNDING_MODE', 'STRING', calcForm.roundingMode, '반올림 방식(HALF_UP/FLOOR/CEIL)');
    if (calcForm.roundingUnit) upsertLocalConfig('ROUNDING_UNIT', 'NUMBER', calcForm.roundingUnit, '처리 단위(1/10/100)');
    if (calcForm.baseAmountType) upsertLocalConfig('BASE_AMOUNT_TYPE', 'STRING', calcForm.baseAmountType, '계산 기준(BASE_SALARY/NORMAL_WAGE)');
    if (calcForm.memo) upsertLocalConfig('DESCRIPTION_MEMO', 'STRING', calcForm.memo, '설명(메모)');
  },
  { deep: true }
);



onMounted(async () => {
  if (!hasValidPolicyId.value) {
    router.replace('/settings/payroll-policy');
    return;
  }
  await store.fetchPolicyDetail(policyId.value);
  await loadMasters();
});
const tab = ref<'pay' | 'calc' | 'basic'>('pay');
const savingConfigs = computed(() => saving.value);
const configsDirty = computed(() => snapshotConfigs(ui.configRows) !== snap.config);
const canActivate = computed(() => {
  const has = (key: string) =>
    (ui.configRows ?? []).some((c) => (c.configKey ?? '').trim() === key && String(c.configValue ?? '').trim() !== '');
  return has('PAYDAY_DAY') && has('CLOSE_DAY') && has('ROUNDING_MODE') && has('ROUNDING_UNIT');
});
function goBack() {
  router.push('/settings/payroll-policy');
}
function statusClass(s?: string | null) {
  if (!s) return '';
  const v = String(s).toUpperCase();
  if (v === 'ACTIVE') return 'badge-active';
  if (v === 'DRAFT') return 'badge-draft';
  if (v === 'EXPIRED') return 'badge-expired';
  return '';
}
function formatPeriod(from?: string | null, to?: string | null) {
  const f = from ?? '-';
  const t = to ?? '∞';
  return `${f} ~ ${t}`;
}
function rowPeriodText(row: ItemPolicyRow) {
  const baseFrom = detail.value?.policy.salaryMonthFrom ?? '-';
  const baseTo = detail.value?.policy.salaryMonthTo ?? '∞';
  const from = (row.salaryMonthFrom ?? '').trim() || baseFrom;
  const to = (row.salaryMonthTo ?? '').trim() || baseTo;
  return `${from} ~ ${to}`;
}
function hasConfig(key: string) {
  return (ui.configRows ?? []).some(
    (c) => (c.configKey ?? '').trim() === key && String(c.configValue ?? '').trim() !== ''
  );
}
function getConfigValue(key: string): string | null {
  const row = ui.configRows.find((c) => (c.configKey ?? '').trim() === key);
  if (!row) return null;
  const v = String(row.configValue ?? '').trim();
  return v === '' ? null : v;
}
function upsertLocalConfig(key: string, valueType: any, value: any, description?: string) {
  const idx = ui.configRows.findIndex((c) => (c.configKey ?? '').trim() === key);
  const row = {
    _key: mkKey(),
    configKey: key,
    valueType,
    configValue: String(value ?? ''),
    description: description ?? null,
    activeYn: 'Y',
  } as any;
  if (idx >= 0) ui.configRows[idx] = { ...(ui.configRows[idx] as any), ...row, _key: ui.configRows[idx]._key };
  else ui.configRows.unshift(row);
}

async function saveConfigs() {
  if (!hasValidPolicyId.value) return;
  const payload = ui.configRows.map((r) => ({
    configKey: r.configKey,
    valueType: r.valueType,
    configValue: r.configValue,
    description: r.description ?? null,
    activeYn: r.activeYn ?? null,
  }));
  await store.upsertConfigs(policyId.value, payload);
  snap.config = snapshotConfigs(ui.configRows);
}
function syncCalcFormFromConfigs() {
  calcForm.roundingMode = getConfigValue('ROUNDING_MODE') ?? '';
  calcForm.roundingUnit = getConfigValue('ROUNDING_UNIT') ?? '';
  calcForm.baseAmountType = getConfigValue('BASE_AMOUNT_TYPE') ?? '';
  calcForm.memo = getConfigValue('DESCRIPTION_MEMO') ?? '';
}
function applyCalcToConfigs() {
  if (calcForm.roundingMode)
    upsertLocalConfig('ROUNDING_MODE', 'STRING', calcForm.roundingMode, '반올림 방식(HALF_UP/FLOOR/CEIL)');
  if (calcForm.roundingUnit)
    upsertLocalConfig('ROUNDING_UNIT', 'NUMBER', calcForm.roundingUnit, '처리 단위(1/10/100)');
  if (calcForm.baseAmountType)
    upsertLocalConfig('BASE_AMOUNT_TYPE', 'STRING', calcForm.baseAmountType, '계산 기준(BASE_SALARY/NORMAL_WAGE)');
  if (calcForm.memo) upsertLocalConfig('DESCRIPTION_MEMO', 'STRING', calcForm.memo, '설명(메모)');
}
const scheduleForm = reactive({
  paydayDay: null as number | null,
  closeDay: null as number | null,
  holidayRule: 'NONE',
  payslipSendDay: null as number | null,
});

const payrollPreviewText = computed(() => {
  if (!scheduleForm.paydayDay) return '급여 지급일이 아직 설정되지 않았어요.';

  let ruleText = '';
  switch (scheduleForm.holidayRule) {
    case 'PREV_BUSINESS_DAY':
      ruleText = ' (주말/공휴일이면 전 영업일)';
      break;
    case 'NEXT_BUSINESS_DAY':
      ruleText = ' (주말/공휴일이면 다음 영업일)';
      break;
    default:
      ruleText = '';
  }
  const closeText = scheduleForm.closeDay ? ` · 정산 마감: ${scheduleForm.closeDay}일` : '';
  const sendText = scheduleForm.payslipSendDay ? ` · 명세서 발송: ${scheduleForm.payslipSendDay}일` : '';
  return `이번 달 기준 미리보기: 급여 지급 ${scheduleForm.paydayDay}일${ruleText}${closeText}${sendText}`;
});
function syncScheduleFormFromConfigs() {
  const payday = getConfigValue('PAYDAY_DAY');
  const close = getConfigValue('CLOSE_DAY');
  const rule = getConfigValue('HOLIDAY_RULE');
  const send = getConfigValue('PAYSLIP_SEND_DAY');
  scheduleForm.paydayDay = payday ? Number(payday) : null;
  scheduleForm.closeDay = close ? Number(close) : null;
  scheduleForm.holidayRule = rule ?? 'NONE';
  scheduleForm.payslipSendDay = send ? Number(send) : null;
}
function applyScheduleToConfigs() {
  if (scheduleForm.paydayDay !== null && (scheduleForm.paydayDay < 1 || scheduleForm.paydayDay > 31)) {
    alert('급여 지급일은 1~31 범위여야 해요.');
    return;
  }
  if (scheduleForm.closeDay !== null && (scheduleForm.closeDay < 1 || scheduleForm.closeDay > 31)) {
    alert('정산 마감일은 1~31 범위여야 해요.');
    return;
  }
  if (scheduleForm.payslipSendDay !== null && (scheduleForm.payslipSendDay < 1 || scheduleForm.payslipSendDay > 31)) {
    alert('명세서 발송일은 1~31 범위여야 해요.');
    return;
  }

  if (scheduleForm.paydayDay !== null) upsertLocalConfig('PAYDAY_DAY', 'NUMBER', scheduleForm.paydayDay, '급여 지급일(1~31)');
  if (scheduleForm.closeDay !== null) upsertLocalConfig('CLOSE_DAY', 'NUMBER', scheduleForm.closeDay, '정산 마감일(1~31)');
  if (scheduleForm.holidayRule) upsertLocalConfig('HOLIDAY_RULE', 'STRING', scheduleForm.holidayRule, '휴일 처리 규칙');
  if (scheduleForm.payslipSendDay !== null) upsertLocalConfig('PAYSLIP_SEND_DAY', 'NUMBER', scheduleForm.payslipSendDay, '명세서 발송일(1~31)');
}

watch(
  scheduleForm,
  () => {
    if (isHydrating.value) return;
    applyScheduleToConfigs();
  },
  { deep: true }
);
const basicForm = reactive({
  defaultItemActiveYn: '',
  defaultItemVisibleYn: '',
  calcOrder: '',
  taxRuleMode: '',
});
function syncBasicFormFromConfigs() {
  basicForm.defaultItemActiveYn = getConfigValue('DEFAULT_ITEM_ACTIVE_YN') ?? '';
  basicForm.defaultItemVisibleYn = getConfigValue('DEFAULT_ITEM_VISIBLE_YN') ?? '';
  basicForm.calcOrder = getConfigValue('CALC_ORDER') ?? '';
  basicForm.taxRuleMode = getConfigValue('TAX_RULE_MODE') ?? '';
}
const activateModalOpen = ref(false);
const activating = ref(false);
const activateError = ref<string | null>(null);

const activateForm = reactive<PolicyActivateRequest>({
  salaryMonthFrom: '',
  salaryMonthTo: null,
});

function openActivateModal() {
  activateModalOpen.value = true;
  activateError.value = null;
  activateForm.salaryMonthFrom = policy.value?.salaryMonthFrom ?? '';
  activateForm.salaryMonthTo = policy.value?.salaryMonthTo ?? null;
}
function closeActivateModal() {
  activateModalOpen.value = false;
  activateError.value = null;
}
async function submitActivate() {
  if (!hasValidPolicyId.value) return;
  if (!activateForm.salaryMonthFrom) {
    activateError.value = '적용 시작 급여월은 필수입니다.';
    return;
  }
  activating.value = true;
  activateError.value = null;
  try {
    await store.activatePolicy(policyId.value, {
      salaryMonthFrom: activateForm.salaryMonthFrom,
      salaryMonthTo: normalizeBlankToNull(activateForm.salaryMonthTo) as any,
    });
    activateModalOpen.value = false;
    await store.fetchPolicyDetail(policyId.value);
    await loadMasters();
  } catch (e: any) {
    activateError.value = store.error ?? '정책 활성화 중 오류가 발생했어요.';
  } finally {
    activating.value = false;
  }
}
</script>

<style scoped>
.page-content { display:flex; flex-direction:column; flex:1; min-height:0; overflow:hidden; }
.page-header {
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  padding:24px 24px 12px;
  margin-bottom:16px;
  gap:16px;
}
.left .title { margin:0; font-size:1.1rem; font-weight:800; color:#0f172b; }
.left .desc { margin:6px 0 0; font-size:.9rem; color:#64748b; }
.right { display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end; }
.policy-mini-header{
  display:flex;
  align-items:center;
  gap:8px;
  padding:0;
  margin:0;
  font-weight:900;
  color:#0f172b;
}
.policy-mini-header .pid{
  color:#475569;
  font-weight:900;
}
.policy-mini-header .pname{
  color:#0f172b;
  font-weight:950;
}
.policy-mini-header .period{
  color:#64748b;
  font-weight:900;
}
.policy-mini-header .dot{
  color:#cbd5e1;
  font-weight:900;
}
.settings-container{
  display:flex;
  height:calc(100vh - 260px);
  margin:0 24px 24px;
  border:1px solid #e2e8f0;
  border-radius:14px;
  overflow:hidden;
  background:#fff;
}
.side-nav{
  width:230px;
  background:#f8fafc;
  border-right:1px solid #e2e8f0;
  display:flex;
  flex-direction:column;
  padding:14px;
  gap:8px;
  flex-shrink:0;
}
.nav-title{
  font-weight:900;
  color:#0f172b;
  font-size:.9rem;
  padding:6px 6px 10px;
}
.nav-item{
  width:100%;
  border:1px solid transparent;
  background:transparent;
  cursor:pointer;
  text-align:left;
  padding:12px 12px;
  border-radius:12px;
  display:flex;
  flex-direction:column;
  gap:6px;
  color:#334155;
  font-weight:800;
  transition:all .15s;
  position:relative;
}
.nav-item .sub{
  font-weight:650;
  color:#64748b;
  font-size:.82rem;
}
.nav-item:hover{ background:#f1f5f9; }
.nav-item.active{
  background:#fff;
  border-color:#e2e8f0;
  box-shadow:0 6px 18px rgba(15,23,43,.06);
}
.content-area{ flex:1; min-width:0; overflow:auto; background:#fff; }
.panel { padding:16px; min-height:0; display:flex; flex-direction:column; gap:10px; position:relative; }
.panel-header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:6px; }
.panel-actions { display:flex; gap:10px; flex-wrap:wrap; }
.content-stack { display:flex; flex-direction:column; gap:10px; }
.card-title{ font-weight:900; color:#0f172b; font-size:16px;}
.card-desc{ margin-top:6px; color:#64748b; font-size:.9rem; font-weight:650; }
.card-actions{ display:flex; justify-content:flex-end; margin-top:10px; }
.form-row { display:flex; flex-direction:column; gap:8px; margin-bottom:12px; }
.form-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.label { font-size:16px; color:#475569; font-weight:800; }
.input-text { width:100%; padding:10px 12px; border-radius:10px; border:1px solid #e2e8f0; background:#f8fafc; outline:none; }
.input-text:focus { border-color:#93c5fd; background:#fff; }
.hint-under { margin:10px 0 0; color:#64748b; font-size:12px; font-weight:600; }
.dirty-hint{ padding:12px 14px; border:1px solid #fde68a; background:#fffbeb; border-radius:12px; color:#92400e; font-weight:800; }
.state-area { padding:40px 24px; color:#64748b; font-weight:800; }
.btn-save {
  background:linear-gradient(180deg,#1c398e 0%,#162456 100%);
  color:white; border:none; padding:10px 18px; border-radius:10px;
  cursor:pointer; font-weight:700;
}
.btn-save:disabled { opacity:.7; cursor:not-allowed; }
.btn-secondary {
  background:white; color:#0f172b; border:1px solid #e2e8f0;
  padding:10px 14px; border-radius:10px; cursor:pointer; font-weight:700;
}
.btn-secondary:disabled { opacity:.7; cursor:not-allowed; }
.btn-danger {
  background:#fff;
  color:#b91c1c;
  border:1px solid #fecaca;
  padding:10px 14px;
  border-radius:10px;
  cursor:pointer;
  font-weight:800;
}
.btn-danger:hover { background:#fef2f2; }
.btn-small { padding:5px 8px; border-radius:10px; font-size:.85rem; }
.period-cell{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}
.period-text{
  font-weight:900;
  color:#0f172b;
  font-size:.9rem;
}
.edit-row td{
  background:#f8fafc;
  padding:12px 12px;
  border-bottom:1px solid #eef2f7;
}
.edit-panel{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
  align-items:end;
  padding:10px;
  border:1px solid #e2e8f0;
  background:#fff;
  border-radius:12px;
}
.edit-label{
  font-size:12px;
  font-weight:900;
  color:#64748b;
  margin-bottom:6px;
}
.edit-hint{
  grid-column:1 / -1;
  font-size:12px;
  font-weight:800;
  color:#64748b;
}
@media (max-width: 900px){
  .edit-panel{ grid-template-columns:1fr; }
}

.mini-count{
  display:inline-flex;
  margin-left:6px;
  font-size:.75rem;
  font-weight:900;
  padding:1px 7px;
  border-radius:999px;
  border:1px solid #e2e8f0;
  background:#fff;
}
.badge { display:inline-flex; align-items:center; height:22px; padding:0 10px; border-radius:999px; font-size:12px; font-weight:800; border:1px solid #e2e8f0; background:#f8fafc; color:#334155; }
.badge-active { border-color:#93c5fd; background:#eff6ff; color:#1d4ed8; }
.badge-draft { border-color:#e5e7eb; background:#f9fafb; color:#475569; }
.badge-expired { border-color:#fecaca; background:#fef2f2; color:#b91c1c; }
.basic-topbar{
  margin-top:12px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  flex-wrap:wrap;
}
.seg{
  display:flex;
  gap:8px;
  padding:6px;
  border:1px solid #e2e8f0;
  border-radius:12px;
  background:#f8fafc;
}
.seg-btn{
  border:none;
  background:transparent;
  cursor:pointer;
  padding:8px 12px;
  border-radius:10px;
  font-weight:900;
  color:#475569;
}
.seg-btn.active{
  background:#fff;
  border:1px solid #e2e8f0;
  color:#0f172b;
  box-shadow:0 6px 18px rgba(15,23,43,.06);
}
.actions{ display:flex; gap:10px; align-items:center; }
.master-picker{
  margin-top:12px;
  border:1px solid #e2e8f0;
  border-radius:12px;
  background:#f8fafc;
  padding:12px;
}
.picker-head{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  flex-wrap:wrap;
}
.picker-title{
  display:flex;
  align-items:baseline;
  gap:10px;
}
.picker-title .t{
  font-weight:900;
  color:#0f172b;
}

.t{
  font-size:16px;
}
.picker-title .meta{
  font-size:12px;
  font-weight:800;
  color:#64748b;
}
.toggle{
  display:flex;
  align-items:center;
  gap:8px;
  font-weight:800;
  color:#475569;
  font-size:.85rem;
}
.selected-chips{
  margin-top:10px;
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  align-items:center;
}
.selected-chips .more{
  font-size:.8rem;
  font-weight:900;
  color:#64748b;
}
.picker-actions{
  margin-top:12px;
  display:flex;
  justify-content:flex-end;
}

.picker-list{
  margin-top:10px;
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap:8px;
}
.picker-item{
  display:flex;
  align-items:center;
  gap:10px;
  padding:10px 12px;
  border:1px solid #e2e8f0;
  border-radius:12px;
  background:#fff;
  cursor:pointer;
}
.picker-item.disabled{ opacity:.6; cursor:not-allowed; }
.picker-item .name{ font-weight:900; color:#0f172b; }
.picker-item .code{ font-weight:800; color:#64748b; font-size:.85rem; }
.picker-item .tag{
  margin-left:auto;
  font-size:.75rem;
  font-weight:900;
  padding:2px 8px;
  border-radius:999px;
  border:1px solid #e2e8f0;
  background:#f8fafc;
  color:#64748b;
}
.table-wrap{ overflow:auto; margin-top:12px; border:1px solid #e2e8f0; border-radius:12px; }
.items-table{ width:100%; border-collapse:separate; border-spacing:0; min-width:1100px; table-layout:fixed; }
.items-table th,
.items-table td{
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.items-table thead th{
  position:sticky; top:0;
  background:#f8fafc;
  border-bottom:1px solid #e2e8f0;
  padding:12px 12px;
  text-align:left;
  font-size:14px;
  color:#475569;
  font-weight:900;
}
.items-table tbody td{
  border-bottom:1px solid #eef2f7;
  padding:10px 12px;
  vertical-align:middle;
}
.items-table tbody tr:hover td{ background:#fbfdff; }
.empty-td{ color:#64748b; font-weight:800; padding:18px 12px; text-align:center; }
.value-box{ min-width:160px; }
.value-hint{
  margin-top:6px;
  font-size:.75rem;
  font-weight:800;
  color:#64748b;
}
.item-cell{
  display:flex;
  flex-direction:column;
  gap:4px;
  padding:2px 0;
}
.item-name{
  font-weight:950;
  color:#0f172b;
}
.item-code{
  font-size:.8rem;
  font-weight:850;
  color:#64748b;
}
.switch{
  position:relative;
  display:inline-block;
  width:44px;
  height:24px;
}
.switch input{ display:none; }
.slider{
  position:absolute;
  cursor:pointer;
  top:0; left:0; right:0; bottom:0;
  background:#e2e8f0;
  border-radius:999px;
  transition:.15s;
}
.slider:before{
  position:absolute;
  content:"";
  height:18px; width:18px;
  left:3px; top:3px;
  background:white;
  border-radius:999px;
  transition:.15s;
  box-shadow:0 2px 8px rgba(15,23,43,.12);
}
.switch input:checked + .slider{
  background:#2855ff;
}
.switch input:checked + .slider:before{
  transform:translateX(20px);
}
.switch-text{
  margin-top:6px;
  font-size:.78rem;
  font-weight:900;
  color:#475569;
}
.method-group{
  display:flex;
  gap:8px;
  padding:6px;
  border:1px solid #e2e8f0;
  border-radius:12px;
  background:#f8fafc;
  width:max-content;
}
.method-btn{
  border:none;
  background:transparent;
  cursor:pointer;
  padding:8px 12px;
  border-radius:10px;
  font-weight:950;
  color:#475569;
}
.method-btn.active{
  background:#fff;
  border:1px solid #e2e8f0;
  color:#0f172b;
  box-shadow:0 6px 18px rgba(15,23,43,.06);
}
.target-add{ display:flex; gap:10px; align-items:center; margin-top:10px; }
.chips{ margin-top:12px; display:flex; flex-wrap:wrap; gap:8px; }
.chip{
  display:inline-flex;
  align-items:center;
  gap:8px;
  padding:6px 10px;
  border-radius:999px;
  border:1px solid #e2e8f0;
  background:#f8fafc;
  font-weight:800;
  color:#334155;
  cursor:pointer;
}
.chip .x{ font-weight:900; color:#94a3b8; }
.modal-backdrop { position:fixed; inset:0; background:rgba(15,23,43,.45); display:flex; align-items:center; justify-content:center; padding:24px; z-index:1000; }
.modal { width:760px; max-width:100%; background:#fff; border-radius:14px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 12px 30px rgba(0,0,0,.18); }
.modal-header { display:flex; justify-content:space-between; align-items:center; padding:16px 18px; border-bottom:1px solid #e2e8f0; }
.modal-title { margin:0; font-size:1rem; font-weight:900; color:#0f172b; }
.btn-icon-x { width:34px; height:34px; border-radius:10px; border:1px solid #e2e8f0; background:white; cursor:pointer; font-size:18px; line-height:1; }
.modal-body { padding:18px; }
.modal-footer { padding:16px 18px; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; gap:10px; }
.hint-modal { margin:0 0 14px; color:#475569; font-weight:650; }
.error-text { margin:10px 0 0; color:#ef4444; font-weight:800; }
@media (max-width: 900px) {
  .settings-container { height:auto; flex-direction:column; }
  .side-nav { width:100%; flex-direction:row; overflow:auto; gap:10px; border-right:none; border-bottom:1px solid #e2e8f0; }
  .nav-title { display:none; }
  .nav-item { min-width: 220px; }
  .form-grid-2 { grid-template-columns: 1fr; }
}
.master-cell{
  display:flex;
  flex-direction:column;
  gap:6px;
}
.master-line{
  font-weight:900;
  color:#0f172b;
}
.master-badges{
  display:flex;
  gap:6px;
  align-items:center;
  flex-wrap:wrap;
}
.badge{
  font-size:.75rem;
  font-weight:900;
  padding:2px 8px;
  border-radius:999px;
  border:1px solid #e2e8f0;
  background:#f8fafc;
  color:#475569;
}
.desc{
  font-size:.75rem;
  font-weight:900;
  color:#64748b;
  border-bottom:1px dashed #cbd5e1;
  cursor:help;
}

tr td{
  font-size:14px;
}

.panel-footer-actions{
  position: sticky;
  bottom: 12px;
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  z-index: 10;
  padding-top: 12px;
  background: linear-gradient(to top, #fff 70%, rgba(255,255,255,0));
}
</style>
