/**
 * <pre>
 * TypeScript Name : vacation-summary.types.ts
 * Description     : 휴가 요약(VacationSummary) 도메인 타입 정의
 *                   - 개인 연차 요약 DTO
 *                   - 휴가 요약 스토어 상태 타입
 *
 * History
 *   2026/01/01 (이지윤) 휴가 요약 타입 최초 작성
 * </pre>
 *
 * @author 이지윤
 * @version 1.0
 */

/**
 * 휴가 요약 정보 DTO
 * - 백엔드 VacationSummaryDTO 와 필드명을 매칭
 */
export interface VacationSummaryDTO {
  /** 연차 ID (PK, 없을 수 있으면 null) */
  leaveId: number | null;

  /** 부여된 연차 일수 */
  grantDays: number;

  /** 사용한 연차 일수 */
  usedDays: number;

  /** 남은 연차 일수 */
  remainingDays: number;
}

/**
 * 휴가 요약(VacationSummary) 스토어 상태 타입
 * - 단일 요약 데이터 + 로딩 상태 관리
 */
export interface VacationSummaryState {
  /** 휴가 요약 데이터 (없으면 null) */
  summary: VacationSummaryDTO | null;

  /** 조회 중 여부 */
  loading: boolean;
}
