/**
 * <pre>
 * API Name        : inbox.api.ts
 * Description     : 결재 문서함 조회 API 함수
 *
 * 주요 함수
 *   - getInboxDocuments: 문서함 문서 목록 조회 (탭별 필터링, 검색 지원)
 *
 * History
 *   2025/12/26 (민철) 최초 작성
 *   2025/12/29 (민철) 전체 검색 기능 개선
 * </pre>
 *
 * @author 민철
 * @version 2.0
 */

import apiClient from '@/api/apiClient';
import type { PageResponse } from '@/types/common/pagination.types';
import type { DocumentsResponseDTO, InboxSearchParams } from '@/types/approval/inbox.types';

/**
 * 문서함 문서 목록 조회
 * @param {InboxSearchParams} params - 조회 파라미터 (탭, 페이지, 검색조건 등)
 * @returns {Promise<PageResponse<DocumentsResponseDTO>>} 페이징 처리된 문서 목록
 */
export const getInboxDocuments = async (
    params: InboxSearchParams
): Promise<PageResponse<DocumentsResponseDTO>> => {
    const response = await apiClient.get<PageResponse<DocumentsResponseDTO>>(
        '/approval/inbox/documents',
        { params }
    );

    return response.data;
};