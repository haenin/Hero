/**
 * <pre>
 * File Name   : personnel.ts
 * Description : 사원 정보와 관련된 API 호출 모듈
 *
 * History
 * 2025/12/12 (승건) 최초 작성
 * 2025/12/28 (혜원) 프로필 조회 API 추가
 * 2025/12/28 (혜원) Security Context 기반으로 리팩토링
 * </pre>
 *
 * @author 승건
 * @version 2.0
 */

import client from '@/api/apiClient';
import type {
  DepartmentHistoryResponse,
  EmployeeDetailResponse,
  EmployeeListResponse,
  EmployeeRegisterParams,
  EmployeeSearchParams,
  EmployeeSelfUpdateParams,
  MyInfoResponse,
  EmployeeSearchOptionsResponse
} from '@/types/personnel/personnel';

// API 공통 응답 타입 정의
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: any;
}

// 페이징 응답 타입 정의
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * 직원 프로필 정보 인터페이스
 */
export interface EmployeeProfileResponse {
  employeeNumber: string;
  employeeName: string;
  birthDate: string;
  contractType: string;
  position: string;
  rank: string;
  department: string;
  team: string;
  email: string;
  officePhone: string;
  mobile: string;
  address: string;
  hireDate: string;
  yearsOfService: number;
  salary: number;
  status: string;
  performance: string;
  profileImageUrl: string | null;
  sealImageUrl: string | null;
}

// ==================== 기존 직원 관리 API ====================

/**
 * 사원 목록 조회 (페이징 및 검색)
 * @param params 검색 조건 (부서명, 직급, 이름 등)
 */
export const fetchEmployees = (params: EmployeeSearchParams) => {
  return client.get<ApiResponse<PageResponse<EmployeeListResponse>>>('/employee/search', {
    params,
  });
};

/**
 * 사원 상세 정보 조회
 * @param employeeId 조회할 사원 ID
 */
export const fetchEmployeeDetail = (employeeId: number) => {
  return client.get<ApiResponse<EmployeeDetailResponse>>(`/employee/${employeeId}`);
};

/**
 * 신규 사원 등록
 * @param data 사원 등록 정보 (FormData)
 */
export const createEmployee = (data: FormData) => {
  return client.post<ApiResponse<void>>('/employee/signup', data, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
  })
};

/**
 * 내 정보 조회
 */
export const fetchMyInfo = () => {
  return client.get<ApiResponse<MyInfoResponse>>('/employee/me');
};

/**
 * 부서, 직급, 직책 종류 조회
 */
export const fetchEmployeeSearchOptions = () => {
  return client.get<ApiResponse<EmployeeSearchOptionsResponse>>('/employee/search-options');
};

// ==================== 프로필 조회 ====================

/**
 * 현재 로그인한 사용자의 프로필 조회
 * Security Context에서 자동으로 사용자 정보 추출
 * @author 혜원
 */
export const fetchMyProfile = () => {
  return client.get<ApiResponse<EmployeeProfileResponse>>('/employee/profile');
};

// ==================== 연락처 정보 ====================

/**
 * 연락처 정보 인터페이스
 */
export interface ContactUpdateRequest {
  email: string;
  phone: string;
  address: string;
}

/**
 * 연락처 정보 수정
 * Security Context에서 자동으로 사용자 정보 추출
 * @param data 수정할 연락처 정보
 * @author 혜원
 */
export const updateContactInfo = (data: ContactUpdateRequest) => {
  return client.put<ApiResponse<void>>('/employee/contact', data);
};

// ==================== 비밀번호 ====================

/**
 * 비밀번호 변경 요청 인터페이스
 */
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * 비밀번호 변경
 * Security Context에서 자동으로 사용자 정보 추출
 * @param data 비밀번호 변경 정보
 * @author 혜원
 */
export const changePassword = (data: PasswordChangeRequest) => {
  return client.put<ApiResponse<void>>('/employee/password', data);
};

// ==================== 직인 관리 ====================

/**
 * 텍스트 직인 저장
 * Security Context에서 자동으로 사용자 정보 추출
 * @param sealText 직인 텍스트
 * @author 혜원
 */
export const updateSealText = (sealText: string) => {
  return client.put<ApiResponse<void>>('/employee/seal/text', { sealText });
};

/**
 * 이미지 직인 업로드
 * Security Context에서 자동으로 사용자 정보 추출
 * @param formData 이미지 파일이 포함된 FormData
 * @author 혜원
 */
export const uploadSealImage = (formData: FormData) => {
  return client.post<ApiResponse<void>>('/employee/seal/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 직인 삭제
 * Security Context에서 자동으로 사용자 정보 추출
 * @author 혜원
 */
export const deleteSeal = () => {
  return client.delete<ApiResponse<void>>('/employee/seal');
};

/**
 * 내 직인 자동 생성
 * Security Context에서 자동으로 사용자 정보 추출
 * @author 혜원
 */
export const generateMySeal = () => {
  return client.post<ApiResponse<void>>('/employee/seal/generate');
};

/**
 * 내 직인 이미지 조회
 * Security Context에서 자동으로 사용자 정보 추출
 * @author 혜원
 */
export const getMySeal = () => {
  return client.get<ApiResponse<string>>('/employee/seal');
};