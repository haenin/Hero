/**
 * <pre>
 * API Name        : approval_action_api.ts
 * Description     : 결재 처리 API 함수
 *
 * 주요 함수
 *   - processApproval: 결재 승인/반려 처리
 *
 * History
 *   2025/12/26 (민철) 최초 작성
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

import apiClient from '@/api/apiClient';
import type {
    ApprovalActionRequestDTO,
    ApprovalActionResponseDTO
} from '@/types/approval/approval_action.types';

/**
 * 결재 승인/반려 처리
 * @param {ApprovalActionRequestDTO} data - 결재 처리 요청 데이터
 * @returns {Promise<ApprovalActionResponseDTO>} 처리 결과
 */
export const processApproval = async (
    data: ApprovalActionRequestDTO
): Promise<ApprovalActionResponseDTO> => {
    const response = await apiClient.post<ApprovalActionResponseDTO>(
        '/approval/process',
        data
    );

    return response.data;
};