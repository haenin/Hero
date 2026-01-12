/**
 * <pre>
 * TypeScript Name : settings-payroll.types.ts
 * Description     : 급여 정책 & 설정 관리(Payroll Policy) 도메인 타입 정의
 *
 * History
 *  2025/12/26 - 동근 최초 작성
 * </pre>
 *
 * @module settings-payroll-types
 * @author 동근
 * @version 1.0
 */

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errorCode?: string;
}
export type PolicyStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED';
export type Yn = 'Y' | 'N';
export type ItemType = 'ALLOWANCE' | 'DEDUCTION';
export interface PolicyResponse {
    policyId: number;
    policyName: string;
    status: PolicyStatus;
    salaryMonthFrom: string;
    salaryMonthTo?: string | null;
    activeYn: Yn;
}

export interface PolicyCreateRequest {
    policyName: string;
    salaryMonthFrom: string;
    salaryMonthTo?: string | null;
}

export interface PolicyActivateRequest {
    salaryMonthFrom: string;
    salaryMonthTo?: string | null;
}

export type ValueType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | string;
export interface PolicyConfigResponse {
    configKey: string;
    valueType: ValueType;
    configValue: string;
    description?: string | null;
    activeYn: Yn;
}
export interface PolicyConfigUpsertRequest {
    configKey: string;
    valueType: ValueType;
    configValue: string;
    description?: string | null;
    activeYn?: Yn | null;
}

export type CalcMethod = 'FIXED' | 'RATE' | 'FORMULA' | string;
export type PayrollTargetType = 'ALL' | 'DEPARTMENT' | 'POSITION' | 'EMPLOYEE' | string;
export interface ItemPolicyTarget {
    payrollTargetType: PayrollTargetType;
    targetValue?: string | null;
}

export interface ItemPolicy {
    itemPolicyId: number;
    policyId: number;
    itemType: ItemType;
    itemCode: string;
    calcMethod: CalcMethod;
    fixedAmount?: number | null;
    rate?: string | number | null;
    baseAmountType?: string | null;
    roundingUnit?: number | null;
    roundingMode?: string | null;
    salaryMonthFrom: string;
    salaryMonthTo?: string | null;
    priority?: number | null;
    activeYn: Yn;
}

export interface ItemPolicyWithTargets {
    item: ItemPolicy;
    targets: ItemPolicyTarget[];
}

export interface PolicyDetailResponse {
    policy: PolicyResponse;
    configs: PolicyConfigResponse[];
    items: Record<ItemType, ItemPolicyWithTargets[]>;
}

export interface ItemPolicyUpsertRequest {
    itemPolicyId?: number | null;
    itemType: ItemType;
    itemCode: string;
    calcMethod: CalcMethod;
    fixedAmount?: number | null;
    rate?: string | number | null;
    baseAmountType?: string | null;
    roundingUnit?: number | null;
    roundingMode?: string | null;
    salaryMonthFrom: string;
    salaryMonthTo?: string | null;
    priority?: number | null;
    activeYn: Yn;
    targets: ItemPolicyTarget[];
}

export interface AllowanceMaster {
    allowanceId: string;
    allowanceName: string;
    description?: string | null;
    defaultAmount?: number | null;
    taxableYn: Yn;
    activeYn: Yn;
}

export interface DeductionMaster {
    deductionId: string;
    deductionName: string;
    description?: string | null;
    deductionType: string;
    calculationType: string;
    rate?: number | null;
    fixedAmount?: number | null;
    activeYn: Yn;
}

export interface PolicyUpdateRequest {
    policyName?: string | null;
    salaryMonthFrom?: string | null;
    salaryMonthTo?: string | null;
    activeYn?: Yn | null;
}

export interface PolicyCopyRequest {
    policyName?: string | null;
    salaryMonthFrom?: string | null;
    salaryMonthTo?: string | null;
}