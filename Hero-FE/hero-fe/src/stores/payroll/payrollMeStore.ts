/**
 * <pre>
 * TypeScript Name : payrollMeStore.ts
 * Description     : 급여(Payroll) 도메인의 Pinia Store (프론트 상태 + API 연동)
 *
 * Responsibility
 *   - 내 급여(요약) 조회
 *   - 급여 명세서 상세 조회
 *   - 급여 이력 조회
 *   - 급여 수령 계좌 목록 조회/추가/수정/삭제
 *   - 급여 기본(대표) 계좌 설정
 *
 * Views
 *   - /payroll               내 급여
 *   - /payroll/history       내 급여 이력
 *
 * History
 *   2025/12/09 - 동근 최초 작성 (급여 관련 API 연동 + Pinia 상태 관리 구성)
 * </pre>
 *
 * @module payroll-store
 * @author 동근
 * @version 1.0
 */

import { defineStore } from 'pinia';
import {
    fetchMyPayroll,
    fetchPayslipDetail,
    fetchPayHistory,
    fetchMyBankAccounts,
    createBankAccount,
    setPrimaryBankAccount as apiSetPrimaryBankAccount,
    updateBankAccount,
    deleteBankAccount,
} from '@/api/payroll/payroll.me';

import type {
    MyPaySummary,
    PayslipDetail,
    PayHistoryResponse,
    BankAccount
} from '@/types/payroll/payroll.me';


export const usePayrollStore = defineStore('payroll', {
    state: () => ({

        loading: false as boolean,
        error: null as string | null,

        // 내 급여
        currentMonth: '' as string,
        summary: null as MyPaySummary | null,
        payslip: null as PayslipDetail | null,

        // 이력
        history: null as PayHistoryResponse | null,

        // 계좌
        accounts: [] as BankAccount[],
    }),

    actions: {
        extractErrorMessage(e: unknown, fallback: string) {
            if (e && typeof e === 'object') {
                const err = e as any;
                return err?.response?.data?.message ?? err?.message ?? fallback;
            }
            return fallback;
        },
        /**
         * 내 급여 요약 정보를 조회
         * @param month 조회할 급여월
         */
        async loadMyPayroll(month?: string) {
            try {
                this.loading = true;
                this.error = null;
                this.summary = null;
                this.payslip = null;
                const { data } = await fetchMyPayroll(month);
                this.summary = data;
                this.currentMonth = data.salaryMonth;
            } catch (e: unknown) {
                this.summary = null;
                this.payslip = null;
                this.error = this.extractErrorMessage(e, '급여 정보를 불러오지 못했습니다.');
            } finally {
                this.loading = false;
            }
        },

        /**
         * 특정 급여월의 명세서 상세 정보를 조회
         * @param month 조회할 급여월
         */
        async loadPayslip(month: string) {
            try {
                this.loading = true;
                this.error = null;
                const { data } = await fetchPayslipDetail(month);
                this.payslip = data;
            } catch (e: unknown) {
                this.error = this.extractErrorMessage(e, '명세서를 불러오지 못했습니다.');
            } finally {
                this.loading = false;
            }
        },
        /**
         * 내 급여 이력(여러 개의 급여월)을 조회
         */
        async loadHistory() {
            try {
                this.loading = true;
                this.error = null;
                const { data } = await fetchPayHistory();
                this.history = data;
            } catch (e: unknown) {
                this.error = this.extractErrorMessage(e, '급여 이력을 불러오지 못했습니다.');
            } finally {
                this.loading = false;
            }
        },

        /* -------------------
         * 계좌 관련
         * ------------------- */

        /** 
         *  내 급여 수령 계좌 목록을 조회
         */
        async loadAccounts() {
            try {
                this.loading = true;
                this.error = null;
                const { data } = await fetchMyBankAccounts();
                this.accounts = data;
            } catch (e: unknown) {
                this.error = this.extractErrorMessage(e, '계좌 목록을 불러오지 못했습니다.');
                throw e;
            } finally {
                this.loading = false;
            }
        },

        /** 새 계좌 추가 */
        async addAccount(payload: {
            bankCode: string;
            accountNumber: string;
            accountHolder: string;
        }) {
            await this.addMyBankAccount(payload);
        },

        /** 내 계좌 목록 조회 */
        async loadMyBankAccounts() {
            await this.loadAccounts();
        },

        /**
         * 새 계좌를 추가하고, 생성된 계좌 객체를 반환
         * @param payload 계좌 생성에 필요한 정보
         * @returns 생성된 BankAccount 객체
         */
        async addMyBankAccount(payload: {
            bankCode: string;
            accountNumber: string;
            accountHolder: string;
        }): Promise<BankAccount> {
            const response = await createBankAccount(payload);
            // 목록 최신화
            await this.loadAccounts();
            return response.data as BankAccount;
        },

        /**
         * 급여 수령용 기본(대표) 계좌를 설정
         * @param bankAccountId 대표 계좌로 설정할 계좌 ID
         */
        async setPrimaryBankAccount(bankAccountId: number) {
            try {
                this.loading = true;
                this.error = null;
                await apiSetPrimaryBankAccount(bankAccountId);

                this.accounts = this.accounts.map((acc) => ({
                    ...acc,
                    primary: acc.id === bankAccountId
                }));
            } catch (e: unknown) {
                this.error = this.extractErrorMessage(e, '대표 계좌 설정 중 오류가 발생했습니다.');
                throw e;
            } finally {
                this.loading = false;
            }
        },

        /**
         * 계좌 정보를 수정
         * @param accountId 수정할 계좌 ID
         * @param payload 수정할 계좌 정보
         */
        async updateMyBankAccount(
            accountId: number,
            payload: {
                bankCode: string;
                accountNumber: string;
                accountHolder: string;
            },
        ) {
            await updateBankAccount(accountId, payload);
            // 계좌 목록 최신화
            await this.loadAccounts();
            if (this.currentMonth) {
                await this.loadMyPayroll(this.currentMonth);
            } else {
                await this.loadMyPayroll();
            }
        },

        /**
         * 계좌 삭제
         * @param accountId 삭제할 계좌 ID
         */
        async deleteMyBankAccount(accountId: number) {
            try {
                this.loading = true;
                this.error = null;
                await deleteBankAccount(accountId);

                await this.loadAccounts();
                if (this.currentMonth) {
                    await this.loadMyPayroll(this.currentMonth);
                } else {
                    await this.loadMyPayroll();
                }
            } catch (e: unknown) {
                const err = e as any;
                const code = err?.response?.data?.errorCode ?? err?.response?.data?.code;
                const message = this.extractErrorMessage(e, '계좌 삭제 중 오류가 발생했습니다.');
                const wrapped = new Error(message) as Error & { code?: string };
                wrapped.code = code;
                throw wrapped;
            } finally {
                this.loading = false;
            }
        }
    },
});
