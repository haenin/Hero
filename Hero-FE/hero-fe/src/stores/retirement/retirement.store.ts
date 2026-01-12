import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getRetirementSummary,
  getExitReasonStats,
  getTenureDistributionStats,
  getNewHireStats,
  getDepartmentTurnoverStats,
} from '@/api/retirement/retirement.api';
import type {
  RetirementSummaryDTO,
  ExitReasonStatDTO,
  TenureDistributionDTO,
  NewHireStatDTO,
  DepartmentTurnoverDTO,
} from '@/types/retirement/retirement.types';

export const useRetirementStore = defineStore('retirement', () => {
  // State
  const summary = ref<RetirementSummaryDTO | null>(null);
  const earlyLeavers = ref<ExitReasonStatDTO[]>([]);
  const totalLeavers = ref<ExitReasonStatDTO[]>([]);
  const tenureStats = ref<TenureDistributionDTO[]>([]);
  const newHireStats = ref<NewHireStatDTO[]>([]);
  const departmentStats = ref<DepartmentTurnoverDTO[]>([]);
  const loading = ref(false);

  // Actions
  const fetchRetirementData = async () => {
    loading.value = true;
    try {
      const [sumRes, reasonRes, tenureRes, newHireRes, deptRes] = await Promise.all([
        getRetirementSummary(),
        getExitReasonStats(),
        getTenureDistributionStats(),
        getNewHireStats(),
        getDepartmentTurnoverStats(),
      ]);

      summary.value = sumRes.data;
      earlyLeavers.value = reasonRes.data.earlyLeavers;
      totalLeavers.value = reasonRes.data.totalLeavers;
      tenureStats.value = tenureRes.data;
      newHireStats.value = newHireRes.data;
      departmentStats.value = deptRes.data;
    } catch (error) {
      console.error('Failed to fetch retirement data:', error);
    } finally {
      loading.value = false;
    }
  };

  return {
    summary,
    earlyLeavers,
    totalLeavers,
    tenureStats,
    newHireStats,
    departmentStats,
    loading,  
    fetchRetirementData,
  };
});
