/**
 * <pre>
 * File Name   : payrollItemsStore.ts
 * Description : 급여 항목 관리(수당/공제) 스토어
 *
 * 역할
 *  - 수당(Allowance), 공제(Deduction) 목록 조회 및 상태 관리
 *  - 활성/비활성 필터링
 *  - 클라이언트 사이드 페이지네이션
 *  - 수당/공제 CRUD 처리
 *
 * History
 *  2025/12/23 - 동근 최초 작성
 * 
 * </pre>
 * 
 * @module payroll-store
 * @author 동근
 * @version 1.0
 */

import { defineStore } from 'pinia';
import { payrollAdminApi } from '@/api/payroll/payroll.admin';
import type {
    AllowanceResponse,
    AllowanceCreateRequest,
    DeductionResponse,
    DeductionCreateRequest,
    Yn
} from '@/types/payroll/payroll.items';

/**
 * 스토어 상태 인터페이스
 */
interface ItemsState {
    /**
     * 수당 목록
     */
    allowances: AllowanceResponse[];

    /**
     * 공제 목록
     */
    deductions: DeductionResponse[];

    /**
     * 수당 활성/비활성 필터
     */
    allowanceActiveFilter: '' | Yn;

    /**
     * 공제 활성/비활성 필터
     */
    deductionActiveFilter: '' | Yn;

    /**
     * 수당 페이지 번호 (1-based)
     */
    allowancePage: number;

    /**
     * 공제 페이지 번호 (1-based)
     */
    deductionPage: number;

    /**
     * 페이지당 항목 수
     */
    pageSize: number;

    /**
     * 로딩 상태
     */
    loading: boolean;

    /**
     * 에러 메시지
     */
    errorMessage: string;
}

/**
 * 급여 항목 관리 스토어
 */
export const usePayrollItemsStore = defineStore('payrollItems', {
    state: (): ItemsState => ({
        allowances: [],
        deductions: [],

        allowanceActiveFilter: '',
        deductionActiveFilter: '',

        allowancePage: 1,
        deductionPage: 1,
        pageSize: 10,

        loading: false,
        errorMessage: '',
    }),

    getters: {
        /**
         * 수당 총 페이지 수
         */
        allowanceTotalPages(state): number {
            return Math.max(1, Math.ceil(state.allowances.length / state.pageSize));
        },
        /**
         * 수당 페이징된 목록
         */
        pagedAllowances(state): AllowanceResponse[] {
            const start = (state.allowancePage - 1) * state.pageSize;
            return state.allowances.slice(start, start + state.pageSize);
        },

        /**
         * 공제 총 페이지 수
         */
        deductionTotalPages(state): number {
            return Math.max(1, Math.ceil(state.deductions.length / state.pageSize));
        },

        /**
         * 공제 페이징된 목록
         */
        pagedDeductions(state): DeductionResponse[] {
            const start = (state.deductionPage - 1) * state.pageSize;
            return state.deductions.slice(start, start + state.pageSize);
        },
    },

    actions: {
        /**
         * 공통 에러 메시지 추출
         * - axios 응답 메시지 우선
         * - 없으면 Error.message
         * - 그래도 없으면 fallback
         */
        extractErrorMessage(e: unknown, fallback: string) {
            if (e && typeof e === 'object') {
                const err = e as any;
                return err?.response?.data?.message ?? err?.message ?? fallback;
            }
            return fallback;
        },

        /**
         * 수당 활성 여부 필터 변경
         */
        setAllowanceFilter(v: '' | Yn) {
            this.allowanceActiveFilter = v;
            this.allowancePage = 1;
            void this.loadAllowances();
        },

        /**
         * 공제 활성 여부 필터 변경
         */
        setDeductionFilter(v: '' | Yn) {
            this.deductionActiveFilter = v;
            this.deductionPage = 1;
            void this.loadDeductions();
        },

        /**
         * 수당 페이지 번호 설정
         */
        setAllowancePage(page: number) {
            const max = this.allowanceTotalPages;
            this.allowancePage = Math.min(Math.max(1, page), max);
        },

        /**
         * 공제 페이지 번호 설정
         */
        setDeductionPage(page: number) {
            const max = this.deductionTotalPages;
            this.deductionPage = Math.min(Math.max(1, page), max);
        },

        /**
         * 페이지당 항목 수 설정(페이지 사이즈 변경)
         */
        setPageSize(size: number) {
            this.pageSize = Math.max(1, size);
            this.allowancePage = 1;
            this.deductionPage = 1;
        },

        /**
         * 수당 목록 조회
         */
        async loadAllowances() {
            this.loading = true;
            this.errorMessage = '';
            try {
                const params = this.allowanceActiveFilter ? { activeYn: this.allowanceActiveFilter } : undefined;
                this.allowances = await payrollAdminApi.listAllowances(params);
                this.setAllowancePage(this.allowancePage);
            } catch (e: unknown) {
                this.errorMessage = this.extractErrorMessage(e, '수당 목록 조회에 실패했습니다.');
            } finally {
                this.loading = false;
            }
        },

        /**
         * 공제 목록 조회
         */
        async loadDeductions() {
            this.loading = true;
            this.errorMessage = '';
            try {
                const params = this.deductionActiveFilter ? { activeYn: this.deductionActiveFilter } : undefined;
                this.deductions = await payrollAdminApi.listDeductions(params);
                this.setDeductionPage(this.deductionPage);
            } catch (e: unknown) {
                this.errorMessage = this.extractErrorMessage(e, '공제 목록 조회에 실패했습니다.');
            } finally {
                this.loading = false;
            }
        },

        /**
         * 수당 생성
         */
        async createAllowance(payload: AllowanceCreateRequest) {
            this.loading = true;
            this.errorMessage = '';
            try {
                if (payload.defaultAmount == null) payload.defaultAmount = 0;
                await payrollAdminApi.createAllowance(payload);
                await this.loadAllowances();
            } catch (e: unknown) {
                this.errorMessage = this.extractErrorMessage(e, '수당 생성에 실패했습니다.');
                throw e;
            } finally {
                this.loading = false;
            }
        },

        /**
         * 수당 수정
         */
        async updateAllowance(allowanceId: string, payload: AllowanceCreateRequest) {
            this.loading = true;
            this.errorMessage = '';
            try {
                if (payload.defaultAmount == null) payload.defaultAmount = 0;
                await payrollAdminApi.updateAllowance(allowanceId, payload);
                await this.loadAllowances();
            } catch (e: unknown) {
                this.errorMessage = this.extractErrorMessage(e, '수당 수정에 실패했습니다.');
                throw e;
            } finally {
                this.loading = false;
            }
        },

        /**
         * 수당 활성화/비활성화
         */
        async activateAllowance(allowanceId: string) {
            this.loading = true;
            this.errorMessage = '';
            try {
                await payrollAdminApi.activateAllowance(allowanceId);
                await this.loadAllowances();
            } catch (e: unknown) {
                this.errorMessage = this.extractErrorMessage(e, '수당 활성화에 실패했습니다.');
            } finally {
                this.loading = false;
            }
        },

        /**
         * 수당 비활성화
         */
        async deactivateAllowance(allowanceId: string) {
            this.loading = true;
            this.errorMessage = '';
            try {
                await payrollAdminApi.deactivateAllowance(allowanceId);
                await this.loadAllowances();
            } catch (e: unknown) {
                this.errorMessage = this.extractErrorMessage(e, '수당 비활성화에 실패했습니다.');
            } finally {
                this.loading = false;
            }
        },

        /**
         * 공제 생성
         */
        async createDeduction(payload: DeductionCreateRequest) {
            this.loading = true;
            this.errorMessage = '';
            try {
                if (payload.calculationType === 'RATE') {
                    payload.fixedAmount = null;
                    if (payload.rate == null) payload.rate = 0;
                } else {
                    payload.rate = null;
                    if (payload.fixedAmount == null) payload.fixedAmount = 0;
                }

                await payrollAdminApi.createDeduction(payload);
                await this.loadDeductions();
            } catch (e: unknown) {
                this.errorMessage = this.extractErrorMessage(e, '공제 생성에 실패했습니다.');
                throw e;
            } finally {
                this.loading = false;
            }
        },

        /**
         * 공제 수정
         */
        async updateDeduction(deductionId: string, payload: DeductionCreateRequest) {
            this.loading = true;
            this.errorMessage = '';
            try {
                if (payload.calculationType === 'RATE') {
                    payload.fixedAmount = null;
                    if (payload.rate == null) payload.rate = 0;
                } else {
                    payload.rate = null;
                    if (payload.fixedAmount == null) payload.fixedAmount = 0;
                }

                await payrollAdminApi.updateDeduction(deductionId, payload);
                await this.loadDeductions();
            } catch (e: unknown) {
                this.errorMessage = this.extractErrorMessage(e, '공제 수정에 실패했습니다.');
                throw e;
            } finally {
                this.loading = false;
            }
        },

        /**
         * 공제 활성화/비활성화
         */
        async activateDeduction(deductionId: string) {
            this.loading = true;
            this.errorMessage = '';
            try {
                await payrollAdminApi.activateDeduction(deductionId);
                await this.loadDeductions();
            } catch (e: unknown) {
                this.errorMessage = this.extractErrorMessage(e, '공제 활성화에 실패했습니다.');
            } finally {
                this.loading = false;
            }
        },

        /**
         * 공제 비활성화
         */
        async deactivateDeduction(deductionId: string) {
            this.loading = true;
            this.errorMessage = '';
            try {
                await payrollAdminApi.deactivateDeduction(deductionId);
                await this.loadDeductions();
            } catch (e: unknown) {
                this.errorMessage = this.extractErrorMessage(e, '공제 비활성화에 실패했습니다.');
            } finally {
                this.loading = false;
            }
        },
    },
});
