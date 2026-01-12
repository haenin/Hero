/**
 * <pre>
 * File Name   : promotion.api.ts
 * Description : 승진과 관련된 API 호출 모듈
 *
 * History
 * 2025/12/19 - 승건 최초 작성
 * </pre>
 *
 * @author 승건
 * @version 1.0
 */

import client from '@/api/apiClient';

// 승진 계획 등록
import type {
    // common
    PromotionGradeDTO,
    PromotionDepartmentDTO,
    PromotionCandidateDTO,
    PromotionDetailPlanDTO,
    //request
    PromotionPlanRequestDTO,
    PromotionNominationRequestDTO,
    PromotionReviewRequestDTO,
    DirectPromotionRequestDTO,
    //response
    PromotionOptionsDTO,
    PromotionPlanResponseDTO,
    PromotionPlanDetailResponseDTO,
    PromotionPlanForReviewResponseDTO
} from '@/types/personnel/promotion.types';

// API 공통 응답 타입 정의
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: any;
    message?: string;
}

// 페이징 응답 타입 정의
export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

/**
 * 승진 계획에 등록 가능한 부서와 직급을 조회
 */
export const fetchPromotionOptions = () => {
    return client.get<ApiResponse<PromotionOptionsDTO>>('/promotion/plan/options');
}

/**
 * 승진 계획을 페이징하여 조회
 * @param params.isFinished 계획 마감 여부 (true: 완료, false: 진행중, null: 전체)
 * @param params.page
 * @param params.size
 */
export const fetchPromotionPlans = (params: { isFinished?: boolean | null; page: number; size: number }) => {
    return client.get<ApiResponse<PageResponse<PromotionPlanResponseDTO>>>('/promotion/plan', { params });
}

/**
 * 승진 계획의 상세 정보를 조회
 * @param promotionId 조회할 승진 계획의 ID
 */
export const fetchPromotionPlanDetail = (promotionId: number) => {
    return client.get<ApiResponse<PromotionPlanDetailResponseDTO>>(`/promotion/plan/${promotionId}`);
}

/**
 * 새로운 승진 계획을 등록
 * @param data 등록할 승진 계획 정보
 */
export const registerPromotionPlan = (data: PromotionPlanRequestDTO) => {
    return client.post<ApiResponse<void>>('/promotion/plan', data);
}

/**
 * 현재 로그인한 사람의 부서를 이용해 관련된 승진 계획 조회
 */
export const fetchRecommendPromotionPlans = () => {
    return client.get<ApiResponse<PromotionPlanResponseDTO[]>>('/promotion/nominations');
}

/**
 * 현재 로그인한 사람의 부서를 이용해 관련된 승진 계획의 상세 정보를 조회 (본인 부서 및 하위 부서원만 포함)
 * @param promotionId 
 */
export const fetchRecommendPromotionPlanDetail = (promotionId: number) => {
    return client.get<ApiResponse<PromotionPlanDetailResponseDTO>>(`/promotion/nominations/${promotionId}`);
}

/**
 * 승진 후보자 추천
 * @param data 
 */
export const nominateCandidate = (data: PromotionNominationRequestDTO) => {
    return client.post<ApiResponse<void>>('/promotion/nominations', data);
}

/**
 * 승진 후보자 추천 취소
 * @param candidateId 
 */
export const cancelNomination = (candidateId: number) => {
    return client.delete<ApiResponse<void>>(`/promotion/nominations/${candidateId}`);
}

/**
 * (인사팀용) 심사 가능한 승진 계획 목록 조회
 */
export const fetchPromotionPlansForReview = () => {
    return client.get<ApiResponse<PromotionPlanResponseDTO[]>>('/promotion/reviews');
}

/**
 * (인사팀용) 심사용 승진 계획 상세 조회
 * @param promotionId 
 */
export const fetchReviewPromotionDetail = (promotionId: number) => {
    return client.get<ApiResponse<PromotionPlanForReviewResponseDTO>>(`/promotion/review/${promotionId}`);
}

/**
 * 승진 후보자 심사 (승인/반려)
 * @param data 
 */
export const reviewCandidate = (data: PromotionReviewRequestDTO) => {
    return client.post<ApiResponse<void>>('/promotion/review', data);
}

/**
 * 최종 승인 처리
 * @param data 
 */
export const confirmFinalApproval = (data: PromotionReviewRequestDTO) => {
    return client.post<ApiResponse<void>>('/promotion/review/final', data);
}

/**
 * 특정 직원을 즉시 승진시킵니다. (특별 승진)
 * @param data 즉시 승진 요청 정보
 */
export const promoteDirectly = (data: DirectPromotionRequestDTO) => {
    return client.post<ApiResponse<void>>('/promotion/direct', data);
}
