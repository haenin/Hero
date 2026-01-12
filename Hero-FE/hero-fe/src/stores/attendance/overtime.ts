/**
 * TypeScript Name   : overtime.ts
 * Description : 초과 근무(Overtime) 도메인 Pinia 스토어
 *               - 초과 근무 이력 리스트 + 페이지네이션 + 기간 필터 상태 관리
 *
 * History
 * 2025/12/10 - 이지윤 최초 작성
 * 2026/01/01 - 이지윤 type 분리
 *
 * @author 이지윤
 * @version 1.1
 */

import { defineStore } from 'pinia';
import apiClient from '@/api/apiClient';
import type { OvertimeDTO, OvertimeState } from '@/types/attendance/overtime.types';
import type { PersonalSummaryDTO } from '@/types/attendance/attendance-summary.types'
import type { PageResponse } from '@/types/common/pagination.types' 


/**
 * 초과 근무(Overtime) 도메인 Pinia 스토어
 * - 리스트 + 페이지네이션 + 기간 필터 관리
 */
export const useOvertimeStore = defineStore('overtimeStore', {
  state: (): OvertimeState => ({
    overtimeList: [],
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,
    loading: false,
    startDate: '',
    endDate: '',

    // 상단 요약 카드 (초기값)
    workDays: 0,
    todayWorkSystemName: '',
    lateCount: 0,
    absentCount: 0,
    earlyCount: 0,
  }),

  actions: {
    /**
     * 조회 기간 필터(시작일/종료일)를 설정합니다.
     *
     * @param {string} start - 조회 시작일 (YYYY-MM-DD), 빈 문자열이면 필터 미적용
     * @param {string} end - 조회 종료일 (YYYY-MM-DD), 빈 문자열이면 필터 미적용
     ****************************************
     * @param → 함수의 인자(Parameter)
     ****************************************
     */
    setFilterDates(start: string, end: string): void {
      this.startDate = start;
      this.endDate = end;
    },

    /**
     * 초과 근무 이력을 조회합니다. (서버 페이지네이션)
     * - page: 조회할 페이지 번호 (1부터 시작)
     * - this.startDate / this.endDate 가 설정되어 있으면 함께 전송됩니다.
     *
     * @param {number} [page=1] - 조회할 페이지 번호
     * @returns {Promise<void>} API 호출 완료 후 상태 업데이트
     */
    async fetchOvertime(page = 1): Promise<void> {
      this.loading = true;
      this.currentPage = page;

      try {
        const response = await apiClient.get<PageResponse<OvertimeDTO>>(
          '/attendance/overtime',
          {
            params: {
              page,
              size: this.pageSize,
              startDate: this.startDate || undefined,
              endDate: this.endDate || undefined,
            },
          },
        );

        const data = response.data;

        this.overtimeList = data.content;
        this.currentPage = data.page + 1;
        this.pageSize = data.size;
        this.totalCount = data.totalElements ?? 0;
        this.totalPages = data.totalPages;
      } catch (error) {
        // TODO: 필요 시 에러 상태 필드(errorMessage 등)를 추가하여 UI와 연동
        console.error('초과 근무 이력 조회 실패:', error);
      } finally {
        this.loading = false;
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
  },
});
