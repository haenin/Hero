/**
 * <pre>
 * Store Name      : organization_store.ts
 * Description     : 조직도 상태 관리
 *
 * 주요 상태
 *   - organizationTree  : 조직도 트리 구조
 *   - searchResults     : 검색 결과
 *   - selectedEmployees : 선택된 직원 목록
 *
 * 주요 액션
 *   - fetchOrganizationTree : 조직도 조회
 *   - searchEmployees       : 직원 검색
 *   - addSelectedEmployee   : 직원 선택
 *   - removeSelectedEmployee: 직원 선택 해제
 *
 * History
 *   2025/12/26 (민철) 최초 작성
 *   2025/12/26 (민철) toggleDepartment 반응성 수정
 *
 * </pre>
 *
 * @author 민철
 * @version 1.1
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getOrganizationTree,
  searchEmployees as apiSearchEmployees,
} from '@/api/approval/organization.api';
import {
  OrganizationTreeNodeDTO,
  OrganizationEmployeeDTO,
  SelectedApproverDTO,
  EmployeeSearchRequestDTO,
} from '@/types/approval/organization.types';

export const useOrganizationStore = defineStore('organization', () => {
  const organizationTree = ref<OrganizationTreeNodeDTO | null>(null);

  const searchResults = ref<OrganizationEmployeeDTO[]>([]);

  const searchKeyword = ref<string>('');

  const selectedEmployees = ref<SelectedApproverDTO[]>([]);

  const isLoading = ref<boolean>(false);

  const expandedDepartments = ref<Set<number>>(new Set());

  const selectedCount = computed(() => selectedEmployees.value.length);

  const isEmployeeSelected = computed(() => {
    return (employeeId: number) => {
      return selectedEmployees.value.some(emp => emp.approverId === employeeId);
    };
  });


  const fetchOrganizationTree = async () => {
    try {
      isLoading.value = true;
      const data = await getOrganizationTree();
      organizationTree.value = data.root;
    } catch (error) {
      console.error('조직도 조회 실패:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 직원 검색
   */
  const searchEmployees = async (keyword: string) => {
    try {
      isLoading.value = true;
      searchKeyword.value = keyword;

      if (!keyword.trim()) {
        searchResults.value = [];
        return;
      }

      const params: EmployeeSearchRequestDTO = { keyword };
      const data = await apiSearchEmployees(params);
      searchResults.value = data.employees;
    } catch (error) {
      console.error('❌ 직원 검색 실패:', error);
      searchResults.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 검색 결과 초기화
   */
  const clearSearchResults = () => {
    searchResults.value = [];
    searchKeyword.value = '';
  };

  /**
   * 직원 선택 추가
   */
  const addSelectedEmployee = (employee: OrganizationEmployeeDTO) => {
    // 중복 체크
    const exists = selectedEmployees.value.some(
      emp => emp.approverId === employee.employeeId
    );

    if (exists) {
      console.warn('⚠️ 이미 선택된 직원입니다:', employee.employeeName);
      return;
    }

    // SelectedApproverDTO 형태로 변환
    const selected: SelectedApproverDTO = {
      approverId: employee.employeeId,
      approverName: employee.employeeName,
      departmentId: employee.departmentId,
      departmentName: employee.departmentName,
      gradeName: employee.gradeName,
      jobTitleName: employee.jobTitleName || '',
    };

    selectedEmployees.value.push(selected);
  };

  /**
   * 직원 선택 해제
   */
  const removeSelectedEmployee = (employeeId: number) => {
    selectedEmployees.value = selectedEmployees.value.filter(
      emp => emp.approverId !== employeeId
    );
  };

  /**
   * 모든 선택 해제
   */
  const clearSelectedEmployees = () => {
    selectedEmployees.value = [];
  };

  /**
   * Store 초기화
   */
  const resetStore = () => {
    organizationTree.value = null;
    searchResults.value = [];
    searchKeyword.value = '';
    selectedEmployees.value = [];
    expandedDepartments.value = new Set();
    isLoading.value = false;
  };


  /* ========================================== */
  /* 트리 확장/축소 */
  /* ========================================== */

  /**
   * 부서 확장/축소 토글
   * ✅ Set을 새로 생성해서 재할당 (Vue 반응성 보장)
   */
  const toggleDepartment = (departmentId: number) => {
    const newSet = new Set(expandedDepartments.value);

    if (newSet.has(departmentId)) {
      newSet.delete(departmentId);
    } else {
      newSet.add(departmentId);
    }

    // ✅ 새 Set으로 재할당 (Vue가 변경 감지)
    expandedDepartments.value = newSet;

    console.log('🔄 toggleDepartment:', departmentId, 'expanded:', expandedDepartments.value);
  };

  /**
   * 부서가 확장되었는지 확인
   */
  const isDepartmentExpanded = (departmentId: number): boolean => {
    return expandedDepartments.value.has(departmentId);
  };


  /* ========================================== */
  /* Return */
  /* ========================================== */

  return {
    // State
    organizationTree,
    searchResults,
    searchKeyword,
    selectedEmployees,
    isLoading,
    expandedDepartments,

    // Getters
    selectedCount,
    isEmployeeSelected,

    // Actions
    fetchOrganizationTree,
    searchEmployees,
    clearSearchResults,
    addSelectedEmployee,
    removeSelectedEmployee,
    clearSelectedEmployees,
    resetStore,
    toggleDepartment,
    isDepartmentExpanded,
  };
});