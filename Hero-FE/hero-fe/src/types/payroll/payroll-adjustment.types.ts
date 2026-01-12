/**
 * TypeScript Name : payroll-adjustment.types.ts
 * Description     : 급여 조정(Admin) 프론트 공용 타입 정의
 *                  - 결재 문서 기반 조정 요청(Approval)
 *                  - 수기 조정(Manual/mock)
 *
 * History
 *  2026/01/01 - 동근 최초 작성
 *
 * @module payroll-adjustment-types
 * @author 동근
 * @version 1.0
 */

export type AdjustmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
export type Sign = '+' | '-';


export interface ApprovalAdjustmentRow {
    docId: number;
    employeeName: string;
    jobTitle: string;
    departmentName: string;
    reason: string;
    sign: Sign;
    amount: number;
    status: AdjustmentStatus;
    createdAt: string;
    _hydrated?: boolean;
}

export interface ApprovalAdjustmentQuery {
    page: number;
    size: number;
}

export const ADJUST_FORM_NAME = '급여조정신청서';

export type ModifyPayrollDetails = {
    currentAmount?: number;
    adjustmentAmount?: number;
    reason?: string;
};