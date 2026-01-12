<template>
  <li class="tree-item" v-if="department">
    <div class="item-content" @click.stop="$emit('edit', department)">
      <div class="info-group">
        <span class="dept-name">{{ department.departmentName || '(부서명 없음)' }}</span>
        <span class="dept-info" v-if="department.departmentPhone">📞 {{ department.departmentPhone }}</span>
        <span class="dept-info" v-if="department.manager">👤 {{ managerDisplay }}</span>
      </div>
      <div class="actions">
        <button @click.stop="$emit('add', department)" class="btn-icon add" title="하위 부서 추가">+</button>
        <button @click.stop="$emit('remove', department)" class="btn-icon remove" title="부서 삭제">-</button>
      </div>
    </div>
    
    <!-- 자식 부서가 있을 경우 재귀 호출 -->
    <ul v-if="department.children && department.children.length" class="sub-tree">
      <DepartmentTreeItem 
        v-for="(child, index) in department.children" 
        :key="child.departmentId" 
        :department="child" 
        @add="$emit('add', $event)"
        @edit="$emit('edit', $event)"
        @remove="handleChildRemove(index)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SettingsDepartmentResponseDTO } from '@/types/settings';

const props = defineProps<{
  department: SettingsDepartmentResponseDTO;
}>();

defineEmits(['add', 'remove', 'edit']);

const managerDisplay = computed(() => {
  const mgr = props.department.manager;
  if (mgr) {
    return mgr.employeeName ? `${mgr.employeeName} ${mgr.jobTitle ? `(${mgr.jobTitle})` : ''}` : `(ID: ${mgr.employeeId})`;
  }
  return '';
});

const handleChildRemove = (index: number) => {
  props.department.children.splice(index, 1);
};
</script>

<style scoped>
.tree-item {
  list-style: none;
  margin: 4px 0;
}

.item-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 4px;
  justify-content: space-between;
  min-height: 42px;
}

.dept-name {
  font-weight: 600;
  color: #334155;
  margin-right: 8px;
}

.dept-info {
  font-size: 0.85rem;
  color: #64748b;
  margin-right: 8px;
}

.sub-tree {
  padding-left: 24px;
  border-left: 1px solid #e2e8f0;
  margin-left: 12px;
}

/* 호버 효과 */
.item-content:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.item-content:hover .actions {
  opacity: 1;
}

.btn-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.info-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.edit-form {
  display: flex;
  gap: 8px;
  flex: 1;
  margin-right: 8px;
}

.edit-input {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 120px;
}

.edit-actions {
  display: flex;
  gap: 4px;
}

.btn-text {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-text.save {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-text.cancel {
  background-color: #f1f5f9;
  color: #475569;
}
</style>