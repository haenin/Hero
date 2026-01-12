/**
 * <pre>
 * API Name        : organization_api.ts
 * Description     : 조직도 관련 API 함수
 *
 * 주요 함수
 *   - getOrganizationTree   : 조직도 전체 조회
 *   - searchEmployees       : 직원 검색
 *   - getDepartmentEmployees: 특정 부서 직원 조회
 *
 * History
 *   2025/12/26 (민철) 최초 작성
 *
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

import apiClient from '@/api/apiClient';
import {
  OrganizationTreeResponseDTO,
  EmployeeSearchRequestDTO,
  EmployeeSearchResponseDTO,
  OrganizationEmployeeDTO,
} from '@/types/approval/organization.types';

/**
 * 조직도 전체 조회
 * @description 계층 구조로 조직도를 조회함
 * @returns {Promise<OrganizationTreeResponseDTO>}
 */
export const getOrganizationTree = async (): Promise<OrganizationTreeResponseDTO> => {
  const response = await apiClient.get<OrganizationTreeResponseDTO>(
    '/approval/organization/tree'
  );
  return response.data;
};

/**
 * 직원 검색
 * @description 이름, 부서, 직책으로 직원 검색
 * @param {EmployeeSearchRequestDTO} params - 검색 조건
 * @returns {Promise<EmployeeSearchResponseDTO>}
 */
export const searchEmployees = async (
  params: EmployeeSearchRequestDTO
): Promise<EmployeeSearchResponseDTO> => {
  const response = await apiClient.get<EmployeeSearchResponseDTO>(
    '/approval/organization/employees/search', { params }
  );
  return response.data;
};

/**
 * 특정 부서의 직원 목록 조회
 * @description 부서별 직원 목록을 조회함
 * @param {number} departmentId - 부서 ID
 * @returns {Promise<OrganizationEmployeeDTO[]>}
 */
export const getDepartmentEmployees = async (
  departmentId: number
): Promise<OrganizationEmployeeDTO[]> => {
  const response = await apiClient.get<OrganizationEmployeeDTO[]>(
    `/approval/organization/departments/${departmentId}/employees`
  );
  return response.data;
};
