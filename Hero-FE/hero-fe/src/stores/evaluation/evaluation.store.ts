import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchEmployeeEvaluationList } from '@/api/evaluation/evaluation.api';
import type { EmployeeEvaluationListResponseDTO } from '@/types/evaluation/evaluation.types';

export const useEvaluationStore = defineStore('evaluation', () => {
  // State
  const evaluationList = ref<EmployeeEvaluationListResponseDTO[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  /**
   * 특정 직원의 평가 이력 목록을 조회합니다.
   * @param employeeId 직원 ID
   */
  const getEvaluationList = async (employeeId: number) => {
    loading.value = true;
    error.value = null;
    evaluationList.value = [];

    try {
      const response = await fetchEmployeeEvaluationList(employeeId);
      if (response.data.success) {
        evaluationList.value = response.data.data;
      } else {
        error.value = response.data.message || '평가 목록을 불러오는데 실패했습니다.';
      }
    } catch (err: any) {
      console.error('평가 목록 조회 에러:', err);
      error.value = err.response?.data?.message || '서버 통신 중 오류가 발생했습니다.';
    } finally {
      loading.value = false;
    }
  };

  return {
    evaluationList,
    loading,
    error,
    getEvaluationList
  };
});
