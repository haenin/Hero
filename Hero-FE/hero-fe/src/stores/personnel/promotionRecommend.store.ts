/**
 * <pre>
 * File Name   : promotionRecommend.store.ts
 * Description : 승진 추천 관련 상태 관리 (Pinia)
 *               - 부서장의 승진 후보자 추천 및 조회 기능 담당
 *
 * History
 * 2025/12/22 - 승건 Store 분리 (promotion.store.ts -> promotionRecommend.store.ts)
 * </pre>
 *
 * @author 승건
 * @version 1.0
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
    fetchRecommendPromotionPlans, 
    fetchRecommendPromotionPlanDetail, 
    nominateCandidate, 
    cancelNomination 
} from '@/api/personnel/promotion.api';
import type { 
    PromotionPlanResponseDTO, 
    PromotionPlanDetailResponseDTO, 
    PromotionNominationRequestDTO 
} from '@/types/personnel/promotion.types';

export const usePromotionRecommendStore = defineStore('promotion-recommend', () => {
    const recommendPlans = ref<PromotionPlanResponseDTO[]>([]);
    const recommendPlanDetail = ref<PromotionPlanDetailResponseDTO | null>(null);
    const loading = ref(false);

    const getRecommendPlans = async () => {
        loading.value = true;
        try {
            const response = await fetchRecommendPromotionPlans();
            if (response.data.success) {
                console.log('Store: 추천 계획 목록 수신:', response.data.data);
                recommendPlans.value = response.data.data;
            } else {
                console.error(`추천 가능 계획 조회 API 실패 [${(response.data as any).errorCode}]: ${response.data.message}`);
                recommendPlans.value = [];
            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                console.error(`추천 가능 계획 조회 실패 [${error.response.data.errorCode}]: ${error.response.data.message}`);
            } else {
                console.error('추천 가능 계획 조회 실패:', error);
            }
            recommendPlans.value = [];
        } finally {
            loading.value = false;
        }
    };

    const getRecommendDetail = async (id: number) => {
        loading.value = true;
        try {
            const response = await fetchRecommendPromotionPlanDetail(id);
            if (response.data.success) {
                console.log('Store: 상세 조회 데이터 수신:', response.data.data);
                recommendPlanDetail.value = response.data.data;
            } else {
                console.error(`추천 상세 조회 API 실패 [${(response.data as any).errorCode}]: ${response.data.message}`);
                recommendPlanDetail.value = null;
            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                console.error(`추천 상세 조회 실패 [${error.response.data.errorCode}]: ${error.response.data.message}`);
            } else {
                console.error('추천 상세 조회 실패:', error);
            }
            recommendPlanDetail.value = null;
        } finally {
            loading.value = false;
        }
    };

    const requestNomination = async (data: PromotionNominationRequestDTO) => {
        loading.value = true;
        try {
            const response = await nominateCandidate(data);
            if (!response.data.success) {
                console.error(`후보자 추천 API 실패 [${(response.data as any).errorCode}]: ${response.data.message}`);
            }
            return response.data.success;
        } catch (error: any) {
            if (error.response && error.response.data) {
                console.error(`후보자 추천 실패 [${error.response.data.errorCode}]: ${error.response.data.message}`);
            } else {
                console.error('후보자 추천 실패:', error);
            }
            return false;
        } finally {
            loading.value = false;
        }
    };

    const requestCancelNomination = async (candidateId: number) => {
        loading.value = true;
        try {
            const response = await cancelNomination(candidateId);
            if (!response.data.success) {
                console.error(`추천 취소 API 실패 [${(response.data as any).errorCode}]: ${response.data.message}`);
            }
            return response.data.success;
        } catch (error: any) {
            if (error.response && error.response.data) {
                console.error(`추천 취소 실패 [${error.response.data.errorCode}]: ${error.response.data.message}`);
            } else {
                console.error('추천 취소 실패:', error);
            }
            return false;
        } finally {
            loading.value = false;
        }
    };

    return {
        recommendPlans,
        recommendPlanDetail,
        loading,
        getRecommendPlans,
        getRecommendDetail,
        requestNomination,
        requestCancelNomination
    };
});