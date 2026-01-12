/**
 * <pre>
 * API Name        : approval_request.api.ts
 * Description     : 결재 문서 작성/상신 API 함수
 *
 * 주요 함수
 * - saveDraft: 결재 문서 임시저장
 * - submitDocument: 결재 문서 상신
 * - updateDraft: 임시저장 문서 수정
 *
 * History
 * 2025/12/26 (민철) 최초 작성
 * 2025/12/31 (민철) 임시저장 문서 수정 api 호출 함수
 * </pre>
 *
 * @author 민철
 * @version 1.1
 */

import apiClient from '@/api/apiClient';
import {
    ApprovalDocumentRequestDTO,
    ApprovalDocumentResponseDTO
} from '@/types/approval/approval_request.types';

/**
 * 결재 문서 임시저장
 * @param {ApprovalDocumentRequestDTO} data - 문서 데이터
 * @param {File[]} files - 첨부파일 목록
 * @returns {Promise<ApprovalDocumentResponseDTO>}
 */
export const saveDraft = async (
    data: ApprovalDocumentRequestDTO,
    files?: File[]
): Promise<ApprovalDocumentResponseDTO> => {
    const formData = new FormData();

    // DTO를 JSON Blob으로 추가
    formData.append('data', new Blob(
        [JSON.stringify(data)],
        { type: 'application/json' }
    ));

    // 첨부파일 추가
    if (files && files.length > 0) {
        files.forEach(file => {
            formData.append('files', file);
        });
    }

    const response = await apiClient.post<ApprovalDocumentResponseDTO>(
        '/approval/draft',
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' }
        }
    );

    return response.data;
};

/**
 * 결재 문서 상신
 * @param {ApprovalDocumentRequestDTO} data - 문서 데이터
 * @param {File[]} files - 첨부파일 목록
 * @returns {Promise<ApprovalDocumentResponseDTO>}
 */
export const submitDocument = async (
    data: ApprovalDocumentRequestDTO,
    files?: File[]
): Promise<ApprovalDocumentResponseDTO> => {
    const formData = new FormData();

    // DTO를 JSON Blob으로 추가
    formData.append('data', new Blob(
        [JSON.stringify(data)],
        { type: 'application/json' }
    ));

    // 첨부파일 추가
    if (files && files.length > 0) {
        files.forEach(file => {
            formData.append('files', file);
        });
    }

    const response = await apiClient.post<ApprovalDocumentResponseDTO>(
        '/approval/submit',
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' }
        }
    );

    return response.data;
};

/**
 * 임시저장 문서 수정
 * @param {number} docId - 문서 ID
 * @param {ApprovalDocumentRequestDTO} data - 문서 데이터
 * @param {File[]} files - 첨부파일 목록
 * @returns {Promise<ApprovalDocumentResponseDTO>}
 */
export const updateDraft = async (
    docId: number,
    data: ApprovalDocumentRequestDTO,
    files?: File[]
): Promise<ApprovalDocumentResponseDTO> => {
    const formData = new FormData();

    // DTO를 JSON Blob으로 추가 (기존 API와 동일하게 'data'로 전송)
    formData.append('data', new Blob(
        [JSON.stringify(data)],
        { type: 'application/json' }
    ));

    // 첨부파일 추가
    if (files && files.length > 0) {
        files.forEach(file => {
            formData.append('files', file);
        });
    }

    const response = await apiClient.put<ApprovalDocumentResponseDTO>(
        `/approval/documents/${docId}`,
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' }
        }
    );

    return response.data;
};

/**
 * 임시저장 문서를 상신으로 변경
 * @param {number} docId - 문서 ID
 * @param {ApprovalDocumentRequestDTO} data - 문서 데이터
 * @param {File[]} files - 첨부파일 목록
 * @returns {Promise<ApprovalDocumentResponseDTO>}
 */
export const submitDraftDocument = async (
    docId: number,
    data: ApprovalDocumentRequestDTO,
    files?: File[]
): Promise<ApprovalDocumentResponseDTO> => {
    const formData = new FormData();

    // DTO를 JSON Blob으로 추가
    formData.append('data', new Blob(
        [JSON.stringify(data)],
        { type: 'application/json' }
    ));

    // 첨부파일 추가
    if (files && files.length > 0) {
        files.forEach(file => {
            formData.append('files', file);
        });
    }

    const response = await apiClient.post<ApprovalDocumentResponseDTO>(
        `/approval/documents/${docId}/submit`,
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' }
        }
    );

    return response.data;
};

export const cancelDocument = async (
    docId: number
): Promise<any> => {
    const response = await apiClient.post<any>(
        `/approval/${docId}/cancellations`,
        {
            headers: { 'Content-Type': 'application/json' }
        }
    );
    return response.data;
};

export const deleteDocument = async (
    docId: number
): Promise<any> => {
    const response = await apiClient.delete<string>(
        `/approval/${docId}`,
        {
            headers: { 'Content-Type': 'application/json' }
        }
    );
    return response.data;
};
