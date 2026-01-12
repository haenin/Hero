<template>
  <div class="paging">
    <!-- 이전 -->
    <button
      class="page-btn"
      :disabled="currentPage === 0"
      @click="emitPage(currentPage - 1)"
    >
      이전
    </button>

    <!-- 페이지 번호 -->
    <button
      v-for="page in visiblePages"
      :key="page"
      class="page-btn"
      :class="{ active: page === currentPage }"
      @click="emitPage(page)"
    >
      {{ page + 1 }}
    </button>

    <!-- 다음 -->
    <button
      class="page-btn"
      :disabled="currentPage === totalPages - 1"
      @click="emitPage(currentPage + 1)"
    >
      다음
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: number;
  totalPages: number;
  windowSize?: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const currentPage = computed(() => props.modelValue);

const visiblePages = computed(() => {
  const total = props.totalPages;
  if (!total || total <= 0) return [];

  const size = props.windowSize ?? 3;
  const half = Math.floor(size / 2);

  let start = currentPage.value - half;
  let end = currentPage.value + half;

  if (start < 0) {
    start = 0;
    end = Math.min(total - 1, size - 1);
  }

  if (end >= total) {
    end = total - 1;
    start = Math.max(0, end - size + 1);
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const emitPage = (page: number) => {
  if (page < 0 || page >= props.totalPages) return;
  emit('update:modelValue', page);
};
</script>

<style scoped>
.paging {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.page-btn {
  padding: 5px 12px;
  border-radius: 4px;
  border: 1px solid #cad5e2;
  background: white;
  color: #62748e;
  font-size: 14px;
  cursor: pointer;
}

.page-btn.active {
  background: #155dfc;
  color: white;
  border: none;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>