<!-- 
 * <pre>
 * Vue Name : Adjust.vue
 * Description     : 급여 조정(관리자) 탭 컨테이너 페이지
 *
 * History
 *   2025/12/09 - 동근 최초 작성
 *   2025/12/31 - 조정 요청(결재) /수기 조정 탭 추가
 * </pre>
 *
 * @module payroll-adjust
 * @author 동근
 * @version 1.1
-->
<template>
  <div class="adjust-page">
    <div class="panel">
      <div class="panel-tabs">
        <!-- <button
          class="tab tab-left"
          :class="{ 'tab-active': activeTab === 'approval' }"
          @click="activeTab = 'approval'"
        >
          조정 요청(결재)
        </button> -->
<!-- 
        <button
          class="tab tab-right"
          :class="{ 'tab-active': activeTab === 'manual' }"
          @click="activeTab = 'manual'"
        >
          수기 조정
        </button> -->
      </div>

      <div class="panel-body">
        <ApprovalAdjustmentTab v-if="activeTab === 'approval'" />
        <!-- <ManualAdjustmentTab v-else /> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import ApprovalAdjustmentTab from './ApprovalAdjustmentTab.vue';

type TabKey = 'approval' | 'manual';

const activeTab = ref<TabKey>('approval');

</script>

<style scoped>
.adjust-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 24px;
}

.panel {
  width: 100%;
  background: #ffffff;
  border-radius: 14px;
  border: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-tabs {
  display: inline-flex;
  border-bottom: 1px solid #e2e8f0;
}

.tab {
  width: 146px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-top: 2px solid #e2e8f0;
  border-bottom: 2px solid #e2e8f0;
  border-right: 2px solid #e2e8f0;
  font-size: 14px;
  color: #62748e;
  cursor: pointer;
  padding: 0;
}

.tab-left {
  border-left: 2px solid #e2e8f0;
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
  padding: 20px 0 24px;
}
</style>
