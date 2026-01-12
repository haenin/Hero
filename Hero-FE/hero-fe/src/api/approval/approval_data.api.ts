/**
 * <pre>
 * API Name        : approval_data.api.ts
 * Description     : 결재 문서 작성 시 UI 상에서 필요한 데이터
 *
 * 주요 함수
 * - 
 *
 * History
 * 2025/12/28 (민철) 최초 작성
 * 2025/12/31 (민철) 부서/직급/직책 목록 조회 API 호출 함수
 * </pre>
 *
 * @author 민철
 * @version 1.1
 */

import apiClient from '@/api/apiClient';
import type {
    VacationTypeResponseDTO,
    WorkSystemTypeResponseDTO,
    ResignTypeResponseDTO,
    BeforePayrollResponseDTO,
    PersonnelTypesResponseDTO,

} from '@/types/approval/approval_data.types';

export const getVacationType = async () => {
    const response = await apiClient.get<VacationTypeResponseDTO[]>('/approval/vacation-types');
    return response.data;

};

export const getWorkSystemType = async () => {
    const response = await apiClient.get<WorkSystemTypeResponseDTO[]>('/approval/work-system-types');
    return response.data;
};

export const getResignType = async () => {
    const response = await apiClient.get<ResignTypeResponseDTO[]>('/approval/resign-types');
    return response.data;
};

export const getPayroll = async () => {
    const response = await apiClient.get<BeforePayrollResponseDTO>('/approval/payroll');
    return response.data;
};

export const getPersonnelTypes = async () => {
    const response = await apiClient.get<PersonnelTypesResponseDTO>('/approval/personnel-types');
    return response.data;
};