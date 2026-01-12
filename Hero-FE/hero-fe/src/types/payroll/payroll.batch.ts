/**
 * <pre>
 * TypeScript Name   : payroll.batch.ts
 * Description : 급여(Payroll) 관리자용 월별 급여 배치 타입 정의
 *
 * History
 * 2025/12/12 - 동근 최초 작성
 * 2025/12/15 - 동근 배치 API 연동 타입 추가
 * 2025/12/23 - 동근 타입 파일명 변경(payroll.admin.ts -> payroll.batch.ts)
 * </pre>
 *
 * @author 동근
 * @version 1.2
 */
export type PayrollBatchStatus = 'READY' | 'CALCULATED' | 'CONFIRMED' | 'PAID';
export type PayrollStatus = 'READY' | 'CALCULATED' | 'FAILED' | 'CONFIRMED';

export interface PayrollBatchListResponse {
    batchId: number;
    salaryMonth: string;
    status: PayrollBatchStatus;
    createdAt: string | null;
    updatedAt: string | null;
    closedAt: string | null;
    totalGrossPay?: number | null;
    totalDeduction?: number | null;
    totalNetPay?: number | null;

    createdBy?: number | null;
    createdByName?: string | null;

    approvedBy?: number | null;
    approvedByName?: string | null;
    approvedAt?: string | null;

    paidBy?: number | null;
    paidByName?: string | null;
    paidAt?: string | null;
}

export interface PayrollBatchDetailResponse {
    batchId: number;
    salaryMonth: string;
    status: PayrollBatchStatus;
    createdAt: string | null;
    updatedAt: string | null;
    closedAt: string | null;

    totalEmployeeCount: number;
    calculatedCount: number;
    failedCount: number;
    confirmedCount: number;
}

export interface PayrollEmployeeResultResponse {
    payrollId: number;
    employeeId: number;
    employeeName: string;
    departmentName: string | null;
    salaryMonth: string;
    status: PayrollStatus;

    baseSalary: number;
    overtimePay: number;
    allowanceTotal: number;
    deductionTotal: number;
    totalPay: number;
    attendanceDays: number;

    /**
     * 계산/검증 실패 사유
     * - status === 'FAILED' 인 경우에만 의미 있음
     * - 백엔드에서 아직 안 내려주면 undefined/null
     */
    errorMessage?: string | null;
}

export interface PayrollBatchTargetEmployee {
    employeeId: number;
    employeeName: string;
    departmentName: string | null;
}