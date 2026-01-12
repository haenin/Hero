/**
 * (File => TypeScript) Name   : attendanceEmployeeDashboard.ts
 * Description : 직원 반기(상/하반기) 근태 대시보드 Drawer Pinia 스토어
 *               - 특정 직원의 반기 근태 요약(총 근무일, 지각, 결근) 조회
 *               - 월별 근태 통계(월별 근무일/지각/결근) 조회
 *               - Drawer 열림 상태, 연도/반기(H1/H2) 필터 및 에러 상태 관리
 *
 * History
 * 2025/12/26 - 이지윤 최초 작성
 * 2026/01/01 - 이지윤 type 분리
 *
 * @author 이지윤
 * @version 1.2
 */

import type { AxiosError } from 'axios'
import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'
import type {
  AttendanceEmployeeHalfDashboardDTO,
  AttendanceEmployeeDashboardState,
  AttendanceHalfType,
} from '@/types/attendance/attendanceEmployeeDashboard.types'

/**
 * 직원 반기 근태 대시보드 Pinia 스토어
 * - 직원별 반기 근태 요약/월별 통계 조회
 * - Drawer 열림 상태 및 연도/반기 필터 관리
 */
export const useAttendanceEmployeeDashboardStore = defineStore(
  'attendanceEmployeeDashboard',
  {
    state: (): AttendanceEmployeeDashboardState  => ({
      open: false,
      loading: false,
      errorMessage: null,

      selectedEmployeeId: null,
      year: new Date().getFullYear(),
      half: 'H1',

      dashboard: null,
    }),

    actions: {
      /**
       * Drawer 열림/닫힘 상태를 설정합니다.
       *
       * @param {boolean} value - true: 열기, false: 닫기
   ****************************************
   * @param → 함수의 인자(Parameter)
   ****************************************
       */
      setOpen(value: boolean): void {
        this.open = value;
        // 닫을 때 데이터까지 정리하고 싶으면 아래 주석 해제
        // if (!value) this.dashboard = null;
      },

      /**
       * 반기(H1/H2)를 설정합니다.
       *
       * @param {AttendanceHalfType} half - 'H1' 또는 'H2'
       */
      setHalf(half: AttendanceHalfType): void {
        this.half = half;
      },

      /**
       * 연도를 설정합니다.
       *
       * @param {number} year - 기준 연도 (예: 2025)
       */
      setYear(year: number): void {
        this.year = year;
      },

      /**
       * Drawer 상태 및 선택 정보, 대시보드 데이터를 초기화합니다.
       * - 연도는 현재 연도로 초기화
       * - 반기는 기본값 'H1'로 초기화
       */
      reset(): void {
        this.open = false;
        this.loading = false;
        this.errorMessage = null;
        this.selectedEmployeeId = null;
        this.dashboard = null;
        this.year = new Date().getFullYear();
        this.half = 'H1';
      },

      /**
       * 직원 반기 근태 대시보드를 조회합니다.
       *
       * - employeeId: 대상 직원 ID
       * - year/half  : 전달되지 않으면 현재 스토어 상태값(this.year, this.half)을 사용
       *
       * 예시 엔드포인트:
       *   GET /api/attendance/dashboard/employee?employeeId=1&year=2025&half=H1
       *
       * @param {number} employeeId - 조회할 직원 ID
       * @param {number} [year] - 조회 연도 (생략 시 this.year 사용)
       * @param {AttendanceHalfType} [half] - 조회 반기(생략 시 this.half 사용)
       * @returns {Promise<void>} 조회 완료 후 상태 갱신
       */
      async fetchEmployeeHalfDashboard(
        employeeId: number,
        year?: number,
        half?: AttendanceHalfType,
      ): Promise<void> {
        const finalYear = year ?? this.year;
        const finalHalf = half ?? this.half;

        this.loading = true;
        this.errorMessage = null;
        this.selectedEmployeeId = employeeId;

        try {
          const { data } =
            await apiClient.get<AttendanceEmployeeHalfDashboardDTO>(
              '/attendance/dashboard/employee',
              {
                params: {
                  employeeId,
                  year: finalYear,
                  half: finalHalf,
                },
              },
            );

          this.dashboard = data;
          this.year = data.year;
          this.half = data.half;
          this.open = true;
        } catch (e) {
          const err = e as AxiosError;

          this.errorMessage =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((err.response?.data as any)?.message as string | undefined) ??
            err.message ??
            '직원 상세 근태 조회 실패';

          this.dashboard = null;

          // 실패해도 Drawer는 열고 에러 메시지를 표시하는 UX라면 true 유지
          this.open = true;
        } finally {
          this.loading = false;
        }
      },
    },
  },
);
