<!--
 * <pre>
 * Vue Name        : TreeNode.vue
 * Description     : 조직도 트리 노드 컴포넌트
 *
 * 컴포넌트 연계
 *   - ApprovalLineModal.vue (부모)
 *
 * 주요 기능
 *   - 재귀 트리 구조
 *   - 부서 확장/축소
 *   - 직원 클릭 이벤트 전달
 *
 * History
 * 2025/12/26 (민철) 최초 작성
 * 2025/12/26 (민철) 반응성 수정 (expandedDepartments storeToRefs)
 * 2026/01/06 (민철) 주석 제거
 *
 * </pre>
 *
 * @module approval
 * @author 민철
 * @version 1.2
-->
<template>
    <div>
        <div v-if="node.type === 'department'" :class="['tree-row', `depth-${depth}`]" @click="handleDepartmentClick">
            <img :class="['icon', 'icon-arrow', { 'rotated': isExpanded }]" src="/images/dropdownarrow.svg" alt="" />
            <img class="icon" src="/images/organization.svg" alt="" />
            <span class="node-name">{{ node.departmentName }}</span>
            <span class="node-count">{{ departmentCountText }}</span>
        </div>

        <ul v-if="node.type === 'department' && isExpanded && node.children">
            <li v-for="child in departmentChildren" :key="getNodeKey(child)">
                <TreeNode :node="child" :depth="depth + 1" @employee-click="handleEmployeeClick" />
            </li>

            <template v-if="employeeChildren.length > 0">
                <li v-if="hasDepartmentChildren" :key="`dept-${node.departmentId}-employees`">
                    <div :class="['tree-row', 'employee-list-toggle', `depth-${depth + 1}`]"
                        @click="toggleEmployeeList">
                        <img :class="['icon', 'icon-arrow', { 'rotated': isEmployeeListExpanded }]"
                            src="/images/dropdownarrow.svg" alt="" />
                        <img class="icon" src="/images/organization.svg" alt="" />
                        <span class="node-name">{{ node.departmentName }} 소속 직원</span>
                        <span class="node-count">{{ employeeChildren.length }}명</span>
                    </div>

                    <ul v-if="isEmployeeListExpanded">
                        <li v-for="employee in employeeChildren" :key="getNodeKey(employee)">
                            <div @click="handleEmployeeClick(convertToEmployee(employee))"
                                :class="['user-card', `depth-${depth + 2}`, { 'selected': isSelected(employee.employeeId) }]">
                                <div :class="['avatar', getAvatarColor(employee.employeeName || '')]">
                                    {{ getAvatarInitial(employee.employeeName || '') }}
                                </div>
                                <div class="user-info">
                                    <span class="user-name">
                                        {{ employee.employeeName }} {{ employee.gradeName }}
                                        <span v-if="employee.jobTitleName">({{ employee.jobTitleName }})</span>
                                    </span>
                                    <span class="user-team">{{ node.departmentName }}</span>
                                </div>
                                <div v-if="isSelected(employee.employeeId)" class="check-icon">✓</div>
                            </div>
                        </li>
                    </ul>
                </li>

                <li v-else v-for="employee in employeeChildren" :key="getNodeKey(employee)">
                    <div @click="handleEmployeeClick(convertToEmployee(employee))"
                        :class="['user-card', `depth-${depth + 1}`, { 'selected': isSelected(employee.employeeId) }]">
                        <div :class="['avatar', getAvatarColor(employee.employeeName || '')]">
                            {{ getAvatarInitial(employee.employeeName || '') }}
                        </div>
                        <div class="user-info">
                            <span class="user-name">
                                {{ employee.employeeName }} {{ employee.gradeName }}
                                <span v-if="employee.jobTitleName">({{ employee.jobTitleName }})</span>
                            </span>
                            <span class="user-team">{{ node.departmentName }}</span>
                        </div>
                        <div v-if="isSelected(employee.employeeId)" class="check-icon">✓</div>
                    </div>
                </li>
            </template>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useOrganizationStore } from '@/stores/approval/organization.store';
import { useOrganization } from '@/composables/approval/useOrganization';
import {
    OrganizationTreeNodeDTO,
    OrganizationEmployeeDTO
} from '@/types/approval/organization.types';


interface Props {
    node: OrganizationTreeNodeDTO;
    depth: number;
}

const props = defineProps<Props>();


const emit = defineEmits<{
    (e: 'employee-click', employee: OrganizationEmployeeDTO): void
}>();

const orgStore = useOrganizationStore();
const { selectedEmployees, expandedDepartments } = storeToRefs(orgStore);

const {
    toggleDepartment,
    getAvatarColor,
    getAvatarInitial,
} = useOrganization();

const employeeListExpanded = ref<boolean>(false);


const isExpanded = computed(() => {
    if (props.node.type === 'department' && props.node.departmentId !== undefined) {
        const expanded = expandedDepartments.value.has(props.node.departmentId);
        return expanded;
    }
    return false;
});


const isEmployeeListExpanded = computed(() => employeeListExpanded.value);


const departmentChildren = computed(() => {
    return props.node.children?.filter(child => child.type === 'department') || [];
});

const employeeChildren = computed(() => {
    return props.node.children?.filter(child => child.type === 'employee') || [];
});


const hasDepartmentChildren = computed(() => {
    return departmentChildren.value.length > 0;
});


const departmentCountText = computed(() => {
    const deptCount = departmentChildren.value.length;
    const empCount = employeeChildren.value.length;

    if (deptCount > 0 && empCount > 0) {
        return `${deptCount}개 팀 ${empCount}명`;
    } else if (deptCount > 0) {
        return `${deptCount}개 팀`;
    } else if (empCount > 0) {
        return `${empCount}명`;
    }
    return '';
});


const getNodeKey = (node: OrganizationTreeNodeDTO): string => {
    if (node.type === 'department') {
        return `dept-${node.departmentId}`;
    }
    return `emp-${node.employeeId}`;
};


const isSelected = (employeeId?: number): boolean => {
    if (!employeeId) return false;
    return selectedEmployees.value.some(emp => emp.approverId === employeeId);
};


const handleDepartmentClick = () => {
    if (props.node.type === 'department' && props.node.departmentId !== undefined) {
        toggleDepartment(props.node.departmentId);
    }
};


const toggleEmployeeList = () => {
    employeeListExpanded.value = !employeeListExpanded.value;
};


const handleEmployeeClick = (employee: OrganizationEmployeeDTO) => {
    emit('employee-click', employee);
};


const convertToEmployee = (node: OrganizationTreeNodeDTO): OrganizationEmployeeDTO => {
    return {
        employeeId: node.employeeId || 0,
        employeeName: node.employeeName || '',
        departmentId: props.node.departmentId || 0,
        departmentName: props.node.departmentName || '',
        gradeId: 0,
        gradeName: node.gradeName || '',
        jobTitleId: null,
        jobTitleName: node.jobTitleName || null,
        email: '',
        phone: '',
    };
};
</script>

<style scoped>
.tree-row {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.tree-row:hover {
    background-color: #f5f5f5;
}

.employee-list-toggle {
    background-color: #fafafa;
    border-left: 2px solid #e0e0e0;
}

.employee-list-toggle:hover {
    background-color: #f0f0f0;
}

.icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
}

.icon-arrow {
    transition: transform 0.2s;
}

.icon-arrow.rotated {
    transform: rotate(180deg);
}

.node-name {
    flex: 1;
    font-weight: 500;
}

.node-count {
    font-size: 12px;
    color: #999;
}

ul {
    list-style: none;
    padding-left: 0;
    margin: 0;
}

.user-card {
    display: flex;
    align-items: center;
    padding: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid #f0f0f0;
}

.user-card:hover {
    background-color: #f5f5f5;
}

.user-card.selected {
    background-color: #e3f2fd;
}

.avatar {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    margin-right: 12px;
}

.bg-blue {
    background-color: #2196F3;
}

.bg-purple {
    background-color: #9C27B0;
}

.bg-green {
    background-color: #4CAF50;
}

.bg-orange {
    background-color: #FF9800;
}

.bg-pink {
    background-color: #E91E63;
}

.bg-indigo {
    background-color: #3F51B5;
}

.user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.user-name {
    font-weight: 500;
    margin-bottom: 4px;
}

.user-team {
    font-size: 12px;
    color: #999;
}

.check-icon {
    color: #2196F3;
    font-size: 20px;
    font-weight: bold;
}

.depth-1 {
    padding-left: 12px;
}

.depth-2 {
    padding-left: 24px;
}

.depth-3 {
    padding-left: 36px;
}

.depth-4 {
    padding-left: 48px;
}
</style>