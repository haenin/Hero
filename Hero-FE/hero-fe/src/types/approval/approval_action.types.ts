/**
 * <pre>
 * TypeScript Name: approval_action_types.ts
 * Description: 결재 처리 타입 정의
 *
 * 주요 타입:
 * - ApprovalActionRequestDTO: 결재 처리 요청 DTO
 * - ApprovalActionResponseDTO: 결재 처리 응답 DTO
 * - ApprovalActionType: 결재 액션 타입
 *
 * History
 * 2025/12/26 (민철) 최초 작성
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

/**
 * 결재 액션 타입
 */
export type ApprovalActionType = 'APPROVE' | 'REJECT';

/**
 * 결재 처리 요청 DTO
 * @description 결재자가 승인/반려 처리할 때 사용
 * @property {number} docId:         문서 ID
 * @property {number} lineId:        결재선 ID
 * @property {ApprovalActionType} action: 액션 타입 (APPROVE/REJECT)
 * @property {string} comment:       반려 사유 (반려 시 필수)
 */
export interface ApprovalActionRequestDTO {
    docId: number;
    lineId: number;
    action: ApprovalActionType;
    comment?: string;
}

/**
 * 결재 처리 응답 DTO
 * @description 결재 처리 결과
 * @property {boolean} success:      성공 여부
 * @property {string} message:       처리 결과 메시지
 * @property {string} docStatus:     변경된 문서 상태
 */
export interface ApprovalActionResponseDTO {
    success: boolean;
    message: string;
    docStatus: string;
}