// c:\SWCamp_19th\Project_fin\Hero-FE\hero-fe\src\types\retirement\retirement.types.ts

/**
 * API 공통 응답 래퍼
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

/**
 * 퇴사 사유 DTO
 */
export interface ExitReasonDTO {
  exitReasonId: number;
  reasonName: string;
  reasonType: string;
  detailDescription: string;
}

/**
 * 퇴직 현황 요약 DTO
 */
export interface RetirementSummaryDTO {
  retentionRate: number;       // 잔존율
  settlementRate: number;      // 정착율
  totalTurnoverRate: number;   // 종합 이직률
  newHireTurnoverRate: number; // 신입 이직률
}

/**
 * 퇴사 사유별 통계 DTO
 */
export interface ExitReasonStatDTO {
  reasonName: string;
  count: number;
}

/**
 * 퇴사 사유 통계 응답 DTO
 */
export interface ExitReasonStatsResponseDTO {
  earlyLeavers: ExitReasonStatDTO[]; // 1년 미만 퇴사자 통계
  totalLeavers: ExitReasonStatDTO[]; // 전체 퇴사자 통계
}

/**
 * 근속 연수별 인력 분포 DTO
 */
export interface TenureDistributionDTO {
  tenureRange: string;
  percentage: number;
}

/**
 * 신입 사원 정착률 및 이직률 통계 DTO
 */
export interface NewHireStatDTO {
  quarter: string;
  settlementRate: number;
  turnoverRate: number;
}

/**
 * 부서별 이직률 통계 DTO
 */
export interface DepartmentTurnoverDTO {
  departmentName: string;
  currentCount: number;
  retiredCount: number;
  turnoverRate: number;
}
