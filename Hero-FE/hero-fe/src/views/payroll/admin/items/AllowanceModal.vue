<!--
 * <pre>
 * Vue Name        : AllowanceModal.vue
 * Description     : 급여 항목 관리 - 수당 생성/수정 모달 컴포넌트
 *
 * History
 *  2025/12/23 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-allowance-modal
 * @author 동근
 * @version 1.0
 -->
<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal">
          <header class="modal__header">
            <h3 class="modal__title">{{ mode === 'create' ? '수당 추가' : '수당 수정' }}</h3>
            <button class="icon-btn" @click="close" aria-label="닫기">✕</button>
          </header>

          <section class="modal__body">
            <label class="field">
              <span class="field__label">수당 코드</span>
              <input class="field__input" v-model="form.allowanceId" :disabled="mode === 'edit'" placeholder="예: AL001" />
            </label>

            <label class="field">
              <span class="field__label">수당명</span>
              <input class="field__input" v-model="form.allowanceName" placeholder="예: 식대" />
            </label>

            <label class="field">
              <span class="field__label">기본 금액(원)</span>
              <input class="field__input" v-model.number="form.defaultAmount" type="number" min="0" placeholder="예: 100000" />
            </label>

            <label class="field">
              <span class="field__label">과세 여부</span>
              <select class="field__input" v-model="form.taxableYn">
                <option value="N">비과세</option>
                <option value="Y">과세</option>
              </select>
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
              {{ loading ? '저장 중…' : '저장' }}
            </button>
          </footer>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { reactive, watch, ref, onBeforeUnmount } from 'vue';
import type { AllowanceCreateRequest, AllowanceResponse, Yn } from '@/types/payroll/payroll.items';

const props = defineProps<{
  modelValue: boolean;
  mode: 'create' | 'edit';
  initial?: AllowanceResponse | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'submit', payload: AllowanceCreateRequest): void;
}>();

const error = ref('');

/**
 * 수당 입력 폼 상태
 *  - create / edit 모드에 따라 초기값 세팅
 */
const form = reactive<AllowanceCreateRequest>({
  allowanceId: '',
  allowanceName: '',
  description: '',
  defaultAmount: 0,
  taxableYn: 'N' as Yn,
});

/**
 * 모달 오픈 시
 *  - edit 모드: initial 값으로 폼 초기화
 *  - create 모드: 기본값으로 초기화
 */
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    error.value = '';
    if (props.mode === 'edit' && props.initial) {
      form.allowanceId = props.initial.allowanceId;
      form.allowanceName = props.initial.allowanceName;
      form.description = props.initial.description ?? '';
      form.defaultAmount = props.initial.defaultAmount ?? 0;
      form.taxableYn = props.initial.taxableYn;
    } else {
      form.allowanceId = '';
      form.allowanceName = '';
      form.description = '';
      form.defaultAmount = 0;
      form.taxableYn = 'N';
    }
  }
);

const close = () => emit('update:modelValue', false);
/**
 * ESC 키로 모달 닫기
 * - 모달 open 상태일 때만 리스너 활성화
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


/**
 * 저장 버튼 클릭 처리
 *  - 입력값 검증 후 submit 이벤트 emit
 */
const submit = () => {
  if (!form.allowanceId.trim()) {
    error.value = '수당 코드를 입력해주세요.';
    return;
  }
  if (!form.allowanceName.trim()) {
    error.value = '수당명을 입력해주세요.';
    return;
  }
  if (form.defaultAmount == null || Number.isNaN(form.defaultAmount) || form.defaultAmount < 0) {
    error.value = '금액은 0 이상 숫자여야 합니다.';
    return;
  }

  emit('submit', {
    allowanceId: form.allowanceId.trim(),
    allowanceName: form.allowanceName.trim(),
    description: (form.description ?? '').trim() || null,
    defaultAmount: form.defaultAmount ?? 0,
    taxableYn: form.taxableYn,
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
  width: min(520px, 100%);
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
</style>
