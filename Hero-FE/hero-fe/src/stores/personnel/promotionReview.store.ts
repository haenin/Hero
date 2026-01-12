/**
 * <pre>
 * File Name   : promotionReview.store.ts
 * Description : 승진 심사 관련 상태 관리 (Pinia)
 *               - 인사팀의 승진 후보자 심사(승인/반려) 및 조회 기능 담당
 *
 * History
 * 2025/12/23 - 승건 최초 작성
 * </pre>
 *
 * @author 승건
 * @version 1.0
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchReviewPromotionDetail, reviewCandidate, fetchPromotionPlansForReview } from '@/api/personnel/promotion.api';
import type { PromotionPlanForReviewResponseDTO, PromotionReviewRequestDTO, PromotionPlanResponseDTO } from '@/types/personnel/promotion.types';

export const usePromotionReviewStore = defineStore('promotion-review', () => {
    const reviewPlans = ref<PromotionPlanResponseDTO[]>([]);
    const reviewDetail = ref<PromotionPlanForReviewResponseDTO | null>(null);
    const loading = ref(false);

    // 심사 가능한 계획 목록 조회
    const getReviewPlans = async () => {
        loading.value = true;
        try {
            const response = await fetchPromotionPlansForReview();
            if (response.data.success) {
                reviewPlans.value = response.data.data;
            } else {
                console.error(`심사 목록 조회 실패: ${response.data.message}`);
                reviewPlans.value = [];
            }
        } catch (error) {
            console.error('심사 목록 조회 에러:', error);
            reviewPlans.value = [];
        } finally {
            loading.value = false;
        }
    };

    // 심사 상세 정보 조회
    const getReviewDetail = async (id: number) => {
        loading.value = true;
        try {
            const response = await fetchReviewPromotionDetail(id);
            if (response.data.success) {
                console.log('Store: 심사 상세 데이터 수신:', response.data.data);
                reviewDetail.value = response.data.data;
            } else {
                console.error(`심사 상세 조회 API 실패 [${(response.data as any).errorCode}]: ${response.data.message}`);
                reviewDetail.value = null;
            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                console.error(`심사 상세 조회 실패 [${error.response.data.errorCode}]: ${error.response.data.message}`);
            } else {
                console.error('심사 상세 조회 실패:', error);
            }
            reviewDetail.value = null;
        } finally {
            loading.value = false;
        }
    };

    // 후보자 심사 (승인/반려)
    const submitReview = async (data: PromotionReviewRequestDTO) => {
        loading.value = true;
        try {
            const response = await reviewCandidate(data);
            if (response.data.success) {
                // 성공 시 현재 로컬 데이터 업데이트 (재조회 없이 UI 반영)
                // 백엔드 상태값과 일치시키기 위해 REVIEW_PASSED / REVIEW_REJECTED 사용
                const status = data.isPassed ? 'REVIEW_PASSED' : 'REVIEW_REJECTED';
                updateLocalCandidateStatus(data.candidateId, status, data.comment);
                return true;
            } else {
                console.error(`심사 처리 실패 [${(response.data as any).errorCode}]: ${response.data.message}`);
                return false;
            }
        } catch (error: any) {
            console.error('심사 처리 에러:', error);
            return false;
        } finally {
            loading.value = false;
        }
    };

    // 로컬 상태 업데이트 헬퍼
    const updateLocalCandidateStatus = (candidateId: number, status: string, reason?: string) => {
        if (!reviewDetail.value) return;
        
        reviewDetail.value.detailPlan.forEach(detail => {
            const candidate = detail.candidateList.find(c => c.candidateId === candidateId);
            if (candidate) {
                // 승인 상태 여부 확인 (기존 상태 vs 새로운 상태)
                const isPreviouslyApproved = ['APPROVED', '1', 'REVIEW_PASSED'].includes(candidate.status || '');
                const isNowApproved = ['APPROVED', '1', 'REVIEW_PASSED'].includes(status);

                // 상태 변경에 따른 TO(approvedCount) 업데이트
                if (!isPreviouslyApproved && isNowApproved) {
                    detail.approvedCount = (detail.approvedCount || 0) + 1;
                } else if (isPreviouslyApproved && !isNowApproved) {
                    detail.approvedCount = Math.max(0, (detail.approvedCount || 0) - 1);
                }

                candidate.status = status;
                if (reason) {
                    candidate.rejectionReason = reason;
                }
            }
        });
    };

    return {
        reviewPlans,
        reviewDetail,
        loading,
        getReviewPlans,
        getReviewDetail,
        submitReview
    };
});
