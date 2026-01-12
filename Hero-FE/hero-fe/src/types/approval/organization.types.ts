/**
 * <pre>
 * TypeScript Name : organization.types.ts
 * Description     : 조직도 모달 관련 타입 정의
 *
 * 주요 타입
 *   - OrganizationDepartmentDTO : 부서 정보
 *   - OrganizationEmployeeDTO   : 직원 정보
 *   - OrganizationTreeDTO       : 조직도 트리 구조
 *
 * History
 *   2025/12/26 (민철) 최초 작성
 *
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

/**
 * 부서 정보 DTO
 * @description API 응답 - 부서 기본 정보
 */
export interface OrganizationDepartmentDTO {
  departmentId: number;
  departmentName: string;
  depth: number;
  parentDepartmentId: number | null;
  managerId: number | null;
  managerName: string | null;
  employeeCount: number;
}

/**
 * 직원 정보 DTO
 * @description API 응답 - 직원 기본 정보
 */
export interface OrganizationEmployeeDTO {
  employeeId: number;
  employeeName: string;
  departmentId: number;
  departmentName: string;
  gradeId: number;
  gradeName: string;
  jobTitleId: number | null;
  jobTitleName: string | null;
  email: string;
  phone: string;
}

/**
 * 조직도 트리 노드 DTO
 * @description API 응답 - 계층 구조 조직도
 */
export interface OrganizationTreeNodeDTO {
  type: 'department' | 'employee';
  departmentId?: number;
  departmentName?: string;
  depth?: number;
  employeeCount?: number;
  employeeId?: number;
  employeeName?: string;
  gradeName?: string;
  jobTitleName?: string;
  children?: OrganizationTreeNodeDTO[];
}

/**
 * 조직도 전체 응답 DTO
 * @description API 응답 - 전체 조직도 구조
 */
export interface OrganizationTreeResponseDTO {
  root: OrganizationTreeNodeDTO;
}

/**
 * 직원 검색 요청 DTO
 * @description API 요청 - 직원 검색
 */
export interface EmployeeSearchRequestDTO {
  keyword: string;
  departmentId?: number;
  gradeId?: number;
}

/**
 * 직원 검색 응답 DTO
 * @description API 응답 - 검색 결과 목록
 */
export interface EmployeeSearchResponseDTO {
  employees: OrganizationEmployeeDTO[];
  totalCount: number;
}

/**
 * 선택된 결재자 정보
 * @description 프론트 - 결재선에 추가할 직원 정보
 */
export interface SelectedApproverDTO {
  seq?: number;  // 결재 순서 (추가 시 자동 할당)
  approverId: number;
  approverName: string;
  departmentId: number;
  departmentName: string;
  gradeName: string;
  jobTitleName: string;
}

/**
 * 선택된 참조자 정보
 * @description 프론트 - 참조 목록에 추가할 직원 정보
 */
export interface SelectedReferencerDTO {
  referencerId: number;
  referencerName: string;
  departmentId: number;
  departmentName: string;
  gradeName: string;
  jobTitleName: string;
}
