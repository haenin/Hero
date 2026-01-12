<template>
  <Teleport to="body">
  <transition name="modal-fade">
    <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">사원 상세 정보</h2>
          <button @click="closeModal" class="close-button">×</button>
        </div>
        <div class="modal-body" v-if="employee && !isLoading">
          <div class="profile-section">
            <!-- Fallback Icon -->
            <div v-if="!employee.imagePath || imageError" class="profile-fallback-icon">
              {{ employee.employeeName?.charAt(0) }}
            </div>
            <!-- Actual Image -->
            <img
              v-else
              :src="profileImageUrl"
              alt="프로필 사진"
              class="profile-image"
              @error="imageError = true"
            />
            <div class="profile-summary">
              <p class="name">{{ employee.employeeName }} <span class="grade">{{ employee.gradeName }}</span></p>
              <p class="department">{{ employee.departmentPath }}</p>
            </div>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>사번</label>
              <span>{{ employee.employeeNumber }}</span>
            </div>
            <div class="info-item">
              <label>이메일</label>
              <span>{{ employee.email }}</span>
            </div>
            <div class="info-item">
              <label>생년월일</label>
              <span>{{ employee.birthDate || '-' }}</span>
            </div>
            <div class="info-item">
              <label>연락처</label>
              <span>{{ employee.phone }}</span>
            </div>
            <div class="info-item">
              <label>성별</label>
              <span>{{ employee.gender === 'M' ? '남성' : '여성' }}</span>
            </div>
            <div class="info-item full-width">
              <label>주소</label>
              <span>{{ employee.address || '-' }}</span>
            </div>
            <div class="info-item">
              <label>입사일</label>
              <span>{{ employee.hireDate }} (근속 {{ employee.daysOfService }}일)</span>
            </div>
            <div class="info-item">
              <label>직책</label>
              <span>{{ employee.jobTitleName }}</span>
            </div>
            <div class="info-item">
              <label>고용형태</label>
              <span>{{ employee.contractType }}</span>
            </div>
            <div class="info-item">
              <label>평가 점수</label>
              <span>{{ employee.evaluationPoint ?? '-' }}</span>
            </div>
            <div class="info-item">
              <label>재직상태</label>
              <span>{{ employee.status }}</span>
            </div>
            <div class="info-item" v-if="employee.terminationDate">
              <label>퇴사일</label>
              <span>{{ employee.terminationDate }}</span>
            </div>
          </div>
        </div>
        <div v-else-if="isLoading" class="loading-container">
          <p>데이터를 불러오는 중입니다...</p>
        </div>
        <div v-else-if="error" class="error-container">
          <p>{{ error }}</p>
        </div>
      </div>
    </div>
  </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { fetchEmployeeDetail } from '@/api/personnel/personnel';
import type { EmployeeDetailResponse } from '@/types/personnel/personnel';

const props = defineProps<{
  modelValue: boolean;
  employeeId: number | null;
}>();

const emit = defineEmits(['update:modelValue']);

const employee = ref<EmployeeDetailResponse | null>(null);
const isLoading = ref(false);
const error = ref('');
const imageError = ref(false);

const getEmployeeDetails = async (id: number) => {
  isLoading.value = true;
  error.value = '';
  try {
    const response = await fetchEmployeeDetail(id);
    if (response.data.success) {
      employee.value = response.data.data;
    } else {
      error.value = '사원 정보를 불러오는 데 실패했습니다.';
    }
  } catch (err) {
    console.error('사원 상세 정보 조회 에러:', err);
    error.value = '오류가 발생했습니다. 다시 시도해주세요.';
  } finally {
    isLoading.value = false;
  }
};

// 프로필 이미지 URL 계산
const profileImageUrl = computed(() => {
  return employee.value?.imagePath || '';
});

// 모달 열림/닫힘 감지
watch(() => props.modelValue, (isVisible) => {
  if (isVisible) {
    imageError.value = false; // 이미지 에러 상태 초기화
    document.body.style.overflow = 'hidden'; // 모달 열릴 때 배경 스크롤 막기
    if (props.employeeId) {
      getEmployeeDetails(props.employeeId);
    }
  } else {
    // 모달이 닫힐 때 데이터 초기화
    document.body.style.overflow = ''; // 배경 스크롤 복원
    employee.value = null;
  }
});

// 모달이 열려있는 상태에서 ID가 변경될 경우 감지
watch(() => props.employeeId, (newId) => {
  if (props.modelValue && newId) {
    getEmployeeDetails(newId);
  }
});

const closeModal = () => {
  emit('update:modelValue', false);
};
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.8rem;
  line-height: 1;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
}
.close-button:hover {
  color: #1e293b;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.profile-image {
  width: 120px;
  height: 160px;
  border-radius: 12px;
  object-fit: cover;
  border: 3px solid #e2e8f0;
}

.profile-fallback-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1C398E 0%, #162456 100%);
  color: white;
  font-size: 32px;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 3px solid #e2e8f0;
  flex-shrink: 0;
}

.profile-summary .name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.profile-summary .grade {
  font-size: 1.2rem;
  font-weight: 500;
  color: #475569;
}

.profile-summary .department {
  font-size: 1rem;
  color: #64748b;
  margin-top: 4px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: span 2;
}

.info-item label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.info-item span {
  font-size: 1rem;
  color: #1e293b;
  background-color: #f8fafc;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.loading-container, .error-container {
  padding: 80px 24px;
  text-align: center;
  font-size: 1rem;
  color: #64748b;
}
</style>