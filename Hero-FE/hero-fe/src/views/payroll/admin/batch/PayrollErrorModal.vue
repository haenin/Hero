<!--
 * <pre>
 * Vue Name        : PayrollErrorModal.vue
 * Description     : 관리자 - 급여 계산/처리 오류 상세 표시 모달 컴포넌트
 *
 * History
 *   2025/12/15 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-admin-error-modal
 * @author 동근
 * @version 1.0
 -->
<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal">
          <header class="modal__header">
            <div>
              <p class="modal__eyebrow">오류 상세</p>
              <h3 class="modal__title">{{ title }}</h3>
            </div>
            <button class="icon-btn" @click="close" aria-label="닫기">✕</button>
          </header>

          <section class="modal__body">
            <div class="info">
              <div class="info__row">
                <span class="info__label">사원</span>
                <span class="info__value">{{ employeeName }}</span>
              </div>
              <div class="info__row">
                <span class="info__label">부서</span>
                <span class="info__value">{{ departmentName || '-' }}</span>
              </div>
              <div class="info__row">
                <span class="info__label">급여월</span>
                <span class="info__value">{{ salaryMonth || '-' }}</span>
              </div>
            </div>

            <div class="message">
              <p class="message__label">사유</p>
              <pre class="message__box">{{ messageToShow }}</pre>
            </div>

            <p class="hint">
              ※ 계산 전 검증(근태 누락/이상치/정합성) 단계에서 실패할 수 있습니다.
            </p>
          </section>

          <footer class="modal__footer">
            <button class="btn btn--ghost" type="button" @click="close">닫기</button>
          </footer>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  title?: string;

  employeeName?: string;
  departmentName?: string | null;
  salaryMonth?: string;

  message?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
}>();

const close = () => emit('update:modelValue', false);

const messageToShow = computed(() => {
  const m = (props.message ?? '').trim();
  return m.length > 0 ? m : '사유 정보가 없습니다. (서버에서 errorMessage를 내려주면 표시)';
});
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
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
  overflow: hidden;
}

.modal__header {
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.modal__eyebrow {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.modal__title {
  margin: 4px 0 0;
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
  gap: 12px;
}

.info {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px;
  background: #f8fafc;
}

.info__row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 0;
}

.info__label {
  font-size: 12px;
  color: #6b7280;
}

.info__value {
  font-size: 12px;
  color: #111827;
  font-weight: 800;
}

.message__label {
  margin: 0 0 8px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 800;
}

.message__box {
  margin: 0;
  border-radius: 14px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #991b1b;
  padding: 12px;
  font-size: 12px;
  line-height: 1.45;
  white-space: pre-wrap;
}

.hint {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.modal__footer {
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
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

.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
