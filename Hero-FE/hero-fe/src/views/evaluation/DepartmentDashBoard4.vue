<!-- 
  File Name   : DepartmentDashBoard5.vue
  Description : 부서별 역량 대시보드: 평가 가이드 위반 페이지
 
  History
  2025/12/28 - 승민 최초 작성
 
  @author 승민
-->

<!--template-->
<template>
  <div class="page">
    <div class="content-wrapper">

      <!-- Tabs -->
      <div class="tabs">
        <div class="inbox-tabs">
          <button 
            class="tab tab-start"
            @click="goAvgScore"
          >
            부서별 평균 점수
          </button>
          <button
            class="tab"
            @click="goDeviation"
          >
            직급별 점수 편차
          </button>
          <button 
            class="tab"
            @click="goComparison"
          >
            부서별 전분기 비교
          </button>
          <button 
            class="tab active"
            @click="goViolation"
          >
            평가 가이드 라인 위반
          </button>
          <button 
            class="tab tab-end"
            @click="goRecommendation"
          >
            우수 사원 추천
          </button>
        </div>
      </div>

      <div class="list-box">
        <div class="violation-container">
          <!-- 평가 템플릿 선택 -->
          <div class="filter-box">
            <select v-model="selectedTemplateId" @change="analyzeViolation">
              <option
                v-for="t in templates"
                :key="t.evaluationTemplateId"
                :value="t.evaluationTemplateId"
              >
                {{ t.evaluationTemplateName }}
              </option>
            </select>
          </div>

          <!-- 분석 중 -->
          <div
            v-if="loadingDashboard || analyzing"
            class="loading-overlay"
          >
            <div class="spinner"></div>

            <p v-if="loadingDashboard">
              AI가 평가 가이드 위반 여부를 분석 중입니다.(1~2분 정도 시간이 소요됩니다.)
            </p>

            <p v-else>
              AI가 평가 가이드 위반 여부를 분석 중입니다.(1~2분 정도 시간이 소요됩니다.)
            </p>
          </div>

          <!-- 위반 결과 -->
          <div
            v-if="!loadingDashboard && !analyzing"
            class="promotion-wrapper"
          >

            <div
              v-for="(v, idx) in violations"
              :key="idx"
              class="promotion-card violation"
            >
              <!-- 카드 상단 -->
              <div class="card-top">
                <div class="left">
                  <div class="rank-badge warning">⚠</div>
                  <div>
                    <div class="name">{{ v.managerName }} 부장</div>
                    <div class="sub">
                      {{ v.departmentName }}  {{ v.templateName }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="divider"></div>

              <!-- 위반 항목 -->
              <div class="section">
                <div class="section-title">평가 가이드 위반 사항</div>

                <ul class="violation-list">
                  <li
                    v-for="(item, i) in v.violations"
                    :key="i"
                    class="violation-item"
                  >
                    <div class="violation-header">
                      <span class="person">{{ item['피평가자'] }}</span>
                      <span class="dot">•</span>
                      <span class="category">{{ item['항목'] }}</span>
                    </div>
                    <div class="violation-reason">
                      {{ item['위반 사유'] }}
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div
              v-if="hasAnalyzed && violations.length === 0"
              class="empty-box"
            >
              해당 평가 템플릿에서 가이드 위반이 발견되지 않았습니다.
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<!--script-->
<script setup lang="ts">
//Import 구문
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import apiClient from "@/api/apiClient";

//외부 로직
const router = useRouter();

//Reactive 데이터
const analyzing = ref(false);
const dashboardData = ref<any[]>([]);
const templates = ref<any[]>([]);
const violations = ref<any[]>([]);
const selectedTemplateId = ref<number | null>(null);
const hasAnalyzed = ref(false);
const loadingDashboard = ref(false);

/**
 * 설명: 부서별 평균 점수 페이지로 이동하는 메소드
 */
const goAvgScore = () => {
    router.push('/evaluation/department/dashboard')
}

/**
 * 설명: 직급별 점수 편차 페이지로 이동하는 메소드
 */
const goDeviation = () => {
    router.push('/evaluation/department/dashboard2')
}

/**
 * 설명: 부서별 전분기 페이지로 이동하는 메소드
 */
const goComparison = () => {
    router.push('/evaluation/department/dashboard3')
}

/**
 * 설명: 평가 가이드라인 위반 페이지로 이동하는 메소드
 */
const goViolation = () => {
    router.push('/evaluation/department/dashboard4')
}

/**
 * 설명: 승진 대상자 추천 페이지로 이동하는 메소드
 */
const goRecommendation = () => {
    router.push('/evaluation/department/dashboard5')
}

/**
 * 설명: 대시보드 데이터 로드 메서드
 */
const loadDashboard = async () => {
  loadingDashboard.value = true;

  try {
    const { data } = await apiClient.get("/evaluation/dashboard/all");
    dashboardData.value = data;
    templates.value = data;
    selectedTemplateId.value = data[0]?.evaluationTemplateId ?? null;

    if (selectedTemplateId.value) {
      await analyzeViolation();
    }
  } catch (e) {
    console.error(e);
    alert("대시보드 데이터를 불러오지 못했습니다.");
  } finally {
    loadingDashboard.value = false;
  }
};

/**
 * 설명: 위반 사항 분석 메서드
 */
const analyzeViolation = async () => {
  analyzing.value = true;
  hasAnalyzed.value = false;
  violations.value = [];

  const template = dashboardData.value.find(
    t => t.evaluationTemplateId === selectedTemplateId.value
  );

  if (!template) {
    analyzing.value = false;
    return;
  }

  const guideContent =
    template.evaluations?.[0]?.evaluationGuide?.evaluationGuideContent ?? null;

  if (!guideContent) {
    alert("해당 평가 템플릿에 평가 가이드가 없습니다.");
    analyzing.value = false;
    return;
  }

  try {
    const res = await apiClient.post("/ai/violation", {
      guide: guideContent,
      template
    });

    violations.value = res.data;
  } catch (e) {
    console.error(e);
    alert("평가 가이드 위반 분석 실패");
  } finally {
    analyzing.value = false;
    hasAnalyzed.value = true;
  }
};

onMounted(loadDashboard);
</script>

<!--style-->
<style scoped>
.page {
  background: #f5f6fa;
  min-height: 100vh;
}

.content-wrapper {
  padding: 36px;
}

.list-box {
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 0 14px 14px 14px;
  padding: 28px;
}

/* Tabs */
.tabs {
  display: flex;
}

.inbox-tabs {
  display: inline-flex;
}

.tab {
  padding: 10px 18px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.tab.active {
  color: #ffffff;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.tab-start {
  border-top-left-radius: 14px;
}

.tab-end {
  border-top-right-radius: 14px;
}

/* Filter */
.filter-box {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #cad5e2;
}

/* Loading */
.analysis-loading {
  padding: 60px;
  text-align: center;
  font-weight: 600;
  color: #475569;
}

/* Cards */
.promotion-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 14px;
}

.promotion-card.violation {
  background: #fff5f5;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 14px;
}

.rank-badge.warning {
  background: #dc2626;
  color: #ffffff;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.divider {
  height: 1px;
  background: #fecaca;
  margin: 10px 0;
}

/* Violation List */
.violation-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.violation-item {
  padding: 8px 0;
  border-bottom: 1px dashed #fecaca;
}

.violation-item:last-child {
  border-bottom: none;
}

.violation-header {
  font-size: 13px;
  font-weight: 700;
  color: #7f1d1d;
  display: flex;
  align-items: center;
  gap: 6px;
}

.violation-reason {
  margin-top: 4px;
  font-size: 14px;
  line-height: 1.5;
  color: #991b1b;
}

.person {
  background: #fee2e2;
  padding: 2px 6px;
  border-radius: 6px;
}

.category {
  font-weight: 600;
}

.empty-box {
  padding: 60px;
  text-align: center;
  font-weight: 700;
  color: #16a34a;
}

.violation-container {
  position: relative;   
  min-height: 300px;    
}

.loading-container {
  position: relative;
}


/* 🔄 로딩 오버레이 */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(248, 250, 252, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 14px;
}

/* 🔄 스피너 */
.spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #e2e8f0;
  border-top-color: #1c398e; /* 위반 = warning 톤 */
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

.loading-overlay p {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  text-align: center;
}

/* 회전 애니메이션 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.section-title {
  font-weight: bold;
}

.card-top .left {
  display: flex;
  align-items: center;   /* 세로 중앙 */
  gap: 10px;             /* ⚠ 과 텍스트 간격 */
}

.card-top .left > div:last-child {
  display: flex;
  align-items: center;
  gap: 8px;              /* 이름 / 부서 / 템플릿 간격 */
}

.card-top .name,
.card-top .sub {
  display: inline;
  margin: 0;
}
</style>