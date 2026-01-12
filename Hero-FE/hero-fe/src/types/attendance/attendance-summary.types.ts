/**
 * <pre>
 * TypeScript Name : attendance-summary.types.ts
 * Description     : 근태 도메인 상단 요약 카드 타입 정의
 *                   - 백엔드 PersonalSummaryDTO와 필드 매핑
 *
 * History
 *   2026/01/01 (지윤) 근태 상단 요약 카드 타입 최초 작성
 * </pre>
 *
 * @author 이지윤
 * @version 1.0
 */

/**
 * 개인 근태 상단 요약 카드 DTO
 * - PersonalSummaryDTO 매핑
 */
export interface PersonalSummaryDTO {
  /** 이번 달 근무일 수 */
  workDays: number;
  /** 오늘 적용 근무제 이름 */
  todayWorkSystemName: string;
  /** 이번 달 지각 횟수 */
  lateCount: number;
  /** 이번 달 결근 횟수 */
  absentCount: number;
  /** 이번 달 조퇴 횟수 */
  earlyCount: number;
}
