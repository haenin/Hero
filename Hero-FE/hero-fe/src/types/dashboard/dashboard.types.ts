/**
 * <pre>
 * TypeScript Name   : dashboard.types.ts
 * Description : 대시보드 출퇴근 타각 및 통계 관련 타입 정의
 *
 * History
 * 2025/12/26 (혜원) 최초 작성
 * </pre>
 *
 * @author 혜원
 * @version 1.0
 */

/**
 * 근무제 템플릿 정보
 */
export interface WorkSystemTemplateDTO {
  workSystemTemplateId?: number;
  templateId?: number;
  startTime: string;
  breakMinMinutes?: number;  // 분 단위 (120)  reason?: string;
  workSystemTypeId?: number;
}

/** 출퇴근 상태 정보 */
export interface ClockStatusDTO {
  attendanceId: number | null
  workDate: string
  startTime?: string | null
  endTime?: string | null
  state?: string | null
  workDuration?: number | null
  isClockedIn: boolean
  isClockedOut: boolean
  workSystemTemplateId: number | null  // 추가됨

}

/** 주간 근무 통계 정보 */
export interface WeeklyStatsDTO {
  totalWorkMinutes: number
  totalWorkHours: number
  legalWeeklyHours: number
  achievementRate: number
  isWorkingToday: boolean
  todayWorkMinutes: number
}

/** 월간 요약 통계 */
export interface MonthlySummaryDTO {
  workDays: number
  remainingAnnualLeave: number
  usedVacationDays: number
}

/** 출근 통계 */
export interface AttendanceStatsDTO {
  normalDays: number
  lateDays: number
  absentDays: number
  earlyLeaveDays: number
}

/** 휴가 현황 */
export interface VacationStatsDTO {
  annualLeaveDays: number
  halfDayDays: number
  sickLeaveDays: number
  otherLeaveDays: number
}

/** 결재 현황 */
export interface ApprovalStatsDTO {
  pendingCount: number
  approvedCount: number
  rejectedCount: number
}

/** API 응답 공통 타입 */
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}