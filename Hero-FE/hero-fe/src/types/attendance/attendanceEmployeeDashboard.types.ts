/**
 * <pre>
 * TypeScript Name : attendance-employee-dashboard.types.ts
 * Description     : 직원 반기(상/하반기) 근태 대시보드 Drawer 타입 정의
 *                   - 반기 구분 타입
 *                   - 직원 반기 요약/월별 통계 DTO
 *                   - Drawer 스토어 상태 타입
 *
 * History
 *   2026/01/01 (지윤) 직원 반기 근태 대시보드 타입 최초 작성
 * </pre>
 *
 * @author 이지윤
 * @version 1.0
 */

/**
 * 반기(Half) 구분 타입
 * - H1 : 상반기
 * - H2 : 하반기
 */
export type AttendanceHalfType = 'H1' | 'H2';

/**
 * 직원 반기 요약 정보 DTO
 * - 해당 반기 전체 기준 집계값
 */
export interface AttendanceEmployeeHalfSummaryDTO {
  /** 총 출근 일수 */
  totalWorkDays: number;
  /** 총 지각 횟수 */
  totalTardyCount: number;
  /** 총 결근 횟수 */
  totalAbsenceCount: number;
}

/**
 * 직원 월별 근태 통계 DTO
 * - 반기 내 각 월별 출근/지각/결근 집계값
 */
export interface AttendanceEmployeeMonthlyStatDTO {
  /** 월 (1~12) */
  month: number;
  /** 해당 월 출근 일수 */
  workDays: number;
  /** 해당 월 지각 횟수 */
  tardyCount: number;
  /** 해당 월 결근 횟수 */
  absenceCount: number;
}

/**
 * 직원 반기 근태 대시보드 DTO
 * - Drawer에 표시되는 한 직원의 반기 전체 데이터
 */
export interface AttendanceEmployeeHalfDashboardDTO {
  /** 직원 ID (PK) */
  employeeId: number;
  /** 사번 */
  employeeNumber: string;
  /** 직원 이름 */
  employeeName: string;
  /** 기준 연도 */
  year: number;
  /** 반기 구분 (H1/H2) */
  half: AttendanceHalfType;
  /** 반기 요약 정보 */
  summary: AttendanceEmployeeHalfSummaryDTO;
  /** 반기 내 월별 통계 목록 */
  monthlyStats: AttendanceEmployeeMonthlyStatDTO[];
}

/**
 * 직원 반기 근태 대시보드 Drawer 스토어 상태 타입
 */
export interface AttendanceEmployeeDashboardState {
  /** Drawer open 여부 */
  open: boolean;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 (없으면 null) */
  errorMessage: string | null;

  /** 현재 선택된 직원 ID */
  selectedEmployeeId: number | null;
  /** 현재 선택된 연도 */
  year: number;
  /** 현재 선택된 반기 */
  half: AttendanceHalfType;

  /** 서버에서 조회한 직원 반기 대시보드 데이터 */
  dashboard: AttendanceEmployeeHalfDashboardDTO | null;
}
