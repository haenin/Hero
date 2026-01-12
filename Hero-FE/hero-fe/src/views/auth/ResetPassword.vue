<template>
  <div class="reset-password-container">
    <div class="card">
      <div class="header">
        <h3>비밀번호 재설정</h3>
        <p>새로운 비밀번호를 설정해 주세요.</p>
      </div>

      <form @submit.prevent="handleSubmit">
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
          <label>비밀번호 확인</label>
          <input 
            type="password" 
            v-model="confirmPassword" 
            placeholder="비밀번호 재입력"
            required 
          />
          <p v-if="passwordMismatch" class="error-text">비밀번호가 일치하지 않습니다.</p>
        </div>

        <button type="submit" class="btn-submit" :disabled="isLoading || passwordMismatch">
          비밀번호 변경
        </button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { resetPassword } from '@/api/auth/password.api';

const route = useRoute();
const router = useRouter();

const token = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const passwordMismatch = computed(() => {
  return !!newPassword.value && !!confirmPassword.value && newPassword.value !== confirmPassword.value;
});

onMounted(() => {
  // URL 쿼리에서 토큰 추출
  const queryToken = route.query.token;
  if (typeof queryToken === 'string') {
    token.value = queryToken;
  } else {
    alert('유효하지 않은 접근입니다.');
    router.push('/login');
  }
});

const handleSubmit = async () => {
  if (passwordMismatch.value || !token.value) return;

  // 유효성 검사
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
  if (!passwordRegex.test(newPassword.value)) {
      errorMessage.value = '비밀번호는 8~16자의 영문, 숫자, 특수문자를 포함해야 합니다.';
      return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await resetPassword({
      token: token.value,
      newPassword: newPassword.value
    });
    alert('비밀번호가 성공적으로 변경되었습니다.\n로그인 페이지로 이동합니다.');
    router.push('/login');
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || '비밀번호 재설정에 실패했습니다. 링크가 만료되었을 수 있습니다.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.reset-password-container {
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; background-color: #f0f2f5;
}
.card {
  background: white; padding: 40px; border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%; max-width: 400px;
}
.header { text-align: center; margin-bottom: 30px; }
.header h3 { color: #1C398E; margin: 0 0 8px 0; }
.header p { color: #666; font-size: 14px; margin: 0; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #555; }
.form-group input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; }
.error-text { color: #dc3545; font-size: 12px; margin-top: 4px; }
.btn-submit {
  width: 100%; padding: 14px; background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 10px;
  transition: opacity 0.2s;
}
.btn-submit:disabled { background: #ccc; cursor: not-allowed; }
.btn-submit:hover:not(:disabled) { opacity: 0.9; }
.error-message { color: #dc3545; text-align: center; margin-top: 16px; font-size: 14px; }
</style>