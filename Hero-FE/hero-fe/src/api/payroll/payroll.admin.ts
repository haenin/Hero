/**
 * TypeScript Name   : payroll.admin.ts
 * Description : 급여(Payroll) 관리자용 API 호출 모듈
 *               - 월별 급여 배치
 *               - 급여 조정
 *               - 급여 조회
 *               - 급여 항목 관리(수당 / 공제 항목)
 *               - 급여 보고서
 * History
 * 2025/12/12 - 동근 최초 작성
 * 2025/12/15 - 동근 배치 API 연동 추가
 * 2025/12/23 - 동근 수당/공제 항목 API 연동 추가
 * 2025/12/26 - 동근 급여관리 사이드바 항목 반영
 * 2025/12/28 - 동근 급여 조회 API 연동 추가
 * </pre>
 *
 * @author 동근
 * @version 1.4
 */
import client from '@/api/apiClient';

import type {
    PayrollBatchDetailResponse,
    PayrollBatchListResponse,
    PayrollEmployeeResultResponse,
    PayrollBatchStatus,
    PayrollBatchTargetEmployee
} from '@/types/payroll/payroll.batch';

import type {
    AllowanceResponse,
    AllowanceCreateRequest,
    DeductionResponse,
    DeductionCreateRequest,
    Yn
} from '@/types/payroll/payroll.items';

import type {
    PayrollPaymentSearchParams,
    PayrollPaymentPageResponse,
    PayrollPaymentSearchRow,
    PayrollPaymentDetailResponse,
} from '@/types/payroll/payroll.payment';

import type {
    PayrollAnalyticsOverviewResponse,
    PayrollAnalyticsOrgResponse,
    PayrollAnalyticsCompositionResponse,
    AnalyticsOverviewQuery,
    AnalyticsOrganizationQuery,
    AnalyticsCompositionQuery,
} from '@/types/payroll/payroll-analytics.types';

type CustomResponse<T> = {
    success: boolean;
    data: T;
    errorCode?: string;
    message?: string;
};

const BASE = '/admin/payroll/batches';
const ALLOWANCE_BASE = '/admin/payroll/allowances';
const DEDUCTION_BASE = '/admin/payroll/deductions';
const PAYMENT_BASE = '/admin/payroll/payments';
const ANALYTICS_BASE = '/admin/payroll/analytics';

export const payrollAdminApi = {
    // GET /api/admin/payroll/batches?month=&status=
    async listBatches(params?: { month?: string; status?: PayrollBatchStatus | '' }) {
        const res = await client.get<PayrollBatchListResponse[]>(BASE, { params });
        return res.data;
    },

    // GET /api/admin/payroll/batches/{batchId}
    async getBatchDetail(batchId: number) {
        const res = await client.get<PayrollBatchDetailResponse>(`${BASE}/${batchId}`);
        return res.data;
    },

    // GET /api/admin/payroll/batches/{batchId}/employees
    async getBatchEmployees(batchId: number) {
        const res = await client.get<PayrollEmployeeResultResponse[]>(`${BASE}/${batchId}/employees`);
        return res.data;
    },

    // POST /api/admin/payroll/batches?month=YYYY-MM
    async createBatch(month: string) {
        const res = await client.post<number>(BASE, null, { params: { month } });
        return res.data; // batchId
    },

    /**
     *  전체 계산
     * - body 없이 호출하면 서버가 targets(재직자) 기준으로 전체 계산
     * POST /api/admin/payroll/batches/{batchId}/calculate
     */
    async calculateBatchAll(batchId: number) {
        await client.post<void>(`${BASE}/${batchId}/calculate`);
    },

    /**
     * 선택 계산
     * - employeeIds만 계산
     * POST /api/admin/payroll/batches/{batchId}/calculate  body: [employeeIds]
     */
    async calculateBatchSelected(batchId: number, employeeIds: number[]) {
        await client.post<void>(`${BASE}/${batchId}/calculate`, employeeIds);
    },

    // POST /api/admin/payroll/batches/{batchId}/confirm
    async confirmBatch(batchId: number) {
        await client.post<void>(`${BASE}/${batchId}/confirm`);
    },

    async listBatchTargets() {
        const res = await client.get<PayrollBatchTargetEmployee[]>(
            '/admin/payroll/batches/targets'
        );
        return res.data;
    },

    // POST /api/admin/payroll/batches/{batchId}/pay
    async payBatch(batchId: number) {
        await client.post<void>(`${BASE}/${batchId}/pay`);
    },

    // ===== Allowance =====
    async listAllowances(params?: { activeYn?: Yn | '' }) {
        const res = await client.get<AllowanceResponse[]>(ALLOWANCE_BASE, { params });
        return res.data;
    },

    async createAllowance(body: AllowanceCreateRequest) {
        await client.post<void>(ALLOWANCE_BASE, body);
    },

    async updateAllowance(allowanceId: string, body: AllowanceCreateRequest) {
        await client.put<void>(`${ALLOWANCE_BASE}/${allowanceId}`, body);
    },

    async activateAllowance(allowanceId: string) {
        await client.patch<void>(`${ALLOWANCE_BASE}/${allowanceId}/activate`);
    },

    async deactivateAllowance(allowanceId: string) {
        await client.patch<void>(`${ALLOWANCE_BASE}/${allowanceId}/deactivate`);
    },

    // ===== Deduction =====
    async listDeductions(params?: { activeYn?: Yn | '' }) {
        const res = await client.get<DeductionResponse[]>(DEDUCTION_BASE, { params });
        return res.data;
    },

    async createDeduction(body: DeductionCreateRequest) {
        await client.post<void>(DEDUCTION_BASE, body);
    },

    async updateDeduction(deductionId: string, body: DeductionCreateRequest) {
        await client.put<void>(`${DEDUCTION_BASE}/${deductionId}`, body);
    },

    async activateDeduction(deductionId: string) {
        await client.patch<void>(`${DEDUCTION_BASE}/${deductionId}/activate`);
    },

    async deactivateDeduction(deductionId: string) {
        await client.patch<void>(`${DEDUCTION_BASE}/${deductionId}/deactivate`);
    },

    async searchPayments(params: PayrollPaymentSearchParams) {
        const res = await client.get<CustomResponse<PayrollPaymentPageResponse<PayrollPaymentSearchRow>>>(
            `${PAYMENT_BASE}/search`,
            { params }
        );
        return res.data.data;
    },

    async getPaymentDetail(payrollId: number) {
        const res = await client.get<CustomResponse<PayrollPaymentDetailResponse>>(
            `${PAYMENT_BASE}/${payrollId}`
        );
        return res.data.data;
    },

    async getAnalyticsOverview(params: AnalyticsOverviewQuery) {
        const res = await client.get<PayrollAnalyticsOverviewResponse>(
            `${ANALYTICS_BASE}/overview`,
            { params }
        );
        return res.data;
    },

    async getAnalyticsOrganization(params: AnalyticsOrganizationQuery) {
        const res = await client.get<PayrollAnalyticsOrgResponse>(
            `${ANALYTICS_BASE}/organization`,
            { params }
        );
        return res.data;
    },

    async getAnalyticsComposition(params: AnalyticsCompositionQuery) {
        const res = await client.get<PayrollAnalyticsCompositionResponse>(
            `${ANALYTICS_BASE}/composition`,
            { params }
        );
        return res.data;
    },
};