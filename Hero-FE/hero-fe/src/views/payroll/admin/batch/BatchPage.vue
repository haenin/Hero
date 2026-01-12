<!--
 * <pre>
 * Vue Name        : BatchPage.vue
 * Description     : 관리자 - 월별 급여 배치 탭 컨테이너 페이지
 *                  (배치 관리 / 급여 계산 / 급여 승인)
 *
 * History
 *   2025/12/15 - 동근 최초 작성
 *   2025/12/15 - 동근 탭 전환 로직 구현
 * </pre>
 *
 * @module payroll-admin-batch-page
 * @author 동근
 * @version 1.1
 -->
<template>
  <div class="batch-page">
    <div class="panel">
      <div class="panel-tabs">
        <button
          class="tab tab-left"
          :class="{ 'tab-active': activeTab === 'batch' }"
          @click="activeTab = 'batch'"
        >
          급여 배치
        </button>

        <button
          class="tab"
          :class="{ 'tab-active': activeTab === 'calculate' }"
          :disabled="!store.selectedBatchId"
          title="배치를 먼저 선택하세요"
          @click="activeTab = 'calculate'"
        >
          급여 계산
        </button>

        <button
          class="tab tab-right"
          :class="{ 'tab-active': activeTab === 'confirm' }"
          :disabled="!store.selectedBatchId"
          title="배치를 먼저 선택하세요"
          @click="activeTab = 'confirm'"
        >
          급여 승인
        </button>
      </div>

      <div class="panel-body">
        <PayrollBatchTab
          v-if="activeTab === 'batch'"
          @select="onSelectBatch"
          @next="goToCalculate"
        />

        <PayrollCalculateTab
          v-else-if="activeTab === 'calculate'"
          @back="activeTab = 'batch'"
          @next="activeTab = 'confirm'"
        />

        <PayrollConfirmTab
          v-else
          @back="activeTab = 'calculate'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PayrollBatchTab from './PayrollBatchTab.vue';
import PayrollCalculateTab from './PayrollCalculateTab.vue';
import PayrollConfirmTab from './PayrollConfirmTab.vue';
import { usePayrollAdminStore } from '@/stores/payroll/payrollBatchStore';

type TabKey = 'batch' | 'calculate' | 'confirm';

const store = usePayrollAdminStore();
const activeTab = ref<TabKey>('batch');

const onSelectBatch = async (batchId: number) => {
  await store.selectBatch(batchId);
};

const goToCalculate = () => {
  if (!store.selectedBatchId) return;
  activeTab.value = 'calculate';
};
</script>

<style scoped>
.batch-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.panel-tabs {
  display: inline-flex;
 gap: 0;
}

.tab {
  width: 95px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
border: 1px solid #e2e8f0;
border-bottom: none;
  font-size: 14px;
  color: #62748e;
  cursor: pointer;
  padding: 10px;
}

.tab-left {
  border-top-left-radius: 14px;
}

.tab-right {
  border-top-right-radius: 14px;
}

.tab-active {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: #ffffff;
  font-weight: 700;
}

.tab:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.panel-body {
    background: #ffffff; 
  border: 1px solid #e2e8f0; 
  border-radius: 14px;
   border-top-left-radius: 0;
 border-top-right-radius: 0;
 border-top: none;
  padding: 20px 0 12px;
}

.tab + .tab {
  border-left: none;
}

</style>
