/**
 * <pre>
 * Composable Name : useOrganization.ts
 * Description     : 조직도 관련 재사용 로직
 *
 * 주요 기능
 *   - 조직도 트리 확장/축소
 *   - 직원 선택/해제 토글
 *   - 아바타 색상 생성
 *   - 검색 디바운싱
 *
 * History
 * 2025/12/26 (민철) 최초 작성
 * 2026/01/06 (민철) 주석제거
 *
 * </pre>
 *
 * @author 민철
 * @version 1.1
 */

import { useOrganizationStore } from '@/stores/approval/organization.store';
import { OrganizationEmployeeDTO } from '@/types/approval/organization.types';

export function useOrganization() {
  const orgStore = useOrganizationStore();

  const toggleDepartment = (departmentId: number) => {
    orgStore.toggleDepartment(departmentId);
  };

  const isDepartmentExpanded = (departmentId: number): boolean => {
    return orgStore.isDepartmentExpanded(departmentId);
  };

  const expandAll = () => {
    const collectDepartmentIds = (node: any, ids: Set<number>) => {
      if (node.type === 'department' && node.departmentId) {
        ids.add(node.departmentId);
        if (node.children) {
          node.children.forEach((child: any) => {
            collectDepartmentIds(child, ids);
          });
        }
      }
    };

    if (orgStore.organizationTree) {
      const ids = new Set<number>();
      collectDepartmentIds(orgStore.organizationTree, ids);
      orgStore.expandedDepartments = ids;
    }
  };

  const collapseAll = () => {
    orgStore.expandedDepartments.clear();
  };

  const toggleEmployeeSelection = (employee: OrganizationEmployeeDTO) => {
    const isSelected = orgStore.isEmployeeSelected(employee.employeeId);

    if (isSelected) {
      orgStore.removeSelectedEmployee(employee.employeeId);
    } else {
      orgStore.addSelectedEmployee(employee);
    }
  };

  const isEmployeeSelected = (employeeId: number): boolean => {
    return orgStore.isEmployeeSelected(employeeId);
  };


  const avatarColors = [
    'bg-blue',
    'bg-purple',
    'bg-green',
    'bg-orange',
    'bg-pink',
    'bg-indigo',
  ];

  const getAvatarColor = (name: string): string => {
    const charCode = name.charCodeAt(0);
    const index = charCode % avatarColors.length;
    return avatarColors[index];
  };

  const getAvatarInitial = (name: string): string => {
    return name.charAt(0);
  };


  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  const debouncedSearch = (keyword: string, delay: number = 300) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      orgStore.searchEmployees(keyword);
    }, delay);
  };

  const formatJobTitle = (gradeName: string, jobTitleName?: string | null): string => {
    if (jobTitleName) {
      return `${jobTitleName} ${gradeName}`;
    }
    return gradeName;
  };

  const formatDepartmentCount = (count: number, type: 'department' | 'employee'): string => {
    if (type === 'department') {
      return `${count}개 팀`;
    }
    return `${count}명`;
  };

  return {
    toggleDepartment,
    isDepartmentExpanded,
    expandAll,
    collapseAll,

    toggleEmployeeSelection,
    isEmployeeSelected,

    getAvatarColor,
    getAvatarInitial,

    debouncedSearch,

    formatJobTitle,
    formatDepartmentCount,
  };
}
