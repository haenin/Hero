/**
 * TypeScript Name   : attendanceStore.ts
 * Description : 근태(Attendance) 관련 Pinia 스토어
 *               - 개인 근태 이력 목록/페이지네이션/기간 필터 상태 관리
 *               - 개인 근태 상단 요약 카드 상태 관리
 *
 * History
 * 2025/12/10 - 이지윤 최초 작성
 * 2025/12/18 - 개인 근태 요약 카드 상태/액션 추가
 * 2026/01/01 - 이지윤 type 분리
 * 
 * @author 이지윤
 * @version 1.2
 */

import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'
import type { PersonalSummaryDTO } from '@/types/attendance/attendance-summary.types'
import type { PageResponse } from '@/types/common/pagination.types' 
import type {
  AttendanceState,
  PersonalDTO,
  SelectedAttendanceRow,
} from '@/types/attendance/attendanceStore.types'


/**
 * 근태(Attendance) 도메인 Pinia 스토어
 * - 개인 근태 이력 리스트 및 페이징/필터/요약 상태 관리
 */
export const useAttendanceStore = defineStore('attendanceStore', {
  state: (): AttendanceState => ({
    // 리스트 / 페이징
    personalList: [],
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,
    loading: false,

    // 기간 필터 (기본값: 공백 -> BE에서 이번달 1일~오늘로 보정)
    startDate: '',
    endDate: '',

    // 상단 요약 카드 (초기값)
    workDays: 0,
    todayWorkSystemName: '',
    lateCount: 0,
    absentCount: 0,
    earlyCount: 0,
    selectedRow: null
  }),

  actions: {
    /**
     * 근태 조회 기간 필터(시작일/종료일)를 설정합니다.
     *
     * @param {string} start - 조회 시작일 (YYYY-MM-DD), 빈 문자열이면 필터 미적용
     * @param {string} end - 조회 종료일 (YYYY-MM-DD), 빈 문자열이면 필터 미적용
     */
    setFilterDates(start: string, end: string): void {
      this.startDate = start
      this.endDate = end
    },

    /**
     * 개인 근태 이력 목록을 조회합니다.
     * - 페이지 번호를 기준으로 서버에 요청
     * - 기간 필터(startDate, endDate)가 설정되어 있으면 함께 전달
     *
     * @param {number} page - 조회할 페이지 번호 (기본값: 1)
     * @returns {Promise<void>} API 호출 완료 후 상태 업데이트
     */
    async fetchPersonal(page = 1): Promise<void> {
      this.loading = true
      this.currentPage = page

      try {
        const response = await apiClient.get<PageResponse<PersonalDTO>>(
          '/attendance/personal',
          {
            params: {
              page,
              size: this.pageSize,
              startDate: this.startDate || undefined,
              endDate: this.endDate || undefined,
            },
          },
        )

        const data = response.data

        this.personalList = data.content
        this.currentPage = data.page + 1 // 0-based → 1-based
        this.totalCount = data.totalElements ?? 0
        this.totalPages = data.totalPages
      } catch (error) {
        console.error('개인 근태 이력 조회 실패:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 개인 근태 상단 요약 카드를 조회합니다.
     * - 기간 필터(startDate, endDate)가 설정되어 있으면 동일하게 적용
     *
     * @returns {Promise<void>}
     */
    async fetchPersonalSummary(): Promise<void> {
      try {
        const response = await apiClient.get<PersonalSummaryDTO>(
          '/attendance/personal/summary',
        );

        const data = response.data

        this.workDays = data.workDays ?? 0
        this.todayWorkSystemName = data.todayWorkSystemName ?? ''
        this.lateCount = data.lateCount ?? 0
        this.absentCount = data.absentCount ?? 0
        this.earlyCount = data.earlyCount ?? 0
      } catch (error) {
        console.error('개인 근태 요약 조회 실패:', error)
      }
    },

    setSelectdRow(row: SelectedAttendanceRow): void{
      this.selectedRow = row
    },

    clearSelectedRow(): void{
      this.selectedRow = null
    }
  },
})
