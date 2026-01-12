<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content" :class="{ 'large-size': selectedEvaluationId }">
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <div class="header-title-group">
          <img v-if="selectedEvaluationId" class="back-icon" src="/images/backArrow.svg" @click="selectedEvaluationId = null" />
          <h3>{{ selectedEvaluationId ? '평가 상세 정보' : '평가 이력' }}</h3>
        </div>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <!-- 모달 바디 -->
      <div class="modal-body">
        <!-- 1. 평가 상세 화면 -->
        <div v-if="selectedEvaluationId" class="detail-view">
          <EvaluationFormDetail
            :is-modal="true"
            :modal-evaluation-id="selectedEvaluationId"
            :modal-employee-id="employeeId ?? undefined"
            @close="selectedEvaluationId = null"
          />
        </div>

        <!-- 2. 평가 이력 목록 화면 -->
        <div v-else class="list-view">
          <div v-if="store.loading" class="loading-state">
            <p>이력을 불러오는 중입니다...</p>
          </div>
          <div v-else-if="store.error" class="error-state">
            <p>{{ store.error }}</p>
          </div>
          <ul v-else-if="store.evaluationList.length > 0" class="history-list">
            <li
              v-for="item in store.evaluationList"
              :key="item.evaluationId"
              class="history-item"
              @click="openDetail(item.evaluationId)"
            >
              <div class="item-info">
                <span class="eval-name">{{ item.evaluationName }}</span>
                <span class="eval-date">{{ formatDate(item.createdAt) }}</span>
              </div>
              <div class="item-grade">
                <span class="grade-badge" :class="getGradeClass(item.totalRank)">
                  {{ item.totalRank }}등급
                </span>
              </div>
            </li>
          </ul>
          <p v-else class="no-data">평가 이력이 없습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useEvaluationStore } from '@/stores/evaluation/evaluation.store';
import EvaluationFormDetail from './EvaluationFormDetail.vue';

const props = defineProps<{
  isOpen: boolean;
  employeeId: number | null;
}>();

const emit = defineEmits(['close']);

const store = useEvaluationStore();
const selectedEvaluationId = ref<number | null>(null);

// 모달이 열리거나 직원 ID가 변경되면 목록 조회
watch(
  () => [props.isOpen, props.employeeId],
  ([isOpen, empId]) => {
    if (isOpen && empId) {
      selectedEvaluationId.value = null; // 상세 화면 초기화
      store.getEvaluationList(empId as number);
    }
  }
);

const openDetail = (evaluationId: number) => {
  selectedEvaluationId.value = evaluationId;
};

const closeModal = () => {
  emit('close');
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return dateStr.split('T')[0];
};

const getGradeClass = (rank: string) => {
  if (['S', 'A'].includes(rank)) return 'grade-high';
  if (['B'].includes(rank)) return 'grade-mid';
  return 'grade-low';
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 500px;
  height: 600px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
}

.modal-content.large-size {
    width: 1200px; /* 모달 너비를 900px에서 1200px로 확장 */
  height: 80vh;
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.back-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background: #f8fafc;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.history-item:hover {
  background-color: #f1f5f9;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.eval-name {
  font-weight: 600;
  color: #1e293b;
}

.eval-date {
  font-size: 13px;
  color: #64748b;
}

.grade-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 14px;
}

.grade-high { background: #dbeafe; color: #1e40af; }
.grade-mid { background: #f1f5f9; color: #475569; }
.grade-low { background: #fee2e2; color: #991b1b; }

.loading-state, .error-state, .no-data {
  padding: 40px;
  text-align: center;
  color: #64748b;
}

.detail-view {
  height: 100%;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #94a3b8;
}
</style>
