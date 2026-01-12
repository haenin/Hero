/**
 * TypeScript Name   : deptWorkSystem.ts
 * Description : 부서 근태 현황(DeptWorkSystem) 도메인 Pinia 스토어
 *               - 부서별 근태 현황 리스트 관리
 *               - 페이지네이션 및 날짜/부서 필터링
 *               - Spring Data Page 응답 구조(SpringPage<T>) 매핑
 *
 * History
 * 2025/12/17(이지윤) 최초 작성
 * 2025/12/19(이지윤) workDate 필드 추가 및 기본 날짜 처리 로직 보강
 *
 * @author 이지윤
 * @version 1.1
 */

import { defineStore } from 'pinia';

import apiClient from '@/api/apiClient';

/**
 * 부서 근태 현황 한 행(row)에 대한 DTO
 * - 백엔드 DeptWorkSystemDTO와 필드명을 맞춰둡니다.
 *
 * - workDate       : 근무일자 (yyyy-MM-dd)
 * - employeeId     : 사원 ID
 * - departmentId   : 부서 ID
 * - employeeName   : 사원명
 * - state          : 근태 상태 (정상 / 지각 / 결근 등)
 * - jobTitle       : 직책(직급)
 * - workSystemName : 근무제 이름
 * - startTime      : 출근 시간 (HH:mm:ss)
 * - endTime        : 퇴근 시간 (HH:mm:ss)
 */
export interface DeptWorkSystemRowDTO {
  workDate: string;
  employeeId: number;
  departmentId: number;
  employeeName: string;
  state: string;
  jobTitle: string;
  workSystemName: string;
  startTime: string;
  endTime: string;
}

/**
 * Spring Data Page 응답 형태
 * - 현재 /api/attendance/DeptWorkSystem 가 반환하는 JSON 구조에 맞춤
 */
export interface SpringPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * 부서 근태 현황 스토어 상태 타입
 */
interface DeptWorkSystemState {
  /** 테이블에 렌더링할 행 데이터 */
  rows: DeptWorkSystemRowDTO[];

  /** 페이징 정보 */
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;

  /** 필터 값들 */
  departmentId: number | null;
  /** 조회 날짜 (yyyy-MM-dd 형식) */
  workDate: string;

  /** 로딩 상태 */
  loading: boolean;
}

/**
 * 부서 근태 현황(DeptWorkSystem) Pinia 스토어
 * - 리스트 + 페이지네이션 + 날짜/부서 필터 관리
 */
export const useDeptWorkSystemStore = defineStore('deptWorkSystem', {
  state: (): DeptWorkSystemState => ({
    rows: [],

    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0,

    departmentId: null,
    workDate: '', // 실제 조회 전까지는 비워두고, 첫 조회 시 today로 보정

    loading: false,
  }),

  actions: {
    /**
     * 필터 설정 (부서 + 날짜)
     *
     * @param {number | null} departmentId - 부서 ID, null이면 부서 필터 미적용
     * @param {string} workDate            - 근태 조회 날짜(yyyy-MM-dd)
     */
    setFilters(departmentId: number | null, workDate: string): void {
      this.departmentId = departmentId;
      this.workDate = workDate;
    },

    /**
     * 페이지 크기 변경 (필요 시 사용)
     *
     * @param {number} size - 페이지당 건수
     */
    setPageSize(size: number): void {
      this.pageSize = size;
    },

    /**
     * 부서 근태 현황 조회
     *
     * - page: 1 기반 페이지 번호
     * - departmentId / workDate가 설정되어 있으면 쿼리 파라미터로 함께 전송
     *
     * @param {number} [page=1] - 조회할 페이지 번호 (1부터 시작)
     * @returns {Promise<void>} 조회 완료 후 상태 반영
     */
      async fetchDeptWorkSystem(page = 1): Promise<void> {
        this.loading = true;

        try {
          if (!this.workDate) {
            const today = new Date();
            this.workDate = today.toISOString().slice(0, 10);
          }

          // ✅ 1-based → 0-based 변환
          const zeroBasedPage = Math.max(page - 1, 0);

          const params: Record<string, unknown> = {
            page: zeroBasedPage,
            size: this.pageSize,
            workDate: this.workDate,
          };

          if (this.departmentId != null) {
            params.departmentId = this.departmentId;
          }

          const { data } = await apiClient.get<SpringPage<DeptWorkSystemRowDTO>>(
            '/attendance/deptworksystem',
            { params },
          );

          this.rows = data.content;

          // ✅ 응답의 page(0-based)를 화면용 1-based로 변환
          this.currentPage = (data.page ?? 0) + 1;
          this.pageSize = data.size;
          this.totalPages = data.totalPages;
          this.totalElements = data.totalElements;
        } catch (error) {
          console.error('부서 근태 현황 조회 실패:', error);
        } finally {
          this.loading = false;
        }
      },

    /**
     * 필터 초기화 + 1페이지 재조회
     * - departmentId는 그대로 두고, workDate만 오늘 날짜로 리셋하는 용도도 가능
     *
     * @param {boolean} resetDepartmentId true면 부서도 함께 초기화
     */
    async resetFilters(resetDepartmentId = false): Promise<void> {
      if (resetDepartmentId) {
        this.departmentId = null;
      }

      // workDate 기본값: 오늘
      const today = new Date();
      this.workDate = today.toISOString().slice(0, 10);

      await this.fetchDeptWorkSystem(1);
    },
  },
});
