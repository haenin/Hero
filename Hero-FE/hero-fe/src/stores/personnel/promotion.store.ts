/**
 * <pre>
 * File Name   : promotion.store.ts
 * Description : 승진 계획 관련 상태 관리(Pinia)
 *
 * History
 * 2025/12/19 - 승건 최초 작성
 * </pre>
 *
 * @author 승건
 * @version 1.0
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchPromotionPlans, fetchPromotionOptions, registerPromotionPlan, fetchPromotionPlanDetail } from '@/api/personnel/promotion.api';
import type { PromotionPlanResponseDTO, PromotionOptionsDTO, PromotionPlanRequestDTO, PromotionPlanDetailResponseDTO } from '@/types/personnel/promotion.types';
import type { PageResponse } from '@/api/personnel/promotion.api';

export const usePromotionStore = defineStore('promotion', () => {
    const plans = ref<PromotionPlanResponseDTO[]>([]);
    const planDetail = ref<PromotionPlanDetailResponseDTO | null>(null);
    const options = ref<PromotionOptionsDTO | null>(null);
    // API의 0-based 페이지 인덱스를 저장
    const apiPage = ref(0);
    const totalPages = ref(1);
    const size = ref(10);
    const loading = ref(false);
    // false: 진행중, true: 종료
    const filterIsFinished = ref<boolean>(false);

    // UI에 표시할 1-based 페이지 번호
    const currentPage = computed(() => apiPage.value + 1);

    const fetchPlans = async (page: number = 1) => { // 1-based 페이지를 인자로 받음
        loading.value = true;
        try {
            const response = await fetchPromotionPlans({
                isFinished: filterIsFinished.value,
                page: page - 1, // API를 위해 0-based로 변환
                size: size.value,
            });

            if (response.data.success) {
                const pageData = response.data.data as PageResponse<PromotionPlanResponseDTO>;
                plans.value = pageData.content;
                apiPage.value = pageData.page;
                totalPages.value = pageData.totalPages > 0 ? pageData.totalPages : 1;
            } else {
                console.error('승진 계획 조회 실패:', response.data.error);
                plans.value = [];
                totalPages.value = 1;
            }
        } catch (error) {
            console.error('승진 계획 조회 중 에러 발생:', error);
            plans.value = [];
            totalPages.value = 1;
        } finally {
            loading.value = false;
        }
    };

    const setFilter = (isFinished: boolean) => {
        filterIsFinished.value = isFinished;
        fetchPlans(1); // 필터 변경 시 1페이지부터 다시 조회
    };

    const getPlanDetail = async (id: number) => {
        loading.value = true;
        try {
            const response = await fetchPromotionPlanDetail(id);
            if (response.data.success) {
                planDetail.value = response.data.data;
            } else {
                console.error('상세 조회 실패:', response.data.error);
                planDetail.value = null;
            }
        } catch (error) {
            console.error('상세 조회 에러:', error);
            planDetail.value = null;
        } finally {
            loading.value = false;
        }
    };

    const getOptions = async () => {
        try {
            const response = await fetchPromotionOptions();
            if (response.data.success) {
                options.value = response.data.data;
            }
        } catch (error) {
            console.error('옵션 조회 실패:', error);
        }
    };

    const createPlan = async (data: PromotionPlanRequestDTO) => {
        loading.value = true;
        try {
            const response = await registerPromotionPlan(data);
            return response.data.success;
        } catch (error) {
            console.error('승진 계획 등록 실패:', error);
            return false;
        } finally {
            loading.value = false;
        }
    };

    return { 
        plans, planDetail, options, loading, filterIsFinished, currentPage, totalPages, 
        fetchPlans, setFilter, getPlanDetail, getOptions, createPlan 
    };
});