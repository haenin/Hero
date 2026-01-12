// 비밀번호 변경 요청 (로그인 후)
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

// 비밀번호 재설정 요청 (이메일 발송 요청)
export interface PasswordResetRequest {
  employeeNumber: string;
  email: string;
}

// 비밀번호 재설정 (토큰 이용)
export interface PasswordReset {
  token: string;
  newPassword: string;
}

// 로그인 응답 데이터 (Login.vue에서 사용)
export interface LoginResponseData {
  message: string;
  passwordChangeRequired: boolean;
}