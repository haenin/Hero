/**
 * TypeScript Name : promotion.types.ts
 * Description : 승진과 관련된 DTO 정의(인터페이스)
 *
 * History
 * 2025/12/19 - 승건 최초 작성
 *
 * @module promotion-type
 * @author 승건
 * @version 1.0
 */

// -- DTOs

// --- Common DTOs (공통/내부 데이터) ---
// Request/Response 내부에서 사용되는 하위 객체나 공통 타입들을 정의합니다.

/**
 * 직급 정보를 담기 위한 DTO
 */
export interface PromotionGradeDTO {
    gradeId?: number,
    grade?: string
}

/**
 * 부서 정보를 담기 위한 DTO
 */
export interface PromotionDepartmentDTO {
    departmentId?: number,
    departmentName?: string,
    children?: PromotionDepartmentDTO[]
}

/**
 * 승진 후보자를 알기 위한 DTO
 */
export interface PromotionCandidateDTO {
    candidateId?: number,
    employeeId?: number,
    employeeName?: string,
    employeeNumber?: string,
    department?: string,
    grade?: string,
    nominatorName?: string,
    nominationReason?: string,
    status?: string,
    rejectionReason?: string, // 반려 사유 또는 승인 코멘트
    evaluationPoint?: number
}


/**
 * 승진의 상세 계획을 담기 위한 DTO
 */
export interface PromotionDetailPlanDTO {
    promotionDetailId?: number,
    departmentId?: number,
    department?: string,
    gradeId?: number,
    grade?: string,
    quotaCount?: number,
    candidateList?: PromotionCandidateDTO[]

}

// --- Request DTOs (요청 데이터) ---
/**
 * 계획 등록을 위한 DTO
 */
export interface PromotionPlanRequestDTO {
    planName?: string,
    nominationDeadlineAt?: string,
    appointmentAt?: string,
    detailPlan?: PromotionDetailPlanDTO[],
    planContent?: string
}

/**
 * 승진 후보자 추천 요청 DTO
 */
export interface PromotionNominationRequestDTO {
    promotionId: number;
    candidateId: number;
    nominationReason: string;
}

/**
 * 승진 심사(승인/반려) 요청 DTO
 */
export interface PromotionReviewRequestDTO {
    candidateId: number;
    isPassed: boolean;
    comment?: string;
}

/**
 * 특별 승진(즉시 승진) 요청 DTO
 */
export interface DirectPromotionRequestDTO {
    employeeId: number;
    targetGradeId: number;
    reason: string;
}

// --- Response DTOs (응답 데이터) ---
/**
 * 설정할 수 있는 부서, 직급을 알기 위한 옵션 조회용 DTO
 */
export interface PromotionOptionsDTO {
    promotionGradeList?: PromotionGradeDTO[],
    promotionDepartmentList?: PromotionDepartmentDTO[]
}

/**
 * 계획 리스트 조회 응답
 */
export interface PromotionPlanResponseDTO {
    promotionId?: number,
    planName?: string,
    createdAt?: string,
    nominationDeadlineAt?: string,
    appointmentAt?: string
}

/**
 * 계획에 대한 상세 내용 조회 응답
 */
export interface PromotionPlanDetailResponseDTO {
    promotionId?: number,
    planName?: string,
    createdAt?: string,
    nominationDeadlineAt?: string,
    appointmentAt?: string,
    detailPlan?: PromotionDetailPlanDTO[],
    planContent?: string
}

/**
 * 심사용 승진 상세 계획 DTO (승인 현황 포함)
 */
export interface PromotionDetailForReviewResponseDTO {
    promotionDetailId: number;
    departmentId: number;
    department: string;
    gradeId: number;
    grade: string;
    quotaCount: number;
    approvedCount: number;
    candidateList: PromotionCandidateDTO[];
}

/**
 * 심사용 승진 계획 상세 조회 응답 DTO
 */
export interface PromotionPlanForReviewResponseDTO {
    promotionId: number;
    planName: string;
    createdAt: string;
    nominationDeadlineAt: string;
    appointmentAt: string;
    planContent: string;
    detailPlan: PromotionDetailForReviewResponseDTO[];
}

/**
 * 승진 타입
 */
