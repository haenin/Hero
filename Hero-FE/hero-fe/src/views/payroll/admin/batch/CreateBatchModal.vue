<!--
 * <pre>
 * Vue Name        : CreateBatchModal.vue
 * Description     : 관리자 - 월별 급여 배치 생성 모달 컴포넌트
 *
 * History
 *   2025/12/15 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-admin-create-batch-modal
 * @author 동근
 * @version 1.0
 -->
<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="emitClose">
        <div class="modal">
          <!-- 헤더 -->
          <header class="modal__header">
            <h3 class="modal__title">새 급여 배치 생성</h3>
            <button class="icon-btn" @click="emitClose" aria-label="닫기">✕</button>
          </header>

          <!-- 바디 -->
          <section class="modal__body">
            <label class="field">
              <span class="field__label">급여월 (YYYY-MM)</span>
              <input
                v-model="month"
                class="field__input"
                placeholder="예: 2025-12"
                maxlength="7"
              />
              <small class="field__hint">예: 2025-12</small>
            </label>

            <p v-if="error" class="error">{{ error }}</p>
          </section>

          <!-- 푸터 -->
          <footer class="modal__footer">
            <button class="btn btn--ghost" type="button" @click="emitClose">
              취소
            </button>
            <button
              class="btn btn--primary"
              type="button"
              :disabled="loading"
              @click="onSubmit"
            >
              {{ loading ? '생성 중…' : '생성' }}
            </button>
          </footer>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  defaultMonth?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'submit', month: string): void;
}>();

const month = ref(props.defaultMonth ?? '');
const error = ref('');

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      month.value = props.defaultMonth ?? month.value ?? '';
      error.value = '';
    }
  }
);

const loading = computed(() => props.loading ?? false);

const emitClose = () => emit('update:modelValue', false);

const isValidMonth = (v: string) =>
  /^\d{4}-(0[1-9]|1[0-2])$/.test(v);

const onSubmit = () => {
  const v = month.value.trim();
  if (!isValidMonth(v)) {
    error.value = '급여월 형식이 올바르지 않습니다. (YYYY-MM)';
    return;
  }
  emit('submit', v);
};
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
  width: min(460px, 100%);
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
}

.field__label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.field__input {
  width: 100%;
  height: 42px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #111827;
  padding: 0 12px;
  outline: none;
  font-size: 13px;
}

.field__input:focus {
  border-color: rgba(22, 36, 86, 0.6);
  box-shadow: 0 0 0 3px rgba(22, 36, 86, 0.12);
}

.field__hint {
  display: block;
  margin-top: 6px;
  color: #9ca3af;
  font-size: 12px;
}

.error {
  margin-top: 12px;
  color: #dc2626;
  font-size: 13px;
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
  font-weight: 800;
}

.btn--ghost {
  background-color: #eef2ff;
  color: #374151;
}

.btn--primary {
  background: linear-gradient(135deg, #06336f, #123c9c);
  color: #ffffff;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
