/**
 * Typescript Name   : vacationSummary.ts
 * Description : 휴가 요약(VacationSummary) 도메인 Pinia 스토어
 *               - 상단 요약 카드(총 연차 / 사용 연차 / 남은 연차 / 소멸 예정) 데이터 관리
 *               - 백엔드 /api/vacation/summary 엔드포인트와 연동
 *
 * History
 * 2025/12/21 (이지윤) 최초 작성
 * 2026/01/01 - 이지윤 type 분리
 *
 * @author 이지윤
 * @version 1.1
 */

import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

import type { VacationSummaryDTO, VacationSummaryState } from '@/types/vacation/vacationSummary.types'

/**
 * 휴가 요약(VacationSummary) 도메인 Pinia 스토어
 * - 상단 요약 카드에서 사용하는 값들을 관리
 * - /api/vacation/summary 호출로 백엔드와 연동
 */
export const useVacationSummaryStore = defineStore('vacationSummary', {
  state: (): VacationSummaryState => ({
    summary: null,
    loading: false,
  }),

  getters: {
    /**
     * 총 연차
     */
    totalAnnualLeave: (state): number => {
      return state.summary?.grantDays ?? 0;
    },

    /**
     * 사용 연차
     */
    usedLeave: (state): number => {
      return state.summary?.usedDays ?? 0;
    },

    /**
     * 남은 연차
     */
    remainingLeave: (state): number => {
      return state.summary?.remainingDays ?? 0;
    },

    /**
     * 소멸 예정 연차
     * - 현재 DB 컬럼이 없으므로 임시로 0 리턴
     * - 추후 컬럼/필드 추가 시 summary에서 계산하거나 그대로 매핑
     */
    expiringLeave: (): number => {
      return 0;
    },
  },

  actions: {
    /**
     * 휴가 요약 정보를 서버에서 조회합니다.
     *
     * - 백엔드 컨트롤러: GET /api/vacation/summary
     * - 인증된 사용자(토큰)의 employeeId 기준으로 조회
     *
     * @returns {Promise<void>} 조회 완료 후 상태 갱신
     */
    async fetchVacationSummary(): Promise<void> {
      this.loading = true;

      try {
        const response = await apiClient.get<VacationSummaryDTO>('/vacation/summary');

        // 서버에서 null을 주는 경우도 대비
        this.summary = response.data ?? null;
      } catch (error) {
        console.error('휴가 요약 정보 조회 실패:', error);
        this.summary = null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * (옵션) 요약 정보를 초기화합니다.
     */
    resetSummary(): void {
      this.summary = null;
    },
  },
});
