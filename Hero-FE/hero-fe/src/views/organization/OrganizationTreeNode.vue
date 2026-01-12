<template>
  <li class="tree-node">
    <!-- 부서 노드 -->
    <div class="department-content" @click="handleNodeClick" :class="{ 'is-card': isForList, 'selected': isForList && isSelected }">
      <span class="toggle-icon" :class="{ 'is-open': isOpen, 'is-hidden': isLeaf }">
        <img src="/images/dropdownArrow.png" class="arrow-img" alt="toggle" />
      </span>
      <span class="department-name">{{ node.departmentName }}</span>
      <span class="member-count" v-if="totalMembers > 0">({{ totalMembers }})</span>
    </div>

    <!-- 자식 노드 (하위 부서 및 직원) -->
    <ul v-show="isOpen" class="child-list">
      <!-- 하위 부서 (재귀 렌더링) -->
      <OrganizationTreeNode
        v-for="child in node.children"
        :key="child.departmentId"
        :node="child"
        :is-for-list="isForList"
        :selected-department-id="selectedDepartmentId"
        @select-employee="$emit('select-employee', $event)"
        @select-department="$emit('select-department', $event)"
      />
      
      <!-- 소속 직원 -->
      <template v-if="!isForList">
        <li v-for="emp in node.employees" :key="emp.employeeId" class="employee-node">
          <div class="employee-card" @click.stop="$emit('select-employee', emp.employeeId)">
            <div class="profile-img-wrapper">
               <img v-if="!imageErrorIds.has(emp.employeeId)"
                 :src="getProfileImageUrl(emp.imagePath)" 
                 @error="onImageError(emp.employeeId)"
                 class="profile-img" 
                 alt="profile" 
               />
               <div v-else class="profile-initial">{{ emp.employeeName.charAt(0) }}</div>
            </div>
            <div class="employee-info">
              <div class="employee-name">{{ emp.employeeName }} <span class="employee-grade">{{ emp.gradeName }}</span></div>
              <div class="employee-job">{{ emp.jobTitleName }}</div>
            </div>
          </div>
        </li>
      </template>
    </ul>
  </li>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { OrganizationNode } from '@/types/organization/organization.types';

const props = defineProps<{
  node: OrganizationNode;
  isForList?: boolean;
  selectedDepartmentId?: number | null;
}>();

const emit = defineEmits(['select-employee', 'select-department']);

const isOpen = ref(true); // 기본적으로 펼침 상태
const imageErrorIds = ref(new Set<number>());

const isSelected = computed(() => {
  return props.node.departmentId === props.selectedDepartmentId;
});

const isLeaf = computed(() => {
  if (props.isForList) {
    return !props.node.children || props.node.children.length === 0;
  }
  return (!props.node.children || props.node.children.length === 0) && 
         (!props.node.employees || props.node.employees.length === 0);
});

const getRecursiveMemberCount = (node: OrganizationNode): number => {
  let count = node.employees?.length || 0;
  if (node.children) {
    for (const child of node.children) {
      count += getRecursiveMemberCount(child);
    }
  }
  return count;
};

const totalMembers = computed(() => {
  if (props.isForList) {
    return getRecursiveMemberCount(props.node);
  }
  return props.node.employees ? props.node.employees.length : 0;
});

const handleNodeClick = () => {
  if (!isLeaf.value) {
    isOpen.value = !isOpen.value;
  }
  if (props.isForList) {
    emit('select-department', props.node);
  }
};

// 프로필 이미지 URL 처리 (TheHeader.vue 로직 재사용)
const getProfileImageUrl = (path?: string) => {
  return path || '';
};

const onImageError = (id: number) => {
  imageErrorIds.value.add(id);
};
</script>

<style scoped>
.tree-node {
  list-style: none;
  margin: 0;
  padding: 0;
}

.department-content {
  display: flex;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.department-content:hover .department-name {
  color: #1c398e;
  font-weight: 700;
}

.department-content.is-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 4px 0;
  transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.department-content.is-card:hover {
  border-color: #c7d2fe;
  background-color: #f8fafc;
}

.department-content.is-card.selected {
  background-color: #eef2ff;
  border-color: #4f46e5;
}

.department-content.is-card.selected .department-name {
  color: #1c398e;
  font-weight: 700;
}

.toggle-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  transition: transform 0.2s;
}

.toggle-icon.is-open {
  transform: rotate(180deg);
}

.toggle-icon.is-hidden {
  visibility: hidden;
}

.arrow-img {
  width: 12px;
  height: 8px;
}

.department-name {
  font-weight: 600;
  font-size: 15px;
  color: #333;
}

.member-count {
  margin-left: 6px;
  font-size: 13px;
  color: #888;
}

.child-list {
  padding-left: 24px;
  margin: 0;
  border-left: 1px solid #e2e8f0;
}

.employee-node {
  list-style: none;
  margin: 4px 0;
}

.employee-card {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  width: fit-content;
  min-width: 200px;
}

.employee-card:hover {
  border-color: #1c398e;
  box-shadow: 0 2px 8px rgba(28, 57, 142, 0.1);
}

.profile-img-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  background-color: #f1f5f9;
  flex-shrink: 0;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-initial {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.employee-info {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.employee-grade {
  font-size: 12px;
  color: #64748b;
  font-weight: normal;
  margin-left: 4px;
}

.employee-job {
  font-size: 12px;
  color: #94a3b8;
}
</style>