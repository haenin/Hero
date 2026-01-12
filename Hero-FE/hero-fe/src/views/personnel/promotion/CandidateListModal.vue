<template>
  <div v-if="open" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>승진 후보자 목록</h3>
        <button class="close-btn" @click="close">×</button>
      </div>

      <div class="modal-body">
        <div class="table-container">
          <table class="candidate-table">
            <thead>
              <tr>
                <th>사번</th>
                <th>이름</th>
                <th>부서</th>
                <th>직급</th>
                <th>추천인</th>
                <th>추천 사유</th>
                <th>상태</th>
                <th>비고(반려사유)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="candidate in candidates" :key="candidate.candidateId">
                <td>{{ candidate.employeeNumber }}</td>
                <td>{{ candidate.employeeName }}</td>
                <td>{{ candidate.department }}</td>
                <td>{{ candidate.grade }}</td>
                <td>{{ candidate.nominatorName || '-' }}</td>
                <td class="text-left" :title="candidate.nominationReason">
                  {{ truncate(candidate.nominationReason) }}
                </td>
                <td>
                  <span :class="['status-badge', getStatusClass(candidate.status)]">
                    {{ getStatusText(candidate.status) }}
                  </span>
                </td>
                <td class="text-left" :title="candidate.rejectionReason">
                  {{ truncate(candidate.rejectionReason) || '-' }}
                </td>
              </tr>
              <tr v-if="!candidates || candidates.length === 0">
                <td colspan="8" class="no-data">등록된 후보자가 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import type { PromotionCandidateDTO } from '@/types/personnel/promotion.types';

// Props 정의
const props = defineProps<{
  open: boolean;
  candidates?: PromotionCandidateDTO[];
}>();

// Emits 정의
const emit = defineEmits(['update:open']);

// 모달 닫기
const close = () => {
  emit('update:open', false);
};

// 텍스트 말줄임 처리
const truncate = (text?: string, length = 15) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// 상태 텍스트 매핑
const getStatusText = (status?: string) => {
  if (!status) return '-';
  switch (status) {
    case 'WAITING': return '대기';
    case 'REVIEW_PASSED': return '승인';
    case 'FINAL_APPROVED': return '최종 승인';
    case 'REJECTED': return '반려';
    default: return status;
  }
};

// 상태별 CSS 클래스 매핑
const getStatusClass = (status?: string) => {
  switch (status) {
    case 'WAITING': return 'status-pending';
    case 'REVIEW_PASSED': return 'status-approved';
    case 'FINAL_APPROVED': return 'status-approved';
    case 'REJECTED': return 'status-rejected';
    default: return '';
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) {
    close();
  }
};

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 1000px;
  max-width: 95%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1C398E;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #94a3b8;
  line-height: 1;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.table-container {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow-x: auto;
}

.candidate-table {
  width: 100%;
  border-collapse: collapse;
}

.candidate-table th {
  background: #f8fafc;
  padding: 12px;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
  font-size: 14px;
}

.candidate-table td {
  padding: 12px;
  color: #334155;
  border-bottom: 1px solid #e2e8f0;
  text-align: center;
  font-size: 14px;
}

.text-left {
  text-align: left !important;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-pending { background-color: #f1f5f9; color: #64748b; }
.status-approved { background-color: #dcfce7; color: #166534; }
.status-rejected { background-color: #fee2e2; color: #991b1b; }

.no-data {
  padding: 40px !important;
  color: #94a3b8;
}
</style>