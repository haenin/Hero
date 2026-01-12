/**
 * (File => TypeScript) Name   : departmentVacation.ts
 * Description : 부서 휴가 캘린더 Pinia 스토어
 *               - 부서 휴가 일정 조회 및 상태 관리
 *               - JWT에서 employeeId 추출해 myEmployeeId 보관 (본인/팀원 구분용)
 *
 * History
 * 2025/12/26 - 이지윤 최초 작성
 * 2026/01/01 - 이지윤 type 분리
 *
 * @author 이지윤
 * @version 1.1
 */

import { defineStore } from 'pinia';
import apiClient from '@/api/apiClient';
import { useAuthStore } from '@/stores/auth';

import type {
  DepartmentVacationDTO,
  DepartmentVacationState,
} from '@/types/vacation/departmentVacation.types'
import { extractEmployeeIdFromToken } from '@/types/vacation/jwt'



/**
 * 부서 휴가 캘린더 Pinia 스토어
 * - 부서 휴가 일정 조회 및 상태 관리
 * - 현재 로그인한 직원 ID 보관 (본인/팀원 구분용)
 */
export const useDepartmentVacationStore = defineStore('departmentVacation', {
  state: (): DepartmentVacationState => ({
    items: [],
    loading: false,
    errorMessage: null,
    departmentId: null,
    myEmployeeId: null,
  }),

  actions: {
    /**
     * 부서 ID를 설정합니다.
     *
     * @param {number | null} departmentId - 부서 ID, null이면 필터 미적용
     */
    setDepartmentId(departmentId: number | null): void {
      this.departmentId = departmentId;
    },

    /**
     * 현재 로그인한 직원 ID를 직접 세팅합니다.
     * - 일반적으로는 syncMyEmployeeIdFromToken을 통해 토큰에서 자동 추출
     *
     * @param {number | null} employeeId - 직원 ID, null이면 미설정
     */
    setMyEmployeeId(employeeId: number | null): void {
      this.myEmployeeId = employeeId;
    },

    /**
     * authStore.accessToken(JWT)에서 employeeId를 추출해 myEmployeeId에 반영합니다.
     * - 토큰이 없거나 payload에 값이 없으면 null 처리
     */
    syncMyEmployeeIdFromToken(): void {
      const authStore = useAuthStore();
      const token = authStore.accessToken;

      if (!token) {
        this.myEmployeeId = null;
        return;
      }

      this.myEmployeeId = extractEmployeeIdFromToken(token);
    },

    /**
     * 부서 휴가 캘린더 데이터를 조회합니다.
     *
     * - year : 조회 연도
     * - month: 조회 월(1~12 또는 백엔드 규약에 맞춤)
     *
     * @param {number} year  - 조회 연도
     * @param {number} month - 조회 월
     * @returns {Promise<void>} 조회 완료 후 상태 업데이트
     */
    async fetchDepartmentVacation(year: number, month: number): Promise<void> {
      // 본인 식별값을 토큰에서 자동 동기화 (페이지에서 따로 setMyEmployeeId 호출 불필요)
      if (this.myEmployeeId == null) {
        this.syncMyEmployeeIdFromToken();
      }

      this.loading = true;
      this.errorMessage = null;

      try {
        const params: Record<string, unknown> = { year, month };

        // (현재 정책상 사용 안 함) 필요하면 다시 활성화
        // if (this.departmentId != null) params.departmentId = this.departmentId;

        const response = await apiClient.get<DepartmentVacationDTO[]>(
          '/vacation/department/calendar',
          { params },
        );

        this.items = response.data;
      } catch (error) {
        this.errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to load department vacation calendar.';
        // TODO: 필요 시 에러 상태를 별도 필드로 분리해 UI에서 세분화된 처리 가능
        console.error('부서 휴가 캘린더 조회 실패:', error);
      } finally {
        this.loading = false;
      }
    },
  },
});
