<!-- 
  File Name   : DepartmentDashBoard5.vue
  Description : 부서별 역량 대시보드: 승진 대상자 추천 페이지
 
  History
  2025/12/27 - 승민 최초 작성
 
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
            class="tab"
            @click="goViolation"
          >
            평가 가이드 라인 위반
          </button>
          <button 
            class="tab active tab-end"
            @click="goRecommendation"
          >
            우수 사원 추천
          </button>
        </div>
      </div>

      <div class="list-box">
        <div class="promotion-container">
          <!-- 🔹 AI 분석 중 -->
          <div v-if="analyzing" class="loading-overlay">
            <div class="spinner"></div>
            <p>AI가 승진 추천 대상자를 분석 중입니다.(1~2분 정도 시간이 소요됩니다.)</p>
          </div>

          <!-- 🔹 Promotion Cards -->
          <div v-else class="promotion-wrapper">
              <div
                  v-for="(c, idx) in promotionCandidates"
                  :key="c.name + idx"
                  class="promotion-card"
              >
                  <!-- Top Row -->
                  <div class="card-top">
                  <div class="left">
                      <div class="rank-badge">{{ idx + 1 }}</div>
                      <div class="name-area">
                      <div class="name">{{ c.name }}</div>
                      <div class="sub">
                          <span class="dept">{{ c.department }}</span>
                          <span class="dot">•</span>
                          <span class="growth">▲ {{ c.growth_rate }}%</span>
                      </div>
                      </div>
                  </div>

                  <div class="right">
                      <div class="kv">
                      <div class="k">현재 직급</div>
                      <div class="v">{{ c.current_grade }}</div>
                      </div>
                      <div class="kv">
                      <div class="k">추천 직급</div>
                      <div class="v highlight">{{ c.recommended_grade }}</div>
                      </div>
                  </div>
                  </div>

                  <div class="divider"></div>

                  <!-- Core Competencies -->
                  <div class="section">
                  <div class="section-title">핵심 역량</div>
                  <div class="chips">
                      <span
                      class="chip"
                      v-for="(skill, i) in (c.core_competencies || []).slice(0, 3)"
                      :key="i"
                      >
                      {{ skill }}
                      </span>

                      <!-- 역량이 없을 때 -->
                      <span v-if="!c.core_competencies || c.core_competencies.length === 0" class="empty">
                      (등록된 핵심 역량 없음)
                      </span>
                  </div>
                  </div>

                  <!-- Reason -->
                  <div class="section">
                  <div class="section-title">추천 사유</div>
                  <div class="reason-box">
                      {{ c.reason }}
                  </div>
                  </div>
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
const dashboardData = ref<any[]>([]);
const promotionCandidates = ref<any[]>([]);
const analyzing = ref(false);


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
 * 설명: 승진 대상자 추천 조회 메소드
 */
const loadPromotionCandidates = async () => {
  try {
    analyzing.value = true;

    const { data } = await apiClient.get("/evaluation/dashboard/all");
    dashboardData.value = data;

    const res = await apiClient.post(
      "/ai/promotion",
      dashboardData.value
    );

    promotionCandidates.value = res.data;
  } catch (error) {
    console.error("승진 추천 분석 실패", error);
    alert("승진 추천 데이터를 불러오는 데 실패했습니다.");
  } finally {
    analyzing.value = false;
  }
};

onMounted(loadPromotionCandidates);
</script>

<!--style-->
<style scoped>
/* Page & Layout */
.page {
  background: #f5f6fa;
  height: 100%;
}

.content-wrapper {
  padding: 36px;
}

.list-box {
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 0 14px 14px 14px;
  padding: 32px;
}

/* Tabs */
.tabs {
  display: flex;
}

.inbox-tabs {
  display: inline-flex;
  flex-direction: row;
}

.tab {
  padding: 10px 18px;
  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #e2e8f0;
  background-color: #ffffff;

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

/* AI Loading */
.analysis-loading {
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 15px;
  font-weight: 600;
  color: #475569;

  background: #f8fafc;
  border-radius: 14px;
  border: 1px dashed #cbd5e1;
}

/* Promotion Cards Grid */
.promotion-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 18px;
}

/* Promotion Card */
.promotion-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px 18px 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.03);
}

/* Card Top Section */ 
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}

.left {
  display: flex;
  gap: 12px;
  min-width: 0;
}

.rank-badge {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #1c398e;
  color: #ffffff;

  font-size: 13px;
  font-weight: 800;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.name-area {
  min-width: 0;
}

.name {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;

  font-size: 12px;
  color: #64748b;
}

.dot {
  color: #cbd5e1;
}

.sub .growth {
  color: #16a34a;
  font-weight: 700;
}

/* Right Info (Grades) */
.right {
  display: flex;
  gap: 14px;
  flex-shrink: 0;
}

.kv {
  text-align: right;
}

.kv .k {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 2px;
}

.kv .v {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}

.kv .v.highlight {
  color: #6d28d9;
}

/* Divider */
.divider {
  height: 1px;
  background: #e2e8f0;
  margin: 14px 0;
}

/* Section (Core / Reason) */
.section + .section {
  margin-top: 12px;
}

.section-title {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
}

/* Core Competencies Chips */
.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.chip {
  background: #111827;
  color: #ffffff;

  padding: 6px 10px;
  border-radius: 999px;

  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.empty {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
}

/* Recommendation Reason */
.reason-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;

  font-size: 15px;
  color: #334155;
  line-height: 1.55;

  white-space: pre-line;
  
}

.promotion-container {
  position: relative;     
  min-height: 280px;      
}

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
  backdrop-filter: blur(2px);
}

/* 스피너 */
.spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #e2e8f0;
  border-top-color: #1c398e;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>