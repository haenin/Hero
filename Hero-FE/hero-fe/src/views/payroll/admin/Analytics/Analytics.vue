<!--
 * <pre>
 * Vue Name : Analytics.vue
 * Description     : 급여 보고서(관리자) 탭 컨테이너 페이지
 *
 * History
 *   2026/01/02 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-Analytics
 * @author 동근
 * @version 1.0
-->
<template>
  <div class="report-page">
    <div class="panel">
      <div class="panel-top">
        <div class="panel-tabs">
          <button
            class="tab tab-left"
            :class="{ 'tab-active': activeTab === 'summary' }"
            @click="activeTab = 'summary'"
          >
            전체 요약
          </button>

          <button
            class="tab"
            :class="{ 'tab-active': activeTab === 'structure' }"
            @click="activeTab = 'structure'"
          >
            구조 분석
          </button>

          <button
            class="tab tab-right"
            :class="{ 'tab-active': activeTab === 'org' }"
            @click="activeTab = 'org'"
          >
            조직별 분석
          </button>
        </div>

        <div class="toolbar">
          <div class="toolbar-right">
            <span class="toolbar-label"></span>
            <select v-model="selectedMonth" class="select">
              <option v-for="m in monthOptions" :key="m" :value="m">
                {{ m }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="panel-body">
        <ReportSummaryTab v-if="activeTab === 'summary'" :month="selectedMonth" />
        <ReportStructureTab v-else-if="activeTab === 'structure'" :month="selectedMonth" />
        <ReportOrgTab v-else :month="selectedMonth" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { YearMonth } from '@/types/payroll/payroll-analytics.types';

import ReportSummaryTab from './AnalyticsSummaryTab.vue';
import ReportStructureTab from './AnalyticsStructureTab.vue';
import ReportOrgTab from './AnalyticsOrgTab.vue';

type TabKey = 'summary' | 'structure' | 'org';

const activeTab = ref<TabKey>('summary');

const monthOptions = computed(() => {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const pad = (n: number) => String(n).padStart(2, '0');

  const list: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    list.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  }
  return list;
});

const selectedMonth = ref<YearMonth>(monthOptions.value[0] as YearMonth);
</script>

<style scoped>
.report-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 24px;
}

.panel {
  width: 100%;
  background: transparent;
  border-radius: 0px;
  border: 0;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.panel-top {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  border-bottom: 0;
  margin-bottom: 0;
  position: relative;
  z-index: 2; 
}

.panel-tabs {
  display: inline-flex;
  gap:0;
}

.tab {
  width: 95px;
  padding:10px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  color: #62748e;
  cursor: pointer;
  border-bottom: none; 
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
  border-bottom: none;
}

.tab:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 0;
  background: transparent;
}

.toolbar-right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.toolbar-label {
  font-size: 13px;
  font-weight: 800;
  color: #334155;
}

.select {
  height: 34px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 13px;
  color: #0f172a;
}

.panel-body {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  border-top-left-radius: 0;  
  border-top-right-radius: 0; 
  padding: 20px 0 24px;
}
</style>
