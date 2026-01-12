<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>비밀번호 변경 안내</h3>
        <p>보안을 위해 비밀번호 변경이 필요합니다.</p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label>새 비밀번호</label>
          <input 
            type="password" 
            v-model="newPassword" 
            placeholder="8~16자 영문, 숫자, 특수문자 포함"
            required 
          />
        </div>
        <div class="form-group">
          <label>새 비밀번호 확인</label>
          <input 
            type="password" 
            v-model="confirmPassword" 
            placeholder="비밀번호 재입력"
            required 
          />
          <p v-if="passwordMismatch" class="error-text">비밀번호가 일치하지 않습니다.</p>
        </div>

        <div class="modal-actions">
          <button type="submit" class="btn-submit" :disabled="isLoading">변경하기</button>
        </div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { changePassword } from '@/api/auth/password.api';

const props = defineProps<{
  currentPassword: string;
}>();

const emit = defineEmits(['success']);

const newPassword = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const passwordMismatch = computed(() => {
  return !!newPassword.value && !!confirmPassword.value && newPassword.value !== confirmPassword.value;
});

const handleSubmit = async () => {
  if (passwordMismatch.value) return;
  
  // 유효성 검사 (영문, 숫자, 특수문자 포함 8~16자)
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
  if (!passwordRegex.test(newPassword.value)) {
      errorMessage.value = '비밀번호는 8~16자의 영문, 숫자, 특수문자를 포함해야 합니다.';
      return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await changePassword({
      currentPassword: props.currentPassword,
      newPassword: newPassword.value
    });
    alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
    emit('success');
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.';
  } finally {
    isLoading.value = false;
  }
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
  padding: 30px;
  border-radius: 12px;
  width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header h3 { margin: 0 0 8px 0; color: #1C398E; }
.modal-header p { margin: 0 0 20px 0; color: #666; font-size: 14px; }

.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; color: #333; }
.form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; }

.error-text { color: #dc3545; font-size: 12px; margin-top: 4px; }

.btn-submit {
  width: 100%; padding: 12px;
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  color: white; border: none; border-radius: 8px;
  cursor: pointer; font-weight: 600;
  transition: opacity 0.2s;
}
.btn-submit:disabled { background: #ccc; cursor: not-allowed; }
.btn-submit:hover:not(:disabled) { opacity: 0.9; }

.error-message { color: #dc3545; text-align: center; margin-top: 12px; font-size: 14px; }
</style>
