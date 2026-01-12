/**
 * <pre>
 * TypeScript Name: settings-approval.api.ts
 * Description 
 * :결재(Approval) 관리와 관련된 서버 API 호출을 담당하는 모듈
 *
 * 주요 타입:
 * - SettingsApprovalResponseDTO: 문서에 대한 기본 정보를 포함한 응답 DTO
 *
 * History
 * 2025/12/21 (민철) 결재 관리 설정 api (목록조회/서식별설정조회/서식별설정저장)
 * 2025/12/22 (민철) 결재 설정 저장 api 추가
 * 2025/12/31 (민철) 로그 제거
 * </pre>
 *
 * @author 민철
 * @version 1.1
 */

import apiClient from '@/api/apiClient';
import {
    SettingsApprovalResponseDTO,
    SettingsDocumentTemplateResponseDTO,
    DepartmentResponseDTO,
    SettingsApprovalRequestDTO,
} from '@/types/settings/settings-approval.types';

/**
 * 결재 관리 api
 * - 서식 목록 조회: 서식분류/서식이름/결재단계
 * - 부서 목록 조회: 부서ID/부서명
 * - 서식별 기본설정조회: 기본결재선/참조목록
 */
export const settingsApprovalApi = {
    getList: async () => {
        const response = await apiClient.get<SettingsDocumentTemplateResponseDTO[]>('/settings/approvals/templates');
        return response.data;
    },

    getDepartmentList: async () => {
        const response = await apiClient.get<DepartmentResponseDTO[]>('/settings/approvals/departments');
        return response.data;
    },

    getDefaultSettings: async (templateId: number) => {
        const response = await apiClient.get<SettingsApprovalResponseDTO>(`/settings/approvals/templates/${templateId}`);
        return response.data;
    },

    saveSettings: async (templateId: number, data: SettingsApprovalRequestDTO) => {
        const response = await apiClient.put<SettingsApprovalResponseDTO>(`/settings/approvals/templates/${templateId}`, data);
        return response.data;
    }
};
