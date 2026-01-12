/**
 * <pre>
 * TypeScript Name : payroll.items.ts
 * Description     : 급여 항목 관리(수당/공제) 타입 정의
 *
 * 역할
 *  - 급여 항목(Allowance / Deduction) 관련 API 요청, 응답 타입 정의
 *  - 관리자 급여 항목 관리 화면 및 스토어에서 공통 사용
 *  - 공제(Deduction)는 calculationType에 따라 rate/fixedAmount 중 하나만 사용
 *
 * History
 *  2025/12/23 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-items-types
 * @author 동근
 * @version 1.0
 */

/**
 * 공통 예/아니오 타입
 */
export type Yn = 'Y' | 'N';

/**
 * 공제 유형
 *  - TAX        : 세금
 *  - INSURANCE : 4대 보험 등 사회보험
 *  - ETC        : 기타 공제
 */
export type DeductionType = 'TAX' | 'INSURANCE' | 'ETC';

/**
 * 공제 계산 방식
 *  - FIXED : 정액
 *  - RATE  : 비율(%)
 */
export type CalculationType = 'FIXED' | 'RATE';


/**
 * 수당 조회 응답 타입
 */
export interface AllowanceResponse {
    allowanceId: string;
    allowanceName: string;
    description: string | null;
    defaultAmount: number | null;
    taxableYn: Yn;
    activeYn: Yn;
}

/**
 * 수당 생성/수정 요청 타입
 */
export interface AllowanceCreateRequest {
    allowanceId: string;
    allowanceName: string;
    description?: string | null;
    defaultAmount?: number | null;
    taxableYn: Yn;
}

/**
 * 공제 조회 응답 타입
 */
export interface DeductionResponse {
    deductionId: string;
    deductionName: string;
    description: string | null;
    deductionType: DeductionType;
    calculationType: CalculationType;
    rate: number | null;        // RATE일 때 % (비율)
    fixedAmount: number | null; // FIXED일 때 원 (정액)
    activeYn: Yn;
}

/**
 * 공제 생성/수정 요청 타입
 */
export interface DeductionCreateRequest {
    deductionId: string;
    deductionName: string;
    description?: string | null;
    deductionType: DeductionType;
    calculationType: CalculationType;
    rate?: number | null;
    fixedAmount?: number | null;
}