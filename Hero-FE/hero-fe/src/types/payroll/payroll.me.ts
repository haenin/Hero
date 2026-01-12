/**
 * TypeScript Name : payroll.me.ts
 * Description : 급여 도메인의 타입 정의 (인터페이스)
 *               [Frontend 급여 화면에서 사용하는 모든 DTO 타입 정의]
 *
 * History
 * 2025/12/09 - 동근 최초 작성
 *
 * @module payroll-types
 * @author 동근
 * @version 1.0
 */

// 급여 공통 항목 (수당, 공제 모두 이 인터페이스 사용)
export interface PayItem {
    /**항목명 */
    name: string;
    /**항목 금액 */
    amount: number;
}

/**
 * /api/me/payroll 응답 DTO (내 급여)
 */
export interface MyPaySummary {
    salaryMonth: string;
    basesalary: number;
    netPay: number;
    grossPay: number;
    totalDeduction: number;
    workDays: number;
    workHours: number;
    overtimeHours: number;
    payDayLabel: string;
    bankName: string;
    bankAccountNumber: string;
    accountHolder: string;
    allowances: PayItem[];
    deductions: PayItem[];
}

/**  
 * /api/me/payroll/payslip 응답 DTO
 */
export interface PayslipDetail {
    salaryMonth: string;
    employeeName: string;
    departmentName: string;
    baseSalary: number;
    allowances: PayItem[];
    deductions: PayItem[];
    grossPay: number;
    totalDeduction: number;
    netPay: number;
    pdfUrl: string | null;
}

/**
 * 급여 이력
 */
export interface PayHistoryRow {
    salaryMonth: string;
    baseSalary: number;
    allowanceTotal: number;
    deductionTotal: number;
    netPay: number;
    remark: string;
}

/** 
 * 급여 추이 차트 데이터 포인트
 */
export interface PayHistoryChartPoint {
    salaryMonth: string;
    netPay: number;
}
/**
 * /api/me/payroll/history 응답 DTO (내 급여 이력)
 */
export interface PayHistoryResponse {
    avgNetPay: number;
    maxNetPay: number;
    minNetPay: number;
    monthOverMonthRate: number;
    ytdNetPay: number;
    chart: PayHistoryChartPoint[];
    rows: PayHistoryRow[];
}

/**
  * 급여 수령 계좌 정보
  */
export interface BankAccount {
    id: number;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
    isPrimary: boolean;
    createdAt: string;
}
