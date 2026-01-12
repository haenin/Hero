/**
 * TypeScript Name : payrollPaymentStore.ts
 * Description : 급여(Payroll) 지급/조회(관리자) 화면용 Pinia Store
 *
 * History
 * 2025/12/28 - 동근 최초 작성
 *
 * @module payroll-payment-store
 * @author 동근
 * @version 1.0
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { payrollAdminApi } from '@/api/payroll/payroll.admin';
import type {
    PayrollPaymentSearchParams,
    PayrollPaymentPageResponse,
    PayrollPaymentSearchRow,
    PayrollPaymentDetailResponse,
} from '@/types/payroll/payroll.payment';

/**
 * 급여 지급/조회(관리자) Store
 *
 * @see payrollAdminApi.searchPayments 급여 조회 목록 API
 * @see payrollAdminApi.getPaymentDetail 급여 조회 상세 API
 */
export const usePayrollPaymentStore = defineStore('payrollPaymentStore', () => {
    const loading = ref(false);
    const errorMessage = ref<string | null>(null);

    const salaryMonth = ref<string>('');
    const departmentId = ref<number | null>(null);
    const jobTitleId = ref<number | null>(null);
    const keyword = ref<string>('');

    const page = ref<number>(1);
    const size = ref<number>(10);

    const result = ref<PayrollPaymentPageResponse<PayrollPaymentSearchRow> | null>(null);

    const detailOpen = ref(false);
    const selectedPayrollId = ref<number | null>(null);
    const detail = ref<PayrollPaymentDetailResponse | null>(null);

    const rows = computed(() => result.value?.content ?? []);
    const totalElements = computed(() => result.value?.totalElements ?? 0);
    const totalPages = computed(() => result.value?.totalPages ?? 0);
    const currentPage0 = computed(() => result.value?.page ?? 0);

    const resetError = () => (errorMessage.value = null);

    const extractErrorMessage = (e: unknown, fallback: string) => {
        if (e && typeof e === 'object') {
            const err = e as any;
            return err?.response?.data?.message ?? err?.message ?? fallback;
        }
        return fallback;
    };

    /**
     * 급여 조회 검색 파라미터를 구성한다.
     * 
     * @param overrides 부분적으로 덮어쓸 검색 파라미터
     * @returns 최종 검색 파라미터
     */
    function buildParams(overrides?: Partial<PayrollPaymentSearchParams>): PayrollPaymentSearchParams {
        return {
            salaryMonth: salaryMonth.value,
            departmentId: departmentId.value ?? undefined,
            jobTitleId: jobTitleId.value ?? undefined,
            keyword: keyword.value?.trim() ? keyword.value.trim() : undefined,
            page: page.value,
            size: size.value,
            ...overrides,
        };
    }


    /**
     * 급여 조회 목록을 조회한다.
     *
     * @param overrides 검색 파라미터 일부 덮어쓰기
     * @throws API 호출 실패 시 예외를 그대로 rethrow
     */
    async function search(overrides?: Partial<PayrollPaymentSearchParams>) {
        if (!salaryMonth.value?.trim()) {
            errorMessage.value = '급여월(YYYY-MM)은 필수입니다.';
            return;
        }

        loading.value = true;
        resetError();
        try {
            const data = await payrollAdminApi.searchPayments(buildParams(overrides));
            result.value = data;
            page.value = (data?.page ?? 0) + 1;
        } catch (e: unknown) {
            errorMessage.value = extractErrorMessage(e, '급여조회 실패');
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /**
     * 특정 페이지로 이동 후 목록을 재조회한다.
     *
     * @param nextPage1 이동할 페이지 번호 (1-based)
     */
    async function goPage(nextPage1: number) {
        page.value = nextPage1;
        await search();
    }

    /**
     * 급여 상세 모달을 열고 상세 데이터를 조회한다.
     *
     * @param payrollId 급여 ID
     * @throws API 호출 실패 시 예외를 그대로 rethrow
     */
    async function openDetail(payrollId: number) {
        detailOpen.value = true;
        selectedPayrollId.value = payrollId;

        loading.value = true;
        resetError();
        try {
            detail.value = await payrollAdminApi.getPaymentDetail(payrollId);
        } catch (e: unknown) {
            errorMessage.value = extractErrorMessage(e, '급여 상세 조회 실패');
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /**
     * 급여 상세 모달을 닫고 상세 상태를 초기화한다.
     */
    function closeDetail() {
        detailOpen.value = false;
        selectedPayrollId.value = null;
        detail.value = null;
    }

    return {
        loading,
        errorMessage,

        salaryMonth,
        departmentId,
        jobTitleId,
        keyword,

        page,
        size,
        totalElements,
        totalPages,
        currentPage0,

        result,
        rows,

        search,
        goPage,
        openDetail,
        closeDetail,

        detailOpen,
        selectedPayrollId,
        detail,
    };
});
