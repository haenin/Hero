/**
 * <pre>
 * TypeScript Name   : dashboard.api.ts
 * Description : 대시보드 출퇴근 타각 및 통계 API 호출 모듈
 *               - apiClient(axios instance) 기반으로 공통 호출 함수 제공
 *               - Authorization 헤더는 apiClient 인터셉터에서 자동 첨부됨
 *
 * History
 * 2025/12/26 (혜원) 최초 작성
 * 2026/01/06 (혜원) 퇴근 API에 휴게시간 포함 여부 파라미터 추가
 * 2026/01/07 (혜원) 근무제 템플릿 조회 API 추가
 * </pre>
 *
 * @author 혜원
 * @version 1.2
 */
import apiClient from '@/api/apiClient'
import type {
  ApiResponse,
  ClockStatusDTO,
  WeeklyStatsDTO,
  MonthlySummaryDTO,
  AttendanceStatsDTO,
  VacationStatsDTO,
  ApprovalStatsDTO,
  WorkSystemTemplateDTO
} from '@/types/dashboard/dashboard.types'

const dashboardApi = {
  /**
   * 출근 처리
   * POST /api/dashboard/clock-in
   */
  async clockIn(): Promise<ApiResponse<void>> {
    const res = await apiClient.post<ApiResponse<void>>('/dashboard/clock-in')
    return res.data
  },

  /**
   * 퇴근 처리
   * POST /api/dashboard/clock-out
   * @param includeBreakTime 휴게시간 차감 여부 (true: 오후 1시 이후 - 휴게시간 차감, false: 오후 1시 이전 - 차감 안함)
   */
  async clockOut(includeBreakTime: boolean): Promise<ApiResponse<void>> {
    const res = await apiClient.post<ApiResponse<void>>(
      '/dashboard/clock-out',
      { includeBreakTime }
    )
    return res.data
  },

  /**
   * 근무제 템플릿 정보 조회
   * GET /api/dashboard/work-system-template/{templateId}
   * @param templateId 근무제 템플릿 ID
   */
  async getWorkSystemTemplate(templateId: number): Promise<ApiResponse<WorkSystemTemplateDTO>> {
    const res = await apiClient.get<ApiResponse<WorkSystemTemplateDTO>>(
      `/dashboard/work-system-template/${templateId}`
    )
    return res.data
  },

  /**
   * 오늘 출퇴근 상태 조회
   * GET /api/dashboard/status
   */
  async getTodayStatus(): Promise<ApiResponse<ClockStatusDTO>> {
    const res = await apiClient.get<ApiResponse<ClockStatusDTO>>('/dashboard/status')
    return res.data
  },

  /**
   * 이번 주 근무 통계 조회
   * GET /api/dashboard/weekly-stats
   */
  async getWeeklyStats(): Promise<ApiResponse<WeeklyStatsDTO>> {
    const res = await apiClient.get<ApiResponse<WeeklyStatsDTO>>('/dashboard/weekly-stats')
    return res.data
  },

  /**
   * 이번 달 요약 통계 조회
   * GET /api/dashboard/monthly-summary
   */
  async getMonthlySummary(): Promise<ApiResponse<MonthlySummaryDTO>> {
    const res = await apiClient.get<ApiResponse<MonthlySummaryDTO>>('/dashboard/monthly-summary')
    return res.data
  },

  /**
   * 출근 통계 조회
   * GET /api/dashboard/attendance-stats
   */
  async getAttendanceStats(): Promise<ApiResponse<AttendanceStatsDTO>> {
    const res = await apiClient.get<ApiResponse<AttendanceStatsDTO>>('/dashboard/attendance-stats')
    return res.data
  },

  /**
   * 휴가 현황 조회
   * GET /api/dashboard/vacation-stats
   */
  async getVacationStats(): Promise<ApiResponse<VacationStatsDTO>> {
    const res = await apiClient.get<ApiResponse<VacationStatsDTO>>('/dashboard/vacation-stats')
    return res.data
  },

  /**
   * 결재 현황 조회
   * GET /api/dashboard/approval-stats
   */
  async getApprovalStats(): Promise<ApiResponse<ApprovalStatsDTO>> {
    const res = await apiClient.get<ApiResponse<ApprovalStatsDTO>>('/dashboard/approval-stats')
    return res.data
  },

   /**
   * 내 기본 근무제 템플릿 정보 조회
   * GET /api/dashboard/my-default-template
   */
  async getMyDefaultTemplate(): Promise<ApiResponse<WorkSystemTemplateDTO>> {
    const res = await apiClient.get<ApiResponse<WorkSystemTemplateDTO>>(
      '/dashboard/my-default-template'
    )
    return res.data
  },
}

export default dashboardApi