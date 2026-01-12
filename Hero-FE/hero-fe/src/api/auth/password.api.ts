import apiClient from '@/api/apiClient';
import type { 
  PasswordChangeRequest, 
  PasswordResetRequest, 
  PasswordReset 
} from '@/types/auth/password.types';

// 비밀번호 변경 (로그인 후)
export const changePassword = (data: PasswordChangeRequest) => {
  return apiClient.put('/employee/password', data);
};

// 비밀번호 재설정 요청 (이메일 발송)
export const requestPasswordReset = (data: PasswordResetRequest) => {
  return apiClient.post('/auth/password/reset-request', data);
};

// 비밀번호 재설정 (토큰 사용)
export const resetPassword = (data: PasswordReset) => {
  return apiClient.post('/auth/password/reset', data);
};