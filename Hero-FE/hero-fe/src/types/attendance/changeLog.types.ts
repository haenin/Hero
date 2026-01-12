/**
 * <pre>
 * TypeScript Name : attendance-change-log.types.ts
 * Description     : 근무제 변경(Change Log) 이력 도메인 타입 정의
 *                   - 근무제 변경 이력 DTO
 *                   - 상단 요약 카드 타입(PersonalSummaryDTO) 확장 스토어 상태 타입
 *
 * History
 *   2026/01/01 (이지윤) 근무제 변경 이력 타입 최초 작성
 * </pre>
 *
 * @author 이지윤
 * @version 1.0
 */

import type { PersonalSummaryDTO } from '@/types/attendance/attendance-summary.types';

/**
 * 근무제 변경 이력 한 건에 대한 DTO
 * - 백엔드 ChangeLogDTO 와 필드명을 camelCase 기준으로 매핑
 */
export interface ChangeLogDTO {
  /** 변경 이력 PK */
  workSystemChangeLogId: number;
  /** 변경 날짜 (yyyy-MM-dd) */
  date: string;
  /** 근무제 변경 사유 */
  changeReason: string;
  /** 출근 시간 (HH:mm:ss) */
  startTime: string;
  /** 퇴근 시간 (HH:mm:ss) */
  endTime: string;
  /** 근무제 이름(템플릿 이름) */
  workSystemName: string;
}

/**
 * 근무제 변경 이력(ChangeLog) 스토어 상태 타입
 * - 상단 요약 카드 정보는 PersonalSummaryDTO 를 확장하여 사용
 */
export interface ChangeLogState extends PersonalSummaryDTO {
  /** 근무제 변경 이력 목록 */
  changeLogList: ChangeLogDTO[];

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
