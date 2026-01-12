/**
 * <pre>
 * File Name   : evaluation.types.ts
 * Description : 평가 관련 타입 정의
 *
 * History
 * 2025/01/02 - 최초 작성
 * </pre>
 */

// 평가 이력 목록 응답 DTO
export interface EmployeeEvaluationListResponseDTO {
  evaluationId: number;
  evaluationName: string;
  totalRank: string;
  createdAt: string;
}
