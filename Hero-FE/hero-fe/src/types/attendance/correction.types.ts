/**
 * <pre>
 * TypeScript Name : attendance-correction.types.ts
 * Description     : 근태 수정(Correction) 이력 도메인 타입 정의
 *                   - 근태 수정 이력 DTO
 *                   - 상단 요약 카드 타입(PersonalSummaryDTO) 확장 스토어 상태 타입
 *
 * History
 *   2026/01/01 (이지윤) 근태 수정 이력 타입 최초 작성
 * </pre>
 *
 * @author 이지윤
 * @version 1.0
 */

import type { PersonalSummaryDTO } from '@/types/attendance/attendance-summary.types';

/**
 * 근태 수정 이력 한 건에 대한 DTO
 * - 백엔드 CorrectionDTO(JSON) 필드명과 매핑
 * - 프론트에서는 camelCase 기준으로 사용
 */
export interface CorrectionDTO {
  /** 정정 요청 PK */
  correctionId: number;
  /** 대상 날짜 (target_date) */
  date: string;
  /** 수정 전 출근 시간 (att.start_time) */
  prevStartTime: string;
  /** 수정 전 퇴근 시간 (att.end_time) */
  prevEndTime: string;
  /** 수정 후 출근 시간 (cor.corrected_start) */
  newStartTime: string;
  /** 수정 후 퇴근 시간 (cor.corrected_end) */
  newEndTime: string;
  /** 정정 사유 */
  reason: string;
}

/**
 * 근태 수정 이력(Correction) 스토어 상태 타입
 * - 상단 요약 카드 정보는 PersonalSummaryDTO 를 확장하여 사용
 */
export interface CorrectionState extends PersonalSummaryDTO {
  /** 근태 수정 이력 목록 */
  correctionList: CorrectionDTO[];

  /** 현재 페이지 번호(1 기반) */
  currentPage: number;
  /** 페이지당 조회 건수 */
  pageSize: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 전체 건수 */
  totalCount: number;

  /** API 호출 로딩 플래그 */
  loading: boolean;

  /** 조회 시작일 (yyyy-MM-dd, 빈 문자열이면 미필터) */
  startDate: string;
  /** 조회 종료일 (yyyy-MM-dd, 빈 문자열이면 미필터) */
  endDate: string;
}
