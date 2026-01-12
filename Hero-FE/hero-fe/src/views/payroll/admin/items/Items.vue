<!-- 
 * <pre>
 * Vue Name : Items.vue
 * Description     : 급여 항목 관리(수당/공제수당)(관리자)
 *
 * History
 *   2025/12/09 - 동근 최초 작성
 *   2025/12/23 - 탭 컴포넌트로 분리
 * </pre>
 *
 * @module payroll-items
 * @author 동근
 * @version 2.0
-->
<template>
  <div class="items-page">
    <div class="panel">
      <div class="panel-tabs">
        <button
          class="tab tab-left"
          :class="{ 'tab-active': activeTab === 'allowance' }"
          @click="activeTab = 'allowance'"
        >
          수당 관리
        </button>

        <button
          class="tab tab-right"
          :class="{ 'tab-active': activeTab === 'deduction' }"
          @click="activeTab = 'deduction'"
        >
          공제 관리
        </button>
      </div>

      <div class="panel-body">
        <AllowanceTab v-if="activeTab === 'allowance'" />
        <DeductionTab v-else />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AllowanceTab from './AllowanceTab.vue';
import DeductionTab from './DeductionTab.vue';

type TabKey = 'allowance' | 'deduction';
const activeTab = ref<TabKey>('allowance');
</script>

<style scoped>
.items-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.panel {
  width: 100%;
  background: transparent;
  border-radius: 0;
  display: flex;
  flex-direction: column;
}

.panel-tabs {
  display: inline-flex;
  gap: 0;
  margin-bottom:0;
}

.tab {
  width: 95px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  color: #62748e;
  cursor: pointer;
  padding: 10px;
}

.tab-left {
  border-left: 1px solid #e2e8f0;
  border-top-left-radius: 14px;
  border-bottom-left-radius: 0;
}

.tab-right {
  border-top-right-radius: 14px;
  border-bottom-right-radius: 0;
}

.tab + .tab {
  border-left: none;
}

.tab-active {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: #ffffff;
  font-weight: 700;
}

.panel-body {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-top: none;    
  border-radius: 0 14px 14px 14px; 
  padding: 16px 0 24px;
}
</style>
