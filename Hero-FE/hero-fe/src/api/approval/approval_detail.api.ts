/**
 * <pre>
 * API Name        : approval_detail_api.ts
 * Description     : 결재 문서 상세 조회 API 함수
 *
 * 주요 함수
 *   - getDocumentDetail: 문서 상세 정보 조회
 *
 * History
 *   2025/12/26 (민철) 최초 작성
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

import apiClient from '@/api/apiClient';
import type { ApprovalDocumentDetailResponseDTO } from '@/types/approval/approval_detail.types';

/**
 * 문서 상세 정보 조회
 * @param {number} docId - 문서 ID
 * @returns {Promise<ApprovalDocumentDetailResponseDTO>} 문서 상세 정보
 */
export const getDocumentDetail = async (
    docId: number
): Promise<ApprovalDocumentDetailResponseDTO> => {
    const response = await apiClient.get<ApprovalDocumentDetailResponseDTO>(
        `/approval/documents/${docId}`
    );

    return response.data;
};