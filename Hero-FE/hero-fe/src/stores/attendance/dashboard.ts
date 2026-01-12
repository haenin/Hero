/**
 * TypeScript Name   : attendanceDashboardStore.ts
 * Description : 근태 점수 대시보드 관련 Pinia 스토어
 *               - 직원별 근태 점수 목록 / 페이지네이션 / 기간(및 부서) 필터 상태 관리
 *
 * History
 * 2025/12/17 - 이지윤 최초 작성
 * 2025/12/23 - 상단 요약(summary) 조회 기능 추가
 * 2025/12/24 - 월/부서/정렬 필터 + 부서 옵션 조회 + refreshDashboard 개선
 * 2026/01/01 - 이지윤 type 분리
 *
 * @author 이지윤
 * @version 1.3
 */

import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'


import type {
  AttendanceDashboardDTO,
  AttendanceDashboardPage,
  AttendanceDashboardState,
  AttendanceDashboardSummaryDTO,
  DepartmentOptionDTO,
  ScoreSort,
} from '@/types/attendance/dashboard.types'

/**
 * 근태 점수 대시보드 Pinia 스토어
 * - 직원별 근태 점수 목록 및 페이징/필터 상태 관리
 */
export const useAttendanceDashboardStore = defineStore(
  'attendanceDashboardStore',
  {
    state: (): AttendanceDashboardState => ({
      dashboardList: [],
      currentPage: 1,
      pageSize: 10,
      totalPages: 0,
      totalCount: 0,
      loading: false,

      departmentId: null,
      scoreSort: 'DESC',
      month: new Date().toISOString().slice(0,7),

      departmentOptions: [],
      deptLoading: false,

      summary: {
        totalEmployees: 0,
        excellentEmployees: 0,
        riskyEmployees: 0,
      }
    }),

    actions: {
      /**
       * 부서 ID 필터를 설정합니다.
       * - 필터 변경 시 페이지는 1로 되돌립니다.
       */
      setDepartment(deptId: number | null): void {
        this.departmentId = deptId
        this.currentPage = 1
      },

      setScoreSort(sort: 'DESC' | 'ASC'): void {
        this.scoreSort = sort
        this.currentPage = 1
      },

      setMonth(month: string): void {
        this.month = month
        this.currentPage = 1
      },

      /**
       * 근태 점수 대시보드 목록을 조회합니다.
       * - 드롭다운 용도 (페이지 데이터에 종속되지 않음)
       */

      /** ✅ 부서 옵션 조회 */
      async fetchDepartmentOptions(): Promise<void> {
        this.deptLoading = true
        try {
          const response = await apiClient.get<DepartmentOptionDTO[]>('/departments')
          this.departmentOptions = Array.isArray(response.data) ? response.data : []
        } catch (error) {
          console.error('부서 옵션 조회 실패:', error)
          this.departmentOptions = []
        } finally {
          this.deptLoading = false
        }
      },

      /**
     * 근태 점수 대시보드 목록을 조회합니다.
     * - 부서/월/정렬 필터를 함께 전달
     *
     * @param {number} page - 조회할 페이지 번호 (기본값: 1, 프론트 기준)
     */
      async fetchDashboard(page = 1): Promise<void> {
        this.loading = true
        this.currentPage = page

        try {
          const params: Record<string, unknown> = {
            page,
            size: this.pageSize,
            scoreSort: this.scoreSort,
            month: this.month,
          }

          // 값이 있을 때만 파라미터로 전달 (백엔드 @RequestParam(required = false) 와 대응)
          if (this.departmentId != null) {
            params.departmentId = this.departmentId
          }

          const response = await apiClient.get<AttendanceDashboardPage>(
            '/attendance/dashboard',
            { params },
          )

          const data = response.data

          this.dashboardList = data.content ?? []

          // 백엔드 PageResponse.page 가 0-based 인 경우 → +1
          // 1-based 로 내려오면 아래 한 줄을 `this.currentPage = data.page;` 로 바꿔주세요.
          this.currentPage = typeof data.page === 'number' ? data.page + 1 : page
          this.totalCount = data.totalElements ?? 0
          this.totalPages = data.totalPages ?? 0
        } catch (error) {
          console.error('근태 점수 대시보드 조회 실패:', error)
        } finally {
          this.loading = false
        } 
      },
      /**
       * 근태 점수 대시보드 상단 요약(전체/우수/위험)을 조회합니다.
       * - 부서/기간 필터(departmentId, startDate, endDate)가 설정되어 있으면 함께 전달
       */
      async fetchDashboardSummary(): Promise<void> {
        try {
          const params: Record<string, unknown> = {
            month: this.month,
          }

          if (this.departmentId != null) {
            params.departmentId = this.departmentId
          }

          const response = await apiClient.get<AttendanceDashboardSummaryDTO>(
            '/attendance/dashboard/summary',
            { params },
          )

          this.summary = response.data ?? {
            totalEmployees: 0,
            excellentEmployees: 0,
            riskyEmployees: 0,
          }
        } catch (error) {
          console.error('근태 대시보드 요약 조회 실패:', error)
          this.summary = {
            totalEmployees: 0,
            excellentEmployees: 0,
            riskyEmployees: 0,
          }
        }
      },

      async refreshDashboard(page = 1): Promise<void> {
        await Promise.all([
          this.fetchDashboard(page), 
          this.fetchDashboardSummary(),
          this.departmentOptions.length === 0
            ? this.fetchDepartmentOptions()
            : Promise.resolve(),
        ])
      },
    },
  },
)
