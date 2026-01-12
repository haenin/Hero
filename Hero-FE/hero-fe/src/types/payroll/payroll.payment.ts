/**
 * TypeScript Name : payroll.payment.ts
 * Description : 급여(Payroll) 지급/조회 도메인 타입 정의 (관리자용)
 *
 * History
 * 2025/12/28 - 동근 최초 작성
 * 2025/12/31 - 동근 페이지 응답 공통 타입으로 변경
 *
 *
 * @author 동근
 * @version 1.0
 */

import type { PageResponse as CommonPageResponse } from '@/types/common/pagination.types';

/**
 * 급여 조회 검색 조건 파라미터
 */
export type PayrollPaymentSearchParams = {
    salaryMonth: string;
    departmentId?: number | null;
    jobTitleId?: number | null;
    keyword?: string | null;
    page?: number;
    size?: number;
};


export type PayrollPaymentPageResponse<T> =
    CommonPageResponse<T> & {
        first?: boolean;
        last?: boolean;
    };

/**
 * 급여 조회 목록 화면에서 사용되는 행(Row) 데이터 타입
 */
export type PayrollPaymentSearchRow = {
    payrollId: number;
    employeeId: number;
    employeeNumber: string;
    employeeName: string;
    departmentName: string;
    jobTitleName: string;
    baseSalary: number;
    allowanceTotal: number;
    totalPay?: number;
    deductionTotal: number;
    netPay: number;
    payrollStatus: string;
    salaryMonth: string;
};

/**
 * 급여 상세 화면의 수당/공제 항목 데이터 타입
 */
export type PayrollPaymentItemRow = {
    payrollItemId: number;
    itemType: string;
    itemId: string | null;
    itemName: string;
    amount: number;
    sortOrder: number;
};

/**
 * 급여 조회 상세 응답 타입
 */
export type PayrollPaymentDetailResponse = {
    payrollId: number;
    salaryMonth: string;
    payrollStatus: string;

    employeeId: number;
    employeeNumber: string;
    employeeName: string;
    departmentName: string;
    jobTitleName: string;

    baseSalary: number;
    allowanceTotal: number;
    deductionTotal: number;
    totalPay: number;
    netPay: number;

    items: PayrollPaymentItemRow[];
};
