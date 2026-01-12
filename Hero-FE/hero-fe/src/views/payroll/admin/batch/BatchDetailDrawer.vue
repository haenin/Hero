<!-- 
 * <pre>
 * Vue Name        : BatchDetailDrawer.vue
 * Description     : 관리자 - 월별 급여 배치 상세 드로어 컴포넌트
 *
 * History
 *   2025/12/15 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-admin-batch-detail-drawer
 * @author 동근
 * @version 1.0
 -->
<template>
  <teleport to="body">
    <transition name="slide">
      <aside v-if="modelValue" class="drawer" aria-label="배치 상세 드로어">
        <header class="drawer__header">
          <div>
            <p class="drawer__eyebrow">배치 상세</p>
            <h3 class="drawer__title">
              {{ detail ? `${detail.salaryMonth} · ${statusLabel(detail.status)}` : '배치를 선택하세요' }}
            </h3>
          </div>

          <button class="icon-btn" :disabled="loading" @click="emitClose" aria-label="닫기">✕</button>
        </header>

        <section class="drawer__body">
          <div v-if="loading" class="empty">로딩 중…</div>

          <template v-else>
            <div v-if="detail" class="content">
              <div class="meta">
                <div class="meta__row">
                  <span class="meta__label">상태</span>
                  <span :class="['badge', badgeClass(detail.status)]">
                    {{ statusLabel(detail.status) }}
                  </span>
                </div>

                <div class="meta__row">
                  <span class="meta__label">생성일</span>
                  <span class="meta__value">{{ formatDateTime(detail.createdAt) }}</span>
                </div>

                <div class="meta__row">
                  <span class="meta__label">수정일</span>
                  <span class="meta__value">{{ formatDateTime(detail.updatedAt) }}</span>
                </div>

                <div class="meta__row">
                  <span class="meta__label">종료일시</span>
                  <span class="meta__value">{{ formatDateTime(detail.closedAt) }}</span>
                </div>
              </div>

              <div class="kpi-grid">
                <div class="kpi">
                  <span class="kpi__label">총 인원</span>
                  <span class="kpi__value">{{ detail.totalEmployeeCount }}</span>
                </div>
                <div class="kpi">
                  <span class="kpi__label">{{ kpi2.label }}</span>
                  <span class="kpi__value">{{ kpi2.value }}</span>
                </div>
                <div class="kpi">
                  <span class="kpi__label">{{ kpi3.label }}</span>
                  <span :class="['kpi__value', kpi3.tone === 'danger' ? 'kpi__value--danger' : '']">
                    {{ kpi3.value }}
                  </span>
                </div>
                <div class="kpi">
                  <span class="kpi__label">{{ kpi4.label }}</span>
                  <span class="kpi__value">{{ kpi4.value }}</span>
                </div>
              </div>

              <div class="actions">
                                <button
                  class="btn btn--primary"
                  type="button"
                  :disabled="!detail || loading"
                  @click="goNext"
                >
                  다음 단계로
                </button>
                <button class="btn btn--ghost" type="button" @click="emitClose">닫기</button>
              </div>
            </div>

            <div v-else class="empty">
              배치를 선택하면 상세가 표시됩니다.
            </div>
          </template>
        </section>
      </aside>
    </transition>
    
    <transition name="fade">
      <div v-if="modelValue" class="backdrop" @click="!loading && emitClose()" />
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed } from 'vue';
import type { PayrollBatchDetailResponse, PayrollBatchStatus } from '@/types/payroll/payroll.batch';

const props = defineProps<{
  modelValue: boolean;
  detail: PayrollBatchDetailResponse | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'next'): void;
}>();

const emitClose = () => emit('update:modelValue', false);
const goNext = () => emit('next');

const onKeydown = (e: KeyboardEvent) => {
  if (!props.modelValue) return;
  if (props.loading) return;
  if (e.key === 'Escape') emitClose();
};

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

const formatDateTime = (v: string | null) => {
  if (!v) return '-';
  return v.replace('T', ' ').slice(0, 16);
};

const statusLabel = (s: PayrollBatchStatus) => {
  switch (s) {
    case 'READY': return '준비';
    case 'CALCULATED': return '계산완료';
    case 'CONFIRMED': return '확정';
    case 'PAID': return '지급완료';
    default: return s;
  }
};

const badgeClass = (s: PayrollBatchStatus) => {
  switch (s) {
    case 'CALCULATED': return 'ok';
    case 'CONFIRMED': return 'confirm';
    case 'PAID': return 'paid';
    default: return 'wait';
  }
};

type Kpi = { label: string; value: string | number; tone?: 'normal' | 'danger' };

const kpi2 = computed<Kpi>(() => {
  const d = props.detail;
  if (!d) return { label: '-', value: '-' };
 const total = d.totalEmployeeCount ?? 0;

 if (d.status === 'PAID') {
   return { label: '지급 완료', value: total };
 }
 if (d.status === 'CONFIRMED') {
   return { label: '확정 완료', value: d.confirmedCount ?? total };
 }
 return { label: '계산 완료', value: d.calculatedCount ?? 0 };
});

const kpi3 = computed<Kpi>(() => {
  const d = props.detail;
  if (!d) return { label: '-', value: '-' };

  const failed = d.failedCount ?? 0;
  return {
    label: '처리 실패',
    value: failed === 0 ? '없음' : failed,
    tone: failed > 0 ? 'danger' : 'normal',
  };
});

const kpi4 = computed<Kpi>(() => {
  const d = props.detail;
  if (!d) return { label: '-', value: '-' };

  const total = d.totalEmployeeCount ?? 0;
  const calculated = d.calculatedCount ?? 0;
  const confirmed = d.confirmedCount ?? 0;
  const failed = d.failedCount ?? 0;

  if (d.status === 'READY') {
    const pending = Math.max(0, total - calculated - failed);
    return { label: '계산 대기', value: pending };
  }

  if (d.status === 'CALCULATED') {
    const pending = Math.max(0, calculated - failed);
    return { label: '확정 대기', value: pending };
  }

  if (d.status === 'CONFIRMED') {
    // 확정 후 지급 전 단계
    const pending = Math.max(0, confirmed - failed);
    return { label: '지급 대기', value: pending };
  }

  // PAID
  return { label: '처리 완료', value: total };
});
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  z-index: 9998;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: min(420px, 92vw);
  height: 100vh;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  box-shadow: -20px 0 60px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.drawer__header {
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.drawer__eyebrow {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.drawer__title {
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

.drawer__body {
  padding: 16px;
  overflow: auto;
  flex: 1;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.meta {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px;
  background: #f8fafc;
}

.meta__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
}

.meta__label {
  font-size: 12px;
  color: #6b7280;
}

.meta__value {
  font-size: 12px;
  color: #111827;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.kpi {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 14px;
  padding: 12px;
}

.kpi__label {
  display: block;
  font-size: 12px;
  color: #6b7280;
}

.kpi__value {
  display: block;
  margin-top: 6px;
  font-size: 18px;
  font-weight: 900;
  color: #111827;
}

.kpi__value--danger {
  color: #dc2626;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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

.badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  color: #334155;
}

.badge.ok {
  background: #ecfeff;
  border-color: #a5f3fc;
  color: #155e75;
}

.badge.confirm {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #1e3a8a;
}

.badge.paid {
  background: #ecfdf5;
  border-color: #bbf7d0;
  color: #065f46;
}

.badge.wait {
  background: #f8fafc;
  border-color: #e5e7eb;
  color: #475569;
}

.empty {
  color: #6b7280;
  background: #f8fafc;
  border: 1px dashed #e5e7eb;
  border-radius: 14px;
  padding: 12px;
}

.hint {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.slide-enter-active, .slide-leave-active { transition: transform .18s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
