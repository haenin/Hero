/**
 * <pre>
 * TypeScript Name : vacation-department.types.ts
 * Description     : 부서 휴가 캘린더(DepartmentVacation) 도메인 타입 정의
 *                   - 부서 휴가 일정 단건 DTO
 *                   - 부서 휴가 캘린더 스토어 상태 타입
 *
 * History
 *   2026/01/01 (이지윤) 부서 휴가 캘린더 타입 최초 작성
 * </pre>
 *
 * @author 이지윤
 * @version 1.0
 */

/**
 * 부서 휴가 캘린더 단건 DTO
 * - 백엔드 DepartmentVacationDTO 와 필드명을 매칭
 */
export interface DepartmentVacationDTO {
  /** 휴가 로그 PK */
  vacationLogId: number;
  /** 직원 ID */
  employeeId: number;
  /** 직원 이름 */
  employeeName: string;
  /** 휴가 종류명 (연차 / 반차 / 병가 등) */
  vacationTypeName: string;
  /** 휴가 시작일(yyyy-MM-dd) */
  startDate: string;
  /** 휴가 종료일(yyyy-MM-dd) */
  endDate: string;
}

/**
 * 부서 휴가 캘린더 스토어 상태 타입
 */
export interface DepartmentVacationState {
  /** 부서 휴가 일정 리스트 */
  items: DepartmentVacationDTO[];
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 (없으면 null) */
  errorMessage: string | null;

  /** 조회 기준 부서 ID (필요 시 사용) */
  departmentId: number | null;
  /** 로그인한 직원 ID (본인/팀원 구분용) */
  myEmployeeId: number | null;
}
