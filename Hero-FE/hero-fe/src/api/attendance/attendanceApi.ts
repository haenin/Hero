/**
 * <pre>
 * TypeScript Name   : attendanceApi.ts
 * Description : 근태(Attendance) 도메인 API 호출 모듈
 *               - apiClient(axios instance) 기반으로 공통 호출 함수 제공
 *               - Authorization 헤더는 apiClient 인터셉터에서 자동 첨부됨
 *
 * History
 * 2025/12/18 - 작성
 * </pre>
 *
 * @author
 * @version 1.0
 */

import apiClient from '@/api/apiClient'

/** 공통 페이지 응답 타입 (프로젝트 공통 PageResponse와 매칭) */
export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalCount: number
  totalPages: number
}

/** ====== DTO 타입들(프론트 표시용) ====== */
export interface PersonalDTO {
  attendanceId: number
  workDate: string
  state: string
  startTime?: string | null
  endTime?: string | null
  workDuration?: number | null
  workSystemName?: string | null
}

export interface OvertimeDTO {
  overtimeId: number
  date: string
  startTime?: string | null
  endTime?: string | null
  overtimeHours?: number | null
  reason?: string | null
}

export interface CorrectionDTO {
  correctionId: number
  date: string
  reason?: string | null
  prevStartTime?: string | null
  prevEndTime?: string | null
  newStartTime?: string | null
  newEndTime?: string | null
}

export interface ChangeLogDTO {
  workSystemChangeLogId: number
  date: string
  changeReason?: string | null
  startTime?: string | null
  endTime?: string | null
  workSystemName?: string | null
}


/** ====== 공통 파라미터 ====== */
export interface ListQueryParams {
  page?: number
  size?: number
  startDate?: string
  endDate?: string
}

/** ====== API 함수들 ====== */
const attendanceApi = {
  /** 개인 근태 이력 */
  async getPersonalList(params: ListQueryParams) {
    const res = await apiClient.get<PageResponse<PersonalDTO>>('/attendance/personal', {
      params,
    })
    return res.data
  },

  /** 초과 근무 이력 */
  async getOvertimeList(params: ListQueryParams) {
    const res = await apiClient.get<PageResponse<OvertimeDTO>>('/attendance/overtime', {
      params,
    })
    return res.data
  },

  /** 근태 정정 이력 */
  async getCorrectionList(params: ListQueryParams) {
    const res = await apiClient.get<PageResponse<CorrectionDTO>>('/attendance/correction', {
      params,
    })
    return res.data
  },

  /** 근무제 변경 이력 */
  async getChangeLogList(params: ListQueryParams) {
    const res = await apiClient.get<PageResponse<ChangeLogDTO>>('/attendance/changeLog', {
      params,
    })
    return res.data
  },
}

export default attendanceApi
