<!--
 * <pre>
 * Vue Name        : DeductionModal.vue
 * Description     : 관리자 - 공제 항목 생성/수정 모달 컴포넌트
 *
 * History
 *   2025/12/23 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-admin-deduction-modal
 * @author 동근
 * @version 1.0
 -->
<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal">
          <header class="modal__header">
            <h3 class="modal__title">{{ mode === 'create' ? '공제 추가' : '공제 수정' }}</h3>
            <button class="icon-btn" @click="close" aria-label="닫기">✕</button>
          </header>

          <section class="modal__body">
            <label class="field">
              <span class="field__label">공제 코드</span>
              <input class="field__input" v-model="form.deductionId" :disabled="mode === 'edit'" placeholder="예: DD001" />
            </label>

            <label class="field">
              <span class="field__label">공제명</span>
              <input class="field__input" v-model="form.deductionName" placeholder="예: 국민연금" />
            </label>

            <div class="grid">
              <label class="field">
                <span class="field__label">유형</span>
                <select class="field__input" v-model="form.deductionType">
                  <option value="TAX">세금</option>
                  <option value="INSURANCE">보험</option>
                  <option value="ETC">기타</option>
                </select>
              </label>

              <label class="field">
                <span class="field__label">계산방식</span>
                <select class="field__input" v-model="form.calculationType" @change="syncCalcFields">
                  <option value="RATE">정률(%)</option>
                  <option value="FIXED">정액(원)</option>
                </select>
              </label>
            </div>

            <label class="field" v-if="form.calculationType === 'RATE'">
              <span class="field__label">비율(%)</span>
              <input class="field__input" v-model.number="form.rate" type="number" min="0" step="0.001" placeholder="예: 3.345" />
            </label>

            <label class="field" v-else>
              <span class="field__label">정액(원)</span>
              <input class="field__input" v-model.number="form.fixedAmount" type="number" min="0" placeholder="예: 10000" />
            </label>

            <label class="field">
              <span class="field__label">설명</span>
              <textarea class="field__textarea" v-model="form.description" placeholder="설명(선택)"></textarea>
            </label>

            <p v-if="error" class="error">{{ error }}</p>
          </section>

          <footer class="modal__footer">
            <button class="btn btn--ghost" type="button" @click="close">취소</button>
            <button class="btn btn--primary" type="button" :disabled="loading" @click="submit">
              {{ loading ? ' 중…' : '저장' }}
            </button>
          </footer>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { reactive, watch, ref, onBeforeUnmount } from 'vue';
import type {
  DeductionCreateRequest,
  DeductionResponse,
  DeductionType,
  CalculationType
} from '@/types/payroll/payroll.items';

const props = defineProps<{
  modelValue: boolean;
  mode: 'create' | 'edit';
  initial?: DeductionResponse | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'submit', payload: DeductionCreateRequest): void;
}>();

const error = ref('');

const form = reactive<DeductionCreateRequest>({
  deductionId: '',
  deductionName: '',
  description: '',
  deductionType: 'INSURANCE' as DeductionType,
  calculationType: 'RATE' as CalculationType,
  rate: 0,
  fixedAmount: null,
});

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    error.value = '';

    if (props.mode === 'edit' && props.initial) {
      form.deductionId = props.initial.deductionId;
      form.deductionName = props.initial.deductionName;
      form.description = props.initial.description ?? '';
      form.deductionType = props.initial.deductionType;
      form.calculationType = props.initial.calculationType;

      if (form.calculationType === 'RATE') {
        form.rate = props.initial.rate ?? 0;
        form.fixedAmount = null;
      } else {
        form.fixedAmount = props.initial.fixedAmount ?? 0;
        form.rate = null;
      }
    } else {
      form.deductionId = '';
      form.deductionName = '';
      form.description = '';
      form.deductionType = 'INSURANCE';
      form.calculationType = 'RATE';
      form.rate = 0;
      form.fixedAmount = null;
    }
  }
);

const close = () => emit('update:modelValue', false);

/**
 * ESC ?? ?? ??
 * - ??? ?? ?? ?? keydown ??? ???
 */
const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return;
  if (!props.modelValue) return;
  close();
};

watch(
  () => props.modelValue,
  (open) => {
    if (open) window.addEventListener('keydown', onKeydown);
    else window.removeEventListener('keydown', onKeydown);
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});

const syncCalcFields = () => {
  if (form.calculationType === 'RATE') {
    form.fixedAmount = null;
    if (form.rate == null) form.rate = 0;
  } else {
    form.rate = null;
    if (form.fixedAmount == null) form.fixedAmount = 0;
  }
};

const submit = () => {
  if (!form.deductionId.trim()) {
    error.value = '공제 코드를 입력해주세요.';
    return;
  }
  if (!form.deductionName.trim()) {
    error.value = '공제명을 입력해주세요.';
    return;
  }

  if (form.calculationType === 'RATE') {
    if (form.rate == null || Number.isNaN(form.rate) || form.rate < 0) {
      error.value = '비율은 0 이상 숫자여야 합니다.';
      return;
    }
  } else {
    if (form.fixedAmount == null || Number.isNaN(form.fixedAmount) || form.fixedAmount < 0) {
      error.value = '정액은 0 이상 숫자여야 합니다.';
      return;
    }
  }

  emit('submit', {
    deductionId: form.deductionId.trim(),
    deductionName: form.deductionName.trim(),
    description: (form.description ?? '').trim() || null,
    deductionType: form.deductionType,
    calculationType: form.calculationType,
    rate: form.calculationType === 'RATE' ? (form.rate ?? 0) : null,
    fixedAmount: form.calculationType === 'FIXED' ? (form.fixedAmount ?? 0) : null,
  });
};

const loading = props.loading ?? false;
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 9999;
}
.modal {
  width: min(560px, 100%);
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}
.modal__header {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #e5e7eb;
}
.modal__title {
  margin: 0;
  font-size: 15px;
  font-weight: 900;
  color: #111827;
}
.icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  color: #334155;
}
.modal__body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.field__label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
  font-weight: 800;
}
.field__input {
  width: 100%;
  height: 40px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #111827;
  padding: 0 12px;
  outline: none;
  font-size: 13px;
}
.field__textarea {
  width: 100%;
  min-height: 90px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  padding: 10px 12px;
  font-size: 13px;
  outline: none;
  resize: vertical;
}
.field__input:focus, .field__textarea:focus {
  border-color: rgba(22, 36, 86, 0.6);
  box-shadow: 0 0 0 3px rgba(22, 36, 86, 0.12);
}
.error {
  margin: 6px 0 0;
  color: #dc2626;
  font-size: 13px;
  font-weight: 800;
}
.modal__footer {
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid #e5e7eb;
}
.btn {
  border-radius: 999px;
  font-size: 13px;
  padding: 8px 14px;
  border: none;
  cursor: pointer;
  font-weight: 900;
}
.btn--ghost {
  background-color: #eef2ff;
  color: #374151;
}
.btn--primary {
    background: linear-gradient(
    180deg,
    rgba(28, 57, 142, 1) 0%,
    rgba(22, 36, 86, 1) 100%
  );
  color: #ffffff;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 560px) {
  .grid { grid-template-columns: 1fr; }
}
</style>