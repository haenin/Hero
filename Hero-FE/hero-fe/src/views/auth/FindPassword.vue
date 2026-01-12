<template>
  <div class="find-password-container">
    <div class="card">
      <div class="header">
        <h3>비밀번호 찾기</h3>
        <p>가입된 사번과 이메일을 입력해 주세요.</p>
      </div>
      
      <form @submit.prevent="handleSubmit" v-if="!isEmailSent">
        <div class="form-group">
          <label for="empNumber">사번</label>
          <input type="text" id="empNumber" v-model="form.employeeNumber" required placeholder="사번 입력" />
        </div>
        <div class="form-group">
          <label for="email">이메일</label>
          <input type="email" id="email" v-model="form.email" required placeholder="example@hero.com" />
        </div>
        
        <button type="submit" class="btn-submit" :disabled="isLoading">
          {{ isLoading ? '전송 중...' : '비밀번호 재설정 메일 발송' }}
        </button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>

      <div v-else class="success-message">
        <div class="icon-check">✓</div>
        <h4>메일 발송 완료</h4>
        <p>
          <strong>{{ form.email }}</strong>으로<br/>
          비밀번호 재설정 링크를 보냈습니다.<br/>
          메일함을 확인해 주세요.
        </p>
        <router-link to="/login" class="btn-link">로그인으로 돌아가기</router-link>
      </div>

      <div class="footer-link" v-if="!isEmailSent">
        <router-link to="/login">로그인 페이지로 이동</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { requestPasswordReset } from '@/api/auth/password.api';

const form = reactive({
  employeeNumber: '',
  email: ''
});

const isLoading = ref(false);
const isEmailSent = ref(false);
const errorMessage = ref('');

const handleSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    await requestPasswordReset({
      employeeNumber: form.employeeNumber,
      email: form.email
    });
    isEmailSent.value = true;
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || '정보가 일치하지 않거나 오류가 발생했습니다.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.find-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.header { text-align: center; margin-bottom: 30px; }
.header h3 { color: #1C398E; margin: 0 0 8px 0; }
.header p { color: #666; font-size: 14px; margin: 0; }

.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #555; }
.form-group input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; }

.btn-submit {
  width: 100%; padding: 14px;
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  color: white; border: none; border-radius: 8px;
  font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 10px;
  transition: opacity 0.2s;
}
.btn-submit:disabled { background: #ccc; cursor: not-allowed; }
.btn-submit:hover:not(:disabled) { opacity: 0.9; }

.error-message { color: #dc3545; text-align: center; margin-top: 16px; font-size: 14px; }

.footer-link { text-align: center; margin-top: 20px; }
.footer-link a { color: #666; text-decoration: none; font-size: 14px; }
.footer-link a:hover { text-decoration: underline; }

.success-message { text-align: center; }
.icon-check {
  width: 60px; height: 60px;
  background: #dcfce7; color: #166534;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 30px; margin: 0 auto 20px;
}
.success-message h4 { font-size: 20px; margin-bottom: 10px; }
.success-message p { color: #666; line-height: 1.5; margin-bottom: 30px; }

.btn-link {
  display: inline-block; width: 100%; padding: 14px;
  background: #f3f4f6; color: #333;
  text-decoration: none; border-radius: 8px;
  font-weight: 600; box-sizing: border-box;
  transition: background-color 0.2s;
}
.btn-link:hover { background: #e5e7eb; }
</style>