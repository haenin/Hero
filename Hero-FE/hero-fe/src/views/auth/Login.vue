<!--
  <pre>
  (File=>Vue) Name   : Login.vue
  Description : 사용자 로그인 UI와 로직을 담당하는 페이지 컴포넌트입니다.
                - 아이디/비밀번호 입력
                - 아이디 저장 기능
                - 비밀번호 보이기/숨기기 기능
                - 로그인 API 호출 및 결과 처리

  History
  2025/12/11 - 이승건 최초 작성
  </pre>

  @author 이승건
  @version 1.0
-->
<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="/images/logo.png" alt="HERO Logo" class="login-logo" />
        <h3>로그인</h3>
        <p>HERO HRIS 시스템에 접속하세요</p>
      </div>
      <form class="login-body" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="account">아이디</label>
          <input type="text" id="account" v-model="account" required />
        </div>
        <div class="form-group">
          <label for="password">비밀번호</label>
          <div class="password-wrapper">
            <input :type="passwordFieldType" id="password" v-model="password" required />
            <button type="button" @click="togglePasswordVisibility" class="password-toggle-btn">
              {{ passwordFieldType === 'password' ? '보기' : '숨김' }}
            </button>
          </div>
        </div>
        <div class="login-options">
          <label class="save-id-label">
            <input type="checkbox" v-model="saveId" /> 아이디 저장
          </label>
          <router-link to="/find-password" class="find-password-link">비밀번호 찾기</router-link>
        </div>
        <button type="submit">로그인</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
    </div>

    <!-- 비밀번호 변경 모달 -->
    <PasswordChangeModal
      v-if="showPasswordChangeModal"
      :current-password="password"
      @success="handlePasswordChangeSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/apiClient';
import PasswordChangeModal from './PasswordChangeModal.vue';
import type { LoginResponseData } from '@/types/auth/password.types';

const account = ref('');
const password = ref('');
const errorMessage = ref('');
const passwordFieldType = ref<'password' | 'text'>('password');
const saveId = ref(false);
const showPasswordChangeModal = ref(false);
const isLoading = ref(false);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

/**
 * (설명 : )비밀번호 입력 필드의 타입을 'password'와 'text' 사이에서 토글합니다.
 * @returns {void}
 */
const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};

/**
 * (설명 : )로그인 폼 제출 시 실행되는 비동기 함수입니다.
 * 아이디 저장 로직을 처리하고, 서버에 로그인 API를 호출합니다.
 * @returns {Promise<void>}
 */
const handleLogin = async () => {
  if (isLoading.value) return; // 이미 요청 중이면 중단

  errorMessage.value = ''; // 이전 오류 메시지 초기화
  isLoading.value = true;  // 로딩 시작

  // 아이디 저장 로직
  if (saveId.value) {
    localStorage.setItem('savedAccountId', account.value);
  } else {
    localStorage.removeItem('savedAccountId');
  }

  try {
    const response = await apiClient.post<LoginResponseData>('/auth/login', {
      account: account.value,
      password: password.value,
    });

    // 디버깅을 위해 서버 응답 전체를 로그로 출력합니다.
    console.log('API 응답 데이터:', response.data);
    console.log('API 응답 헤더:', response.headers);

    // API 응답 헤더에서 Authorization 토큰을 확인하고 저장
    const tokenHeader = response.headers.authorization;

    if (tokenHeader) {
      // 'Bearer ' 접두사가 있을 경우 제거하고 순수 토큰만 추출
      const accessToken = tokenHeader.startsWith('Bearer ') ? tokenHeader.substring(7) : tokenHeader;
      authStore.login(accessToken); // 토큰 저장

      console.log('로그인 성공');
      console.log(authStore.user);

      // 비밀번호 변경 필요 여부 확인
      if (response.data && response.data.passwordChangeRequired) {
        showPasswordChangeModal.value = true;
      } else {
        // SYSTEM_ADMIN인 경우 설정 페이지로 이동
        if (authStore.hasAnyRole(['ROLE_SYSTEM_ADMIN'])) {
          router.push('/settings');
        } else {
          // 로그인 후 리디렉션 쿼리가 있으면 해당 경로로, 없으면 메인 페이지로 이동
          router.push((route.query.redirect as string) || '/');
        }
      }
    } else {
      errorMessage.value = '로그인 실패: 서버로부터 유효한 인증 토큰을 받지 못했습니다.';
    }
  } catch (error: any) {
    // 401 오류는 아이디/비밀번호 오류로 간주하고 명확한 메시지를 표시합니다.
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message;
    } else if (error.response?.status === 401) {
      errorMessage.value = '아이디 또는 비밀번호가 일치하지 않습니다.';
    } else {
      errorMessage.value = '로그인 중 오류가 발생했습니다.';
    }
    password.value = ''; // 로그인 실패 시 비밀번호 초기화
    console.error('Login error:', error);
  } finally {
    isLoading.value = false; // 로딩 종료
  }
};

/**
 * 비밀번호 변경 성공 시 처리
 * 모달을 닫고 로그아웃 처리하거나 다시 로그인하도록 유도
 */
const handlePasswordChangeSuccess = () => {
  showPasswordChangeModal.value = false;
  authStore.logout(); // 보안을 위해 다시 로그인하도록 로그아웃 처리
  password.value = ''; // 비밀번호 입력창 초기화
};

/**
 * (설명 : )컴포넌트가 마운트될 때 실행됩니다.
 * localStorage에 저장된 아이디가 있으면 입력창에 자동으로 채웁니다.
 * @returns {void}
 */
onMounted(() => {
  const savedId = localStorage.getItem('savedAccountId');
  if (savedId) {
    account.value = savedId;
    saveId.value = true;
  }
});
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
}

/* 배경 워터마크 장식 */
.login-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background-image: url('/images/onlylogo.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  opacity: 0.05;
  z-index: 0;
  pointer-events: none;
  margin-left: 400px;
}

.login-card {
  position: relative;
  z-index: 1;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  overflow: hidden; /* 헤더의 둥근 모서리를 위해 추가 */
  border-top: 5px solid #1C398E; /* 브랜드 컬러 포인트 */
}

.login-header {
  padding: 40px 40px 20px;
  background: #fff;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.login-logo {
  height: 40px;
  margin-bottom: 16px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.login-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #1C398E;
  margin-bottom: 8px;
}

.login-header p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.login-body {
  padding: 40px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-size: 14px;
  font-weight: 600;
}

.form-group input[type="text"],
.form-group input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 16px;
  box-sizing: border-box; /* 패딩이 너비에 포함되도록 설정 */
}

.form-group input[type="text"]:focus,
.form-group input[type="password"]:focus {
  border-color: #1C398E;
  outline: none;
  box-shadow: 0 0 0 2px rgba(28, 57, 142, 0.2);
}

.password-wrapper {
  position: relative;
}

.password-toggle-btn {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 12px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 13px;
}

.save-id-label {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #555;
  cursor: pointer;
}

.find-password-link {
  color: #555;
  text-decoration: none;
}

.find-password-link:hover {
  text-decoration: underline;
}

button[type="submit"] {
  width: 100%;
  padding: 12px;
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
  opacity: 0.9;
}

button[type="submit"]:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.error-message {
  color: #dc3545;
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
}
</style>
