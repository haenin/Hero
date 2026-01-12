/**
 * TypeScript Name : organization.types.ts
 * Description : 조직도 관련 타입 정의
 *
 * History
 * 2025/12/29 - 승건 최초 작성
 */

/**
 * 조직도 내 직원 상세 정보
 * (Backend: OrganizationEmployeeDetailDTO)
 */
export interface OrganizationEmployeeDetail {
  employeeId: number;
  employeeName: string;
  employeeNumber: string; // 사번
  gradeName: string;      // 직급명
  jobTitleName: string;   // 직책명
  imagePath?: string;     // 프로필 이미지 경로 (Optional)
  
  email: string;          // 이메일
  birthDate?: string;     // 생년월일 (YYYY-MM-DD)
  gender: string;         // 성별
  hireDate: string;       // 입사일 (YYYY-MM-DD)
  contractType: string;   // 고용 형태
  status: string;         // 재직 상태
}

/**
 * 조직도 트리 노드 (부서)
 * (Backend: OrganizationNodeDTO)
 */
export interface OrganizationNode {
  departmentId: number;
  departmentName: string;
  parentDepartmentId?: number | null;
  depth: number;
  departmentPhone?: string; // 부서 전화번호
  managerId?: number | null; // 부서장 ID
  
  // 하위 부서 목록
  children: OrganizationNode[];
  
  // 해당 부서에 소속된 직원 목록
  employees: OrganizationEmployeeDetail[];
}

/**
 * 부서 변경 이력 DTO
 * (Backend: EmployeeDepartmentHistoryDTO)
 */
export interface DepartmentHistoryResponse {
  employeeHistoryId: number;
  employeeId: number;
  changedBy: number;
  changedAt: string;
  changeType: string;
  departmentName: string;
}

/**
 * 직급 변경 이력 DTO
 * (Backend: EmployeeGradeHistoryDTO)
 */
export interface GradeHistoryResponse {
  employeeHistoryId: number;
  employeeId: number;
  changedBy: number;
  changedAt: string;
  changeType: string;
  gradeName: string;
}

/**
 * API 공통 응답 포맷
 * (Backend: CustomResponse<T>)
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  errorCode?: string;
  message?: string;
}
