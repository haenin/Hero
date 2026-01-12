<!-- 
  <pre>
  Vue Name   : PasswordChangeModal.vue
  Description : 비밀번호 변경 모달

  History
  2025/12/28 (혜원) 최초 작성
  2025/12/29 (혜원) 비밀번호 강도 표시 및 일치 검증 추가
  </pre>
 
  @author 혜원
  @version 1.1
 -->
<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>비밀번호 변경</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- 현재 비밀번호 -->
        <div class="form-group">
          <label class="label-with-icon required">
          <img src="/images/password.svg" alt="비밀번호" class="label-icon" />
            현재 비밀번호
          </label>
          <div class="input-wrapper">
            <input 
              v-model="formData.currentPassword" 
              :type="showCurrentPassword ? 'text' : 'password'"
              placeholder="현재 비밀번호를 입력하세요"
              required
              class="form-input"
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="showCurrentPassword = !showCurrentPassword"
            >
            <img src="/images/save.svg" alt="저장" style="width: 16px; height: 16px; filter: brightness(0) invert(1);" />
            </button>
          </div>
        </div>

        <div class="divider"></div>

        <!-- 새 비밀번호 -->
        <div class="form-group">
          <label class="label-with-icon required">
          <img src="/images/password.svg" alt="비밀번호" class="label-icon" />
            새 비밀번호
          </label>
          <div class="input-wrapper">
            <input 
              v-model="formData.newPassword" 
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="새 비밀번호를 입력하세요"
              required
              class="form-input"
              @input="validatePassword"
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="showNewPassword = !showNewPassword"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10" stroke="#64748B" stroke-width="1.67"/>
                <circle cx="10" cy="10" r="3" stroke="#64748B" stroke-width="1.67"/>
              </svg>
            </button>
          </div>

          <!-- 비밀번호 강도 표시 -->
          <div v-if="formData.newPassword" class="password-strength-container">
            <div class="strength-bar-wrapper">
              <div 
                class="strength-bar" 
                :class="`strength-${passwordStrength}`"
                :style="{ width: `${(passwordStrength / 4) * 100}%` }"
              ></div>
            </div>
            <span class="strength-text" :class="`strength-${passwordStrength}`">
              {{ strengthText }}
            </span>
          </div>

          <!-- 비밀번호 요구사항 체크리스트 -->
          <div class="password-requirements">
            <div :class="['requirement', { valid: requirements.minLength }]">
              <svg v-if="requirements.minLength" class="check-icon" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L6 11L13 4" stroke="#10B981" stroke-width="2"/>
              </svg>
              <svg v-else class="x-icon" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="#EF4444" stroke-width="2"/>
              </svg>
              최소 8자 이상
            </div>
            <div :class="['requirement', { valid: requirements.hasLetters }]">
              <svg v-if="requirements.hasLetters" class="check-icon" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L6 11L13 4" stroke="#10B981" stroke-width="2"/>
              </svg>
              <svg v-else class="x-icon" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="#EF4444" stroke-width="2"/>
              </svg>
              영문 대소문자 포함
            </div>
            <div :class="['requirement', { valid: requirements.hasNumbers }]">
              <svg v-if="requirements.hasNumbers" class="check-icon" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L6 11L13 4" stroke="#10B981" stroke-width="2"/>
              </svg>
              <svg v-else class="x-icon" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="#EF4444" stroke-width="2"/>
              </svg>
              숫자 포함
            </div>
            <div :class="['requirement', { valid: requirements.hasSpecialChars }]">
              <svg v-if="requirements.hasSpecialChars" class="check-icon" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L6 11L13 4" stroke="#10B981" stroke-width="2"/>
              </svg>
              <svg v-else class="x-icon" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="#EF4444" stroke-width="2"/>
              </svg>
              특수문자 포함 (!@#$%^&*)
            </div>
          </div>
        </div>

        <!-- 새 비밀번호 확인 -->
        <div class="form-group">
          <label class="label-with-icon required">
          <img src="/images/password.svg" alt="비밀번호" class="label-icon" />
            새 비밀번호 확인
          </label>
          <div class="input-wrapper">
            <input 
              v-model="formData.confirmPassword" 
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="새 비밀번호를 다시 입력하세요"
              required
              class="form-input"
              :class="{ 'input-error': showPasswordMismatch }"
              @input="checkPasswordMatch"
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10" stroke="#64748B" stroke-width="1.67"/>
                <circle cx="10" cy="10" r="3" stroke="#64748B" stroke-width="1.67"/>
              </svg>
            </button>
          </div>

          <!-- 비밀번호 일치 여부 표시 -->
          <div v-if="formData.confirmPassword" class="password-match-indicator">
            <div v-if="passwordMatch" class="match-success">
              <svg class="match-icon" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" fill="#10B981"/>
                <path d="M6 10L8.5 12.5L14 7" stroke="white" stroke-width="2"/>
              </svg>
              <span>비밀번호가 일치합니다</span>
            </div>
            <div v-else class="match-error">
              <svg class="mismatch-icon" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" fill="#EF4444"/>
                <path d="M7 7L13 13M13 7L7 13" stroke="white" stroke-width="2"/>
              </svg>
              <span>비밀번호가 일치하지 않습니다</span>
            </div>
          </div>
        </div>

        <!-- 버튼 -->
        <div class="modal-footer">
          <button type="submit" class="btn-submit" :disabled="!isFormValid || loading">
            <img src="/images/save.svg" alt="저장" style="width: 16px; height: 16px; filter: brightness(0) invert(1);" />
            {{ loading ? '저장 중...' : '저장' }}
          </button>
          <button type="button" class="btn-cancel" @click="handleClose">
            닫기
          </button>
        </div>
      </form>

      <!-- 에러 메시지 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { changePassword } from '@/api/personnel/personnel';

const toast = useToast();

interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  success: [];
}>();

const formData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

// 비밀번호 요구사항 체크
const requirements = ref({
  minLength: false,
  hasLetters: false,
  hasNumbers: false,
  hasSpecialChars: false
});

/**
 * 비밀번호 강도 계산
 * 0: 매우 약함
 * 1: 약함
 * 2: 보통
 * 3: 강함
 * 4: 매우 강함
 */
const passwordStrength = computed(() => {
  const password = formData.value.newPassword;
  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  return strength; // 0-4
});

/**
 * 강도 텍스트
 */
const strengthText = computed(() => {
  const texts = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
  return texts[passwordStrength.value] || '매우 약함';
});

/**
 * 비밀번호 일치 여부
 */
const passwordMatch = computed(() => {
  return formData.value.newPassword === formData.value.confirmPassword &&
         formData.value.confirmPassword.length > 0;
});

/**
 * 비밀번호 불일치 표시 여부
 */
const showPasswordMismatch = computed(() => {
  return formData.value.confirmPassword.length > 0 && !passwordMatch.value;
});

/**
 * 비밀번호 유효성 검사
 */
const validatePassword = () => {
  const password = formData.value.newPassword;
  
  requirements.value.minLength = password.length >= 8;
  requirements.value.hasLetters = /[a-z]/.test(password) && /[A-Z]/.test(password);
  requirements.value.hasNumbers = /\d/.test(password);
  requirements.value.hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
};

/**
 * 비밀번호 일치 확인
 */
const checkPasswordMatch = () => {
  // computed로 자동 계산되므로 별도 로직 불필요
};

/**
 * 폼 유효성 검사
 */
const isFormValid = computed(() => {
  return (
    formData.value.currentPassword.length > 0 &&
    formData.value.newPassword.length > 0 &&
    formData.value.confirmPassword.length > 0 &&
    requirements.value.minLength &&
    requirements.value.hasLetters &&
    requirements.value.hasNumbers &&
    requirements.value.hasSpecialChars &&
    passwordMatch.value
  );
});

/**
 * 모달 초기화
 */
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    formData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    showCurrentPassword.value = false;
    showNewPassword.value = false;
    showConfirmPassword.value = false;
    error.value = null;
    requirements.value = {
      minLength: false,
      hasLetters: false,
      hasNumbers: false,
      hasSpecialChars: false
    };
  }
});

/**
 * 모달 닫기
 */
const handleClose = () => {
  error.value = null;
  emit('close');
};

/**
 * 폼 제출
 */
const handleSubmit = async () => {
  if (!isFormValid.value) return;

  loading.value = true;
  error.value = null;

  try {
    await changePassword({
      currentPassword: formData.value.currentPassword,
      newPassword: formData.value.newPassword
    });
    
    // 성공 Toast 추가
    toast.success('비밀번호가 변경되었습니다');
    
    emit('success');
    handleClose();
  } catch (err: any) {
    console.error('비밀번호 변경 에러:', err);
    // 에러 메시지 커스터마이징
    const errorMessage = '비밀번호 변경에 실패했습니다.';
    
    // 현재 비밀번호 불일치 에러 처리
    if (errorMessage.includes('비밀번호') || errorMessage.includes('일치')) {
      error.value = '현재 비밀번호가 일치하지 않습니다';
      toast.error('현재 비밀번호가 일치하지 않습니다');
    } else {
      error.value = errorMessage;
      toast.error(errorMessage);
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #E2E8F0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1E293B;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #64748B;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #F1F5F9;
  color: #1E293B;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.divider {
  height: 1.2px;
  background: #E2E8F0;
  margin: 1px 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 400;
  color: #334155;
}

.label-with-icon.required::after {
  content: ' *';
  color: #FB2C36;
  margin-left: 4px;
}

.label-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 12px 48px 12px 16px;
  border: 1.2px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  color: #1E293B;
  transition: all 0.2s;
  background: white;
}

.form-input::placeholder {
  color: #94A3B8;
}

.form-input:focus {
  outline: none;
  border-color: #432DD7;
  box-shadow: 0 0 0 3px rgba(67, 45, 215, 0.1);
}

.form-input.input-error {
  border-color: #EF4444;
}

.form-input.input-error:focus {
  border-color: #EF4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.toggle-password:hover {
  background: #F8FAFC;
}

.toggle-password svg {
  width: 20px;
  height: 20px;
}

/* 비밀번호 강도 표시 */
.password-strength-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.strength-bar-wrapper {
  width: 100%;
  height: 4px;
  background: #E2E8F0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-bar.strength-0 { background: #EF4444; }
.strength-bar.strength-1 { background: #F97316; }
.strength-bar.strength-2 { background: #EAB308; }
.strength-bar.strength-3 { background: #22C55E; }
.strength-bar.strength-4 { background: #10B981; }

.strength-text {
  font-size: 12px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.strength-text.strength-0 { color: #EF4444; }
.strength-text.strength-1 { color: #F97316; }
.strength-text.strength-2 { color: #EAB308; }
.strength-text.strength-3 { color: #22C55E; }
.strength-text.strength-4 { color: #10B981; }

/* 비밀번호 요구사항 체크리스트 */
.password-requirements {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: #F8FAFC;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  margin-top: 8px;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748B;
  font-size: 14px;
  line-height: 20px;
  transition: all 0.2s;
}

.requirement.valid {
  color: #10B981;
  font-weight: 500;
}

.check-icon,
.x-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 비밀번호 일치 표시 */
.password-match-indicator {
  margin-top: 8px;
}

.match-success,
.match-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.match-success {
  background: #ECFDF5;
  color: #10B981;
  border: 1px solid #A7F3D0;
}

.match-error {
  background: #FEF2F2;
  color: #EF4444;
  border: 1px solid #FECACA;
}

.match-icon,
.mismatch-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-submit,
.btn-cancel {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-submit {
  background: #3b82f6;
  border: none;
  color: white;
}

.btn-submit svg {
  width: 16px;
  height: 16px;
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
}

.btn-submit:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.btn-cancel {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.error-message {
  margin: 0 24px 24px;
  padding: 12px;
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  border-radius: 8px;
  color: #DC2626;
  font-size: 14px;
}
</style>