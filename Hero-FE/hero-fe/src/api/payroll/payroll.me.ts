/**
 * <pre>
 * TypeScript Name   : payroll.me.ts
 * Description : 급여(Payroll) 관련 API 호출 모듈
 *               - 내 급여 조회
 *               - 명세서 조회
 *               - 급여 이력 조회
 *               - 급여 계좌 관리 (조회/등록/변경/대표계좌 설정)
 *
 * History
 * 2025/12/09 - 동근 최초 작성
 * </pre>
 *
 * @author 동근
 * @version 1.0
 */
import client from '@/api/apiClient';

import type {
    MyPaySummary,
    PayslipDetail,
    PayHistoryResponse,
    BankAccount,
} from '@/types/payroll/payroll.me';

export interface BankAccountPayload {
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
}

/* ------- 급여 조회 API ------- */

/**
 * 내 급여 요약 정보 조회
 * @param {string} month - 조회 할 급여 (YYYY-MM)
 * @returns {Promise<MyPaySummary>} 내 급여 요약 정보
 */
export const fetchMyPayroll = (month?: string) => {
    return client.get<MyPaySummary>('/me/payroll', {
        params: month ? { month } : undefined
    });
};


/**
 * 급여명세서 상세 정보 조회
 * @param {string} month - 조회 할 급여명세서 월 (YYYY-MM)
 * @returns {Promise<PayslipDetail>} 급여명세서 상세 정보
 */
export const fetchPayslipDetail = (month: string) => {
    return client.get<PayslipDetail>('/me/payroll/payslip', {
        params: { month }
    });
};

/**
 * 급여 이력 + 급여 추이 데이터 조회 (상단에 카드섹션 포함)
 * @returns {Promise<PayHistoryResponse>} 급여 이력 + 급여 추이 데이터
 */
export const fetchPayHistory = () => {
    return client.get<PayHistoryResponse>('/me/payroll/history');
};


/* ------- 계좌 API ------- */

/**
 * 내 급여 계좌 목록 조회
 * @returns {Promise<BankAccount[]>} 등록된 내 급여 계좌 목록
 */
export const fetchMyBankAccounts = () => {
    return client.get<BankAccount[]>('/me/payroll/bank-accounts');
};

/**
 * 급여 계좌 신규 등록
 * @param {BankAccountPayload} payload - 은행, 계좌번호, 예금주 정보
 * @returns {Promise<BankAccount>} 신규로 생성된 급여 계좌 정보
 */
export const createBankAccount = (payload: BankAccountPayload) => {
    return client.post<BankAccount>('/me/payroll/bank-accounts', payload);
};

/**
 * 급여 수령(대표) 계좌 설정 
 * @param {number} bankAccountId - 대표 계좌로 설정할 계좌 ID
 * @returns {Promise<void>}
 */
export const setPrimaryBankAccount = (bankAccountId: number) => {
    return client.put<void>(`/me/payroll/bank-accounts/${bankAccountId}/primary`);
};

/**
 * 급여 계좌 정보 수정
 * @param {number} id - 수정할 계좌 ID 
 * @param {BankAccountPayload} payload - 수정할 계좌 정보
 * @returns {Promise<void>}
 */
export const updateBankAccount = (id: number, payload: BankAccountPayload) => {
    return client.put<void>(`/me/payroll/bank-accounts/${id}`, payload);
};

/**
 * 급여 계좌 삭제
 * @param {number} id - 삭제할 계좌 ID
 * @returns {Promise<void>}
 */
export const deleteBankAccount = (id: number) => {
    return client.delete<void>(`/me/payroll/bank-accounts/${id}`);
};