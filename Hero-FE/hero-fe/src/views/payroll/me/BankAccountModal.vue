<!-- 
 * <pre>
 * Vue Name : BankAccountModal.vue
 * Description     : 내 급여 -> 계좌 관리 모달창
 *
 *
 * History
 *   2025/12/09 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-account-modal
 * @author 동근
 * @version 1.0
 -->
<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-backdrop"
      @click.self="close"
    >
      <div class="modal">
        <header class="modal-header">
          <h2>지급 계좌 관리</h2>
          <button class="modal-close" @click="close">✕</button>
        </header>

        <section class="payslip-body">
          <!-- 등록된 계좌 목록 -->
          <div class="account-list">
            <h3 class="account-section-title">등록된 계좌</h3>
            <p v-if="!accounts.length" class="account-empty">
              등록된 계좌가 없습니다. 아래에서 새 계좌를 추가해주세요.
            </p>
            <ul v-else class="account-list-ul">
              <li
  v-for="acc in accounts"
  :key="acc.id"
  class="account-item"
  :class="{ 'account-item--selected': selectedAccountId === acc.id }"
  @click="
    () => {
      selectedAccountId = acc.id;
      isAddingNew = false;
      editingAccountId = null;
    }
  "
>
  <div class="account-item-main row">
    <input
      type="radio"
      :value="acc.id"
      v-model="selectedAccountId"
      @click.stop
    />

    <p class="account-item-bank bank">{{ acc.bankName }}</p>

    <div class="account-item-number-row number-row">
      <p class="account-item-number">
        {{ acc.accountNumber }} ({{ acc.accountHolder }})
      </p>
    </div>

    <div class="account-item-actions right actions">
      <button
        type="button"
        class="account-item-action"
        @click.stop="startEdit(acc)"
      >
        수정
      </button>
      <button
        type="button"
        class="account-item-action account-item-action--danger"
        @click.stop="deleteAccount(acc.id)"
      >
        삭제
      </button>
    </div>
  </div>

  <span v-if="acc.isPrimary" class="account-badge">
    급여 수령 계좌
  </span>
</li>
            </ul>
          </div>

          <div class="account-divider"></div>

          <!-- 새 계좌 추가 -->
          <div class="account-form-wrapper">
            <div class="account-form-header">
              <h3 class="account-section-title">새 계좌 추가</h3>
              <button
                type="button"
                class="btn-link-small"
                @click="toggleNewAccount"
              >
                {{ isAddingNew ? (editingAccountId ? '계좌 수정 취소' : '새 계좌 입력 취소') : '새 계좌 입력하기' }}
              </button>
            </div>

            <form
              v-if="isAddingNew"
              class="account-form"
              @submit.prevent="saveAccount"
            >
              <div class="form-row">
                <label class="form-label">은행명</label>
                <input
                  v-model="accountForm.bankCode"
                  type="text"
                  class="form-input"
                  placeholder="예: 우리은행"
                />
              </div>
              <div class="form-row">
                <label class="form-label">계좌번호</label>
                <input
                  v-model="accountForm.accountNumber"
                  type="text"
                  class="form-input"
                  placeholder="계좌번호를 입력하세요"
                />
              </div>
              <div class="form-row">
                <label class="form-label">예금주</label>
                <input
                  v-model="accountForm.accountHolder"
                  type="text"
                  class="form-input"
                  placeholder="예금주명을 입력하세요"
                />
              </div>
            </form>
          </div>
        </section>

        <footer class="modal-footer">
          <button class="btn-primary" @click="saveAccount">저장</button>
          <button class="btn-secondary" @click="close">취소</button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { usePayrollStore } from '@/stores/payroll/payrollMeStore';
import type { BankAccount, MyPaySummary } from '@/types/payroll/payroll.me';

/**
 * props 설명
 * open - 모달 열림 여부
 * accounts - 현재 사원의 계좌 목록
 * summary - 현재 조회 중인 급여 요약 정보
 * selectedMonth - 현재 선택된 급여 월 (YYYY-MM)
 */
const props = defineProps<{
  open: boolean;
  accounts: BankAccount[];
  summary: MyPaySummary | null;
  selectedMonth: string;
}>();


const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'saved'): void;
}>();


const startEdit = (acc: BankAccount) => {
  isAddingNew.value = true;
  editingAccountId.value = acc.id;
  accountForm.value = {
    bankCode: acc.bankName,
    accountNumber: acc.accountNumber,
    accountHolder: acc.accountHolder
  };
};

const deleteAccount = async (id: number) => {
  try {
    if (!confirm('해당 계좌를 삭제하시겠습니까?')) return;

    await store.deleteMyBankAccount(id);

    emit('saved');
  } catch (e: any) {
    console.log('UI CATCH:', e); // 확인용 로그

    alert(e?.message ?? '계좌 삭제 실패');
    console.error('계좌 삭제 실패', e);
  }
};


const store = usePayrollStore();

const selectedAccountId = ref<number | null>(null);
const editingAccountId = ref<number | null>(null);
const isAddingNew = ref(false);
const accountForm = ref({
  bankCode: '',
  accountNumber: '',
  accountHolder: ''
});

// 모달이 열릴 때마다 현재 선택/폼 초기화
watch(
  () => props.open,
  (val) => {
    if (!val) return;
    // summary 기준으로 현재 계좌 찾기
    if (props.summary) {
      const current = props.accounts.find(
        (acc) => acc.accountNumber === props.summary!.bankAccountNumber
      );
      if (current) {
        selectedAccountId.value = current.id;
      } else {
        const primary = props.accounts.find((acc) => acc.isPrimary);
        selectedAccountId.value = primary ? primary.id : null;
      }
    } else {
      const primary = props.accounts.find((acc) => acc.isPrimary);
      selectedAccountId.value = primary ? primary.id : null;
    }

// 모달 열릴때 초기화 로직 수정
    isAddingNew.value = false;
    editingAccountId.value = null;
    accountForm.value = {
      bankCode: '',
      accountNumber: '',
      accountHolder: ''
    };
  },
  { immediate: true }
);

const close = () => {
  emit('update:open', false);
};

// 새 계좌 입력/수정 폼 열기/닫기 토글
const toggleNewAccount = () => {
  isAddingNew.value = !isAddingNew.value;
  if (!isAddingNew.value) {
    editingAccountId.value = null;
    accountForm.value = {
      bankCode: '',
      accountNumber: '',
      accountHolder: ''
    };
  }
};

// 계좌 저장 처리
const saveAccount = async () => {
  try {
  //  기존 계좌 수정
    if (isAddingNew.value && editingAccountId.value != null) {
      if (
        !accountForm.value.bankCode.trim() ||
        !accountForm.value.accountNumber.trim() ||
        !accountForm.value.accountHolder.trim()
      ) {
        return;
      }
         if (!confirm('계좌 정보를 수정하시겠습니까?')) return;
      await store.updateMyBankAccount(editingAccountId.value, {
        bankCode: accountForm.value.bankCode.trim(),
        accountNumber: accountForm.value.accountNumber.trim(),
        accountHolder: accountForm.value.accountHolder.trim()
      });

      emit('saved'); 
      
      isAddingNew.value = false;
      editingAccountId.value = null;

      return;
    }

    // 신규 계좌 추가
    if (isAddingNew.value && editingAccountId.value == null) {
      if (
        !accountForm.value.bankCode.trim() ||
        !accountForm.value.accountNumber.trim() ||
        !accountForm.value.accountHolder.trim()
      ) {
        return;
      }

      if (!confirm('새 계좌를 등록하시겠습니까?')) return;

      await store.addMyBankAccount({
        bankCode: accountForm.value.bankCode.trim(),
        accountNumber: accountForm.value.accountNumber.trim(),
        accountHolder: accountForm.value.accountHolder.trim()
      });

      emit('saved');
      emit('update:open', false);
      return;
    }

//  폼 안 쓰고 대표 계좌만 변경 (라디오 선택 후 저장)
    if (!isAddingNew.value && selectedAccountId.value != null) {
        if (!confirm('이 계좌를 대표 계좌로 설정하시겠습니까?')) return;

      await store.setPrimaryBankAccount(selectedAccountId.value);
      
      emit('saved');
      emit('update:open', false);
      return;
    }
  } catch (e) {
    console.error('계좌 정보 저장 실패', e);
  }
};
</script>

<style scoped>
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
  width: 520px;
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

.payslip-body {
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

/* 계좌 전용 스타일 */
.account-list {
  margin-bottom: 12px;
}

.account-section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.account-empty {
  font-size: 13px;
  color: #9ca3af;
}

.account-list-ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.account-item {
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.account-item--selected {
  border-color: #2563eb;
  background-color: #eff6ff;
}

.account-item-main {
  display: flex;
  align-items: center;
  gap: 8px;
}
.account-item-main.row {
  width: 100%;
  display: grid;
  grid-template-columns: 20px 1fr auto; 
  grid-template-rows: auto auto;   
  column-gap: 8px;
  row-gap: 4px;
  align-items: center;
}

.account-item-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
  
}

.account-item-bank {
  font-size: 16px;
  font-weight: 600;
}

.account-item-number {
  font-size: 15px;
  font-weight: 700;
  color: #6b7280;
}

.account-item-number-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.account-item-actions.right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.account-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 999px;
  background-color: #dcfce7;
  color: #166534;
}

.account-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 12px 0;
}

.account-form-wrapper {
  margin-top: 4px;
}

.account-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-link-small {
  padding: 0;
  border: none;
  background: none;
  color: #2563eb;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
}

.account-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
}

.form-input {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  padding: 8px 10px;
  font-size: 13px;
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
  background: linear-gradient(135deg, #06336f, #123c9c);
  color: white;
}

.btn-secondary {
  background-color: #eef2ff;
  color: #374151;
}

.account-item-action {
  border: none;
  background: none;
  font-size: 14px;
  color: #123c9c;
  cursor: pointer;
  padding: 0;
}

.account-item-action--danger {
  color: #b91c1c;
}

.account-item-main.row > input[type="radio"] {
  grid-column: 1;
  grid-row: 1 / span 2;
}

.account-item-bank.bank {
  grid-column: 2;
  grid-row: 1;
}

.account-item-number-row.number-row {
  grid-column: 2;
  grid-row: 2;
}

.account-item-actions.actions {
  grid-column: 3;
  grid-row: 2;
  justify-self: end;
  align-self: center;
  margin-left: 0; 
}
.account-item-bank,
.account-item-number {
  margin: 0;
}
</style>
