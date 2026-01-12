import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchOrganizationChart, fetchDepartmentHistory, fetchGradeHistory } from '@/api/organization/organization.api';
import type { OrganizationNode, DepartmentHistoryResponse, GradeHistoryResponse, ApiResponse } from '@/types/organization/organization.types';

export const useOrganizationStore = defineStore('organization', () => {
  // State
  const organizationChart = ref<OrganizationNode[]>([]);
  const deptHistoryList = ref<DepartmentHistoryResponse[]>([]);
  const gradeHistoryList = ref<GradeHistoryResponse[]>([]);
  const isChartLoading = ref(false);
  const isHistoryLoading = ref(false);
  const chartError = ref<string | null>(null);
  const historyError = ref<string | null>(null);

  // Actions
  const loadOrganizationChart = async () => {
    isChartLoading.value = true;
    chartError.value = null;
    try {
      const response = await fetchOrganizationChart();
      const data = response.data;
      if (data.success && data.data) {
        organizationChart.value = data.data;
      } else {
        organizationChart.value = [];
      }
    } catch (err) {
      chartError.value = '조직도 정보를 불러오는데 실패했습니다.';
      console.error(err);
    } finally {
      isChartLoading.value = false;
    }
  };

  const loadDepartmentHistory = async (employeeId: number) => {
    isHistoryLoading.value = true;
    historyError.value = null;
    try {
      const response = await fetchDepartmentHistory(employeeId);
      const data = response.data;
      
      if (data.success && data.data) {
        deptHistoryList.value = data.data;
      } else {
        deptHistoryList.value = [];
      }
    } catch (err) {
      historyError.value = '부서 이동 이력을 불러오는데 실패했습니다.';
      console.error(err);
    } finally {
      isHistoryLoading.value = false;
    }
  };

  const loadGradeHistory = async (employeeId: number) => {
    isHistoryLoading.value = true;
    historyError.value = null;
    try {
      const response = await fetchGradeHistory(employeeId);
      const data = response.data;

      if (data.success && data.data) {
        gradeHistoryList.value = data.data;
      } else {
        gradeHistoryList.value = [];
      }
    } catch (err) {
      historyError.value = '직급 변경 이력을 불러오는데 실패했습니다.';
      console.error(err);
    } finally {
      isHistoryLoading.value = false;
    }
  };

  return {
    organizationChart,
    deptHistoryList,
    gradeHistoryList,
    isChartLoading,
    isHistoryLoading,
    chartError,
    historyError,
    loadOrganizationChart,
    loadDepartmentHistory,
    loadGradeHistory,
  };
});