/**
 * <pre>
 * TypeScript Name : settings-payroll.api.ts
 * Description     : 급여 정책 & 설정 관리(Payroll Policy) 관련 API 호출 모음
 *
 * History
 *  2025/12/26 - 동근 최초 작성
 * </pre>
 *
 * @module settings-payroll-api
 * @author 동근
 * @version 1.0
 */
import apiClient from '@/api/apiClient';
import type {
    ApiResponse,
    PolicyResponse,
    PolicyCreateRequest,
    PolicyActivateRequest,
    PolicyDetailResponse,
    PolicyConfigResponse,
    PolicyUpdateRequest,
    PolicyCopyRequest,
    PolicyConfigUpsertRequest,
    ItemType,
    AllowanceMaster,
    DeductionMaster,
    Yn,
    ItemPolicyUpsertRequest,
} from '@/types/settings/settings-payroll.types';

const BASE_URL = '/settings/payroll/policies';

// settings 참조용(조회 전용 브릿지)
const REF_URL = '/settings/payroll';

const unwrap = <T>(res: any): T => {
    const body = res?.data;
    if (body?.data !== undefined) return body.data as T;
    if (body?.result !== undefined) return body.result as T;
    if (body?.data?.data !== undefined) return body.data.data as T;
    console.error('[unwrap] unexpected response:', body);
    return undefined as unknown as T;
};

export const settingsPayrollApi = {
    async listPolicies(): Promise<PolicyResponse[]> {
        const res = await apiClient.get<ApiResponse<PolicyResponse[]>>(BASE_URL);
        return unwrap(res);
    },

    async createPolicy(body: PolicyCreateRequest): Promise<PolicyResponse> {
        const res = await apiClient.post<ApiResponse<PolicyResponse>>(BASE_URL, body);
        return unwrap(res);
    },

    async getActivePolicy(): Promise<PolicyResponse> {
        const res = await apiClient.get<ApiResponse<PolicyResponse>>(`${BASE_URL}/active`);
        return unwrap(res);
    },

    async activatePolicy(policyId: number, body: PolicyActivateRequest): Promise<PolicyResponse> {
        const res = await apiClient.patch<ApiResponse<PolicyResponse>>(`${BASE_URL}/${policyId}/activate`, body);
        return unwrap(res);
    },

    async getPolicyDetail(policyId: number): Promise<PolicyDetailResponse> {
        const res = await apiClient.get<ApiResponse<PolicyDetailResponse>>(`${BASE_URL}/${policyId}`);
        return unwrap(res);
    },

    async getConfigs(policyId: number): Promise<PolicyConfigResponse[]> {
        const res = await apiClient.get<ApiResponse<PolicyConfigResponse[]>>(`${BASE_URL}/${policyId}/configs`);
        return unwrap(res);
    },

    async upsertConfigs(policyId: number, body: PolicyConfigUpsertRequest[]): Promise<void> {
        await apiClient.put<ApiResponse<null>>(`${BASE_URL}/${policyId}/configs`, body);
    },

    async upsertItemPolicies(policyId: number, type: ItemType, body: ItemPolicyUpsertRequest[]): Promise<void> {
        await apiClient.put<ApiResponse<null>>(`${BASE_URL}/${policyId}/items`, body, { params: { type } });
    },

    async deleteItemPolicy(policyId: number, itemPolicyId: number): Promise<void> {
        await apiClient.delete<ApiResponse<null>>(`${BASE_URL}/${policyId}/items/${itemPolicyId}`);
    },

    async listAllowances(activeYn: Yn = 'Y'): Promise<AllowanceMaster[]> {
        const res = await apiClient.get<ApiResponse<AllowanceMaster[]>>(`${REF_URL}/allowances`, {
            params: { activeYn },
            headers: { 'Cache-Control': 'no-cache' },
        });
        return unwrap(res);
    },

    async listDeductions(activeYn: Yn = 'Y'): Promise<DeductionMaster[]> {
        const res = await apiClient.get<ApiResponse<DeductionMaster[]>>(`${REF_URL}/deductions`, {
            params: { activeYn },
            headers: { 'Cache-Control': 'no-cache' },
        });
        return unwrap(res);
    },

    async updatePolicy(policyId: number, body: PolicyUpdateRequest): Promise<PolicyResponse> {
        const res = await apiClient.put<ApiResponse<PolicyResponse>>(`${BASE_URL}/${policyId}`, body);
        return unwrap(res);
    },

    async deleteDraftPolicy(policyId: number): Promise<void> {
        await apiClient.delete<ApiResponse<null>>(`${BASE_URL}/${policyId}`);
    },

    async copyPolicy(policyId: number, body?: PolicyCopyRequest | null): Promise<PolicyResponse> {
        const res = await apiClient.post<ApiResponse<PolicyResponse>>(`${BASE_URL}/${policyId}/copy`, body ?? null);
        return unwrap(res);
    },

    async expirePolicy(policyId: number): Promise<PolicyResponse> {
        const res = await apiClient.patch<ApiResponse<PolicyResponse>>(
            `${BASE_URL}/${policyId}/expire`,
            null
        );
        return unwrap(res);
    },
};
