/**
 * <pre>
 * TypeScript Name : attendance-dashboard.types.ts
 * Description     : 근태 대시보드(Attendance Dashboard) 도메인 타입 정의
 *                   - 점수 정렬 타입(ScoreSort)
 *                   - 근태 대시보드 행 DTO
 *                   - 상단 요약 카드 DTO
 *                   - 부서 선택 옵션 DTO
 *                   - 대시보드 스토어 상태 타입
 *                   - PageResponse 별칭 타입
 *
 * History
 *   2026/01/01 (이지윤) 근태 대시보드 타입 최초 작성
 * </pre>
 *
 * @author 이지윤
 * @version 1.0
 */

import type { PageResponse } from '@/types/common/pagination.types';

/**
 * 점수 정렬 타입
 * - DESC : 점수 높은 순
 * - ASC  : 점수 낮은 순
 */
export type ScoreSort = 'DESC' | 'ASC';

/**
 * 근태 대시보드 한 행에 대한 DTO
 * - 백엔드 AttendanceDashboardDTO 와 1:1 매핑
 */
export interface AttendanceDashboardDTO {
  /** 직원 ID (PK) */
  employeeId: number;
  /** 사번 */
  employeeNumber: string;
  /** 직원 이름 */
  employeeName: string;
  /** 부서 ID */
  departmentId: number;
  /** 부서명 */
  departmentName: string;
  /** 지각 횟수 */
  tardyCount: number;
  /** 결근 횟수 */
  absenceCount: number;
  /** 근태 점수 (100 - 지각/결근 패널티) */
  score: number;
}

/**
 * 근태 대시보드 상단 요약 카드용 DTO
 * - 백엔드 /attendance/dashboard/summary 응답과 매핑
 */
export interface AttendanceDashboardSummaryDTO {
  /** 전체 직원 수 */
  totalEmployees: number;
  /** 우수 직원 수 (예: 95점 이상) */
  excellentEmployees: number;
  /** 위험 직원 수 (예: 85점 이하) */
  riskyEmployees: number;
}

/**
 * 부서 선택 드롭다운 옵션 DTO
 * - 대시보드 필터 영역에서 사용
 */
export interface DepartmentOptionDTO {
  /** 부서 ID */
  departmentId: number;
  /** 부서명 */
  departmentName: string;
}

/**
 * 근태 대시보드 스토어 상태 타입
 */
export interface AttendanceDashboardState {
  /** 대시보드 테이블 데이터 목록 */
  dashboardList: AttendanceDashboardDTO[];

  /** 현재 페이지 번호(1 기반) */
  currentPage: number;
  /** 페이지당 조회 건수 */
  pageSize: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 전체 데이터 건수 */
  totalCount: number;

  /** 대시보드 데이터 로딩 여부 */
  loading: boolean;

  /** 부서 필터 (선택된 부서 ID, null 이면 전체) */
  departmentId: number | null;
  /** 점수 정렬 기준 (ASC/DESC) */
  scoreSort: ScoreSort;
  /** 기준 월 (yyyy-MM 형식 문자열, 예: '2025-12') */
  month: string;

  /** 부서 선택 옵션 목록 */
  departmentOptions: DepartmentOptionDTO[];
  /** 부서 옵션 로딩 여부 */
  deptLoading: boolean;

  /** 상단 요약 카드 데이터 */
  summary: AttendanceDashboardSummaryDTO;
}

/**
 * 근태 대시보드 Page 응답 타입 별칭
 * - PageResponse<AttendanceDashboardDTO> 가 길어지는 것을 방지하기 위한 alias
 */
export type AttendanceDashboardPage = PageResponse<AttendanceDashboardDTO>;
