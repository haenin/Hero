/**
 * <pre>
 * TypeScript Name : attendance-overtime.types.ts
 * Description     : 근태 도메인 - 초과 근무(Overtime) 타입 정의
 *                   - 초과 근무 단건 DTO
 *                   - 초과 근무 스토어 상태 타입
 *                   - 상단 요약 카드 타입(PersonalSummaryDTO) 상속
 *
 * History
 *   2026/01/01 (이지윤) 초과 근무 타입 정의 최초 작성
 * </pre>
 *
 * @author 이지윤
 * @version 1.0
 */

import type { PersonalSummaryDTO } from '@/types/attendance/attendance-summary.types';

/**
 * 초과 근무 한 건에 대한 DTO
 * - 백엔드 OvertimeDTO(JSON)과 필드명을 camelCase 기준으로 매칭
 */
export interface OvertimeDTO {
  /** 초과 근무 PK */
  overtimeId: number;
  /** 초과 근무 날짜(yyyy-MM-dd) */
  date: string;
  /** 초과 근무 시작 시간(HH:mm:ss) */
  startTime: string;
  /** 초과 근무 종료 시간(HH:mm:ss) */
  endTime: string;
  /** 초과 근무 시간(시간 단위) */
  overtimeHours: number;
  /** 초과 근무 사유 */
  reason: string;
}

/**
 * 초과 근무(Overtime) 스토어 내부 상태 타입
 * - 상단 요약 카드는 PersonalSummaryDTO를 상속받아 공통으로 사용
 */
export interface OvertimeState extends PersonalSummaryDTO {
  /** 초과 근무 이력 리스트 */
  overtimeList: OvertimeDTO[];
  /** 현재 페이지 번호(1 기반) */
  currentPage: number;
  /** 페이지당 조회 건수 */
  pageSize: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 전체 데이터 건수 */
  totalCount: number;
  /** 로딩 상태 */
  loading: boolean;
  /** 기간 필터 - 시작일(yyyy-MM-dd) */
  startDate: string;
  /** 기간 필터 - 종료일(yyyy-MM-dd) */
  endDate: string;
}
