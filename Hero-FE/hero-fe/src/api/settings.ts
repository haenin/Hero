import apiClient from '@/api/apiClient';
import type {
  SettingsDepartmentRequestDTO,
  SettingsDepartmentResponseDTO,
  SettingsLoginPolicyRequestDTO,
  SettingsPermissionsRequestDTO,
  SettingsPermissionsResponseDTO,
  SettingsGradeRequestDTO,
  SettingsJobTitleRequestDTO,
  
  Grade,
  JobTitle,
  Role
} from '@/types/settings';

// 공통 응답 타입 정의 (필요 시 types/api.ts 등으로 분리 권장)
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

const BASE_URL = '/settings';

// 부서 관리
export const getDepartments = async () => {
  const response = await apiClient.get<ApiResponse<SettingsDepartmentResponseDTO[]>>(`${BASE_URL}/departments`);
  console.log('getDepartments API Response:', response.data);
  return response.data;
};

export const saveOrUpdateDepartments = async (departments: SettingsDepartmentRequestDTO[]) => {
  const response = await apiClient.post<ApiResponse<string>>(`${BASE_URL}/departments/tree`, departments);
  console.log('saveOrUpdateDepartments API Response:', response.data);
  return response.data;
};

// 직급 관리
export const getGrades = async () => {
  const response = await apiClient.get<ApiResponse<Grade[]>>(`${BASE_URL}/grades`);
  return response.data;
};

export const updateGrades = async (grades: any[]) => {
  const response = await apiClient.post<ApiResponse<string>>(`${BASE_URL}/grades/batch`, grades);
  return response.data;
};

// 직책 관리
export const getJobTitles = async () => {
  const response = await apiClient.get<ApiResponse<JobTitle[]>>(`${BASE_URL}/job-titles`);
  return response.data;
};

export const updateJobTitles = async (jobTitles: any[]) => {
  console.log('updateJobTitles API Request:', jobTitles);
  const response = await apiClient.post<ApiResponse<string>>(`${BASE_URL}/job-titles/batch`, jobTitles);
  return response.data;
};

// 로그인 정책
export const getLoginPolicy = async () => {
  const response = await apiClient.get<ApiResponse<number>>(`${BASE_URL}/login-policy`);
  return response.data;
};

export const setLoginPolicy = async (policy: SettingsLoginPolicyRequestDTO) => {
  const response = await apiClient.put<ApiResponse<string>>(`${BASE_URL}/login-policy`, policy);
  return response.data;
};

// 권한 관리
export const getPermissions = async (page: number, size: number, query?: string) => {
  const params = { page, size, query };
  const response = await apiClient.get<ApiResponse<PageResponse<SettingsPermissionsResponseDTO>>>(`${BASE_URL}/permissions`, { params });
  return response.data;
};

export const getRoles = async () => {
  const response = await apiClient.get<ApiResponse<Role[]>>(`${BASE_URL}/roles`);
  return response.data;
};

export const updatePermissions = async (dto: SettingsPermissionsRequestDTO) => {
  const response = await apiClient.put<ApiResponse<string>>(`${BASE_URL}/permissions`, dto);
  return response.data;
};
