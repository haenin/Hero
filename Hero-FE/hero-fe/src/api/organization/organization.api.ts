/**
 * File Name   : organization.api.ts
 * Description : 조직도 관련 API 호출 모듈
 *
 * History
 * 2025/12/29 - 승건 최초 작성
 */

import client from '@/api/apiClient';
import type { 
  OrganizationNode,
  DepartmentHistoryResponse,
  GradeHistoryResponse,
  ApiResponse,
} from '@/types/organization/organization.types';

/**
 * 조직도 트리 구조 조회
 * @returns 부서와 직원이 포함된 트리 구조의 최상위 노드 리스트
 */
export const fetchOrganizationChart = () => {
  return client.get<ApiResponse<OrganizationNode[]>>('/departments/organization-chart');
};

/**
 * 특정 직원의 부서 변경 이력을 조회합니다.
 * @param employeeId 직원 ID
 * @returns 부서 변경 이력 리스트
 */
export const fetchDepartmentHistory = (employeeId: number) => {
  return client.get<ApiResponse<DepartmentHistoryResponse[]>>(`/departments/history/department/${employeeId}`);
};

/**
 * 특정 직원의 직급 변경 이력을 조회합니다.
 * @param employeeId 직원 ID
 * @returns 직급 변경 이력 리스트
 */
export const fetchGradeHistory = (employeeId: number) => {
  return client.get<ApiResponse<GradeHistoryResponse[]>>(`/departments/history/grade/${employeeId}`);
};
