<!-- 
  File Name   : TeamDashBoard3.vue
  Description : 팀 평가 대시보드: 팀원별 역량 상세 분석 페이지
 
  History
  2025/12/19 - 승민 최초 작성
 
  @author 승민
-->

<!--template-->
<template>
  <div class="page">
    <div class="content-wrapper">

      <!-- 상단 탭 -->
      <div class="tabs">
        <div class="inbox-tabs">
          <button
            class="tab active tab-start"
            @click="goMemberSkill"
          >
            팀원별 역량 상세 분석
          </button>

          <button
            class="tab tab-end"
            @click="goScoreTrend"
          >
            팀원별 평가 점수 트렌드
          </button>
        </div>
      </div>

      <!-- 콘텐츠 -->
      <div class="list-box">

        <!-- 필터 -->
        <div class="filter-row">
          <select v-model="selectedTemplateId" @change="onTemplateChange">
            <option
              v-for="t in dashboardData"
              :key="t.evaluationTemplateId"
              :value="t.evaluationTemplateId"
            >
              {{ t.evaluationTemplateName }}
            </option>
          </select>

          <label>사원</label>
          <select v-model="selectedEvaluateeId" @change="updateAll">
            <option
              v-for="e in evaluatees"
              :key="e.evaluationEvaluateeId"
              :value="e.evaluationEvaluateeId"
            >
              {{ e.evaluationEvaluateeName }}
            </option>
          </select>
        </div>

        <!-- 그래프 + 분석 -->
        <div class="chart-analysis-wrapper">

          <!-- Radar Chart -->
          <div class="chart-wrapper chart-loading-container">
            <canvas ref="chartCanvas"></canvas>

            <div v-if="analyzing" class="chart-loading-overlay">
              <div class="spinner"></div>
              <p>AI가 사원의 강점과 개선점을 분석 중입니다.(1~2분 정도 시간이 소요됩니다.)</p>
            </div>
          </div>

          <!-- LLM 분석 -->
          <div class="analysis-box" v-if="!analyzing">
            <div class="analysis-section">
              <h4>강점</h4>
              <ul>
                <li v-for="(s, i) in strengths" :key="i">{{ s }}</li>
              </ul>
            </div>

            <div class="analysis-section">
              <h4>개선점</h4>
              <ul>
                <li v-for="(i, idx) in improvements" :key="idx">{{ i }}</li>
              </ul>
            </div>

            <div class="analysis-section">
              <h4>개선 계획</h4>
              <ul>
                <li v-for="(a, idx) in actionPlan" :key="idx">{{ a }}</li>
              </ul>
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
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Chart from "chart.js/auto";
import apiClient from "@/api/apiClient";
import { useAuthStore } from "@/stores/auth";

//외부 로직
const router = useRouter();
const authStore = useAuthStore();

//Reactive 데이터
const dashboardData = ref<any[]>([]);
const selectedTemplateId = ref<number | null>(null);
const selectedEvaluateeId = ref<number | null>(null);

const evaluatees = ref<any[]>([]);
const selectedEvaluatee = ref<any>(null);

//차트 객체
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

//파이썬 서버로 보낼 데이터
const strengths = ref<string[]>([]);
const improvements = ref<string[]>([]);
const actionPlan = ref<string[]>([]);
const analyzing = ref(false);

/**
 * 설명: 대시보드 데이터 조회 메소드
 */
const loadDashboard = async () => {
  const departmentId = authStore.user?.departmentId;

  const { data } = await apiClient.get(`/evaluation/dashboard/${departmentId}`);
  dashboardData.value = data;
  selectedTemplateId.value = data[0].evaluationTemplateId;
  onTemplateChange();
};

const onTemplateChange = () => {
  const template = dashboardData.value.find(
    t => t.evaluationTemplateId === selectedTemplateId.value
  );
  evaluatees.value = template.evaluations[0].evaluatees;
  selectedEvaluateeId.value = evaluatees.value[0].evaluationEvaluateeId;
  updateAll();
};

/**
 * 설명: 차트 그리는 메소드
 */
const renderChart = () => {
  if (!chartCanvas.value || !selectedEvaluatee.value) return;

  const labels = selectedEvaluatee.value.formItems.map(
    (f: any) => f.formItemName
  );
  const values = selectedEvaluatee.value.formItems.map(
    (f: any) => f.formItemScore
  );

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartCanvas.value, {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label: "역량 점수",
          data: values,
          backgroundColor: "rgba(28, 57, 142, 0.2)",
          borderColor: "#1c398e",
          pointBackgroundColor: "#1c398e",
          borderWidth: 2,
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            backdropColor: "transparent",
          },
          grid: {
            color: "#e2e8f0",
          },
          angleLines: {
            color: "#e2e8f0",
          },
          pointLabels: {
            color: "#334155",
            font: {
              size: 13,
              weight: 500,
            },
          },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });
};

/**
 * 설명: 평가 데이터 분석 메소드
 */
const analyzeEvaluatee = async () => {
  analyzing.value = true;

  const payload = {
    templateName: dashboardData.value.find(
      t => t.evaluationTemplateId === selectedTemplateId.value
    ).evaluationTemplateName,

    employeeName: selectedEvaluatee.value.evaluationEvaluateeName,
    employeeDepartment: selectedEvaluatee.value.evaluationEvaluateeDepartmentName,
    employeeGrade: selectedEvaluatee.value.evaluationEvaluateeGrade,
    totalScore: selectedEvaluatee.value.evaluationEvaluateeTotalScore,
    totalRank: selectedEvaluatee.value.evaluationEvaluateeTotalRank,

    formItems: selectedEvaluatee.value.formItems.map((f: any) => ({
      itemName: f.formItemName,
      score: f.formItemScore,
      weight: f.formItemWeight,
      comment: f.formItemComment,
    })),
  };

  const res = await apiClient.post("/ai/analysis/member", payload);

  const realData = res.data;

  strengths.value = realData.strengths ?? [];
  improvements.value = realData.improvements ?? [];
  actionPlan.value = realData.action_plan ?? [];

  analyzing.value = false;
};

/**
 * 설명: 차트 최신화 메서드
 */
const updateAll = async () => {
  selectedEvaluatee.value = evaluatees.value.find(
    e => e.evaluationEvaluateeId === selectedEvaluateeId.value
  );
  await nextTick();
  renderChart();
  await analyzeEvaluatee();
};


/**
 * 설명: 팀원별 역량 상세 분석 페이지로 이동하는 메서드
 */
const goMemberSkill = () => {
  router.push("/evaluation/team/dashboard");
};

/**
 * 설명: 팀원별 평가 점수 트렌드 페이지로 이동하는 메서드
 */
const goScoreTrend = () => {
  router.push("/evaluation/team/dashboard2");
};

onMounted(loadDashboard);
</script>

<!--style-->
<style scoped>
.page {
  width: 100%;
  height: 100%;
  background: #f5f6fa;
}

.content-wrapper {
  padding: 36px;
}

/* Tabs */
.tabs {
  display: flex;
}

.inbox-tabs {
  display: inline-flex;
  flex-direction: row;
}

/* 탭 공통 */
.tab {
  padding: 10px 18px;           /* 좌우 여백 */
  display: flex;
  align-items: center;
  justify-content: center;

  border-top: 1px solid #e2e8f0;
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;

  background-color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  white-space: nowrap;          
  width: auto;                  

  border-bottom: 1px solid #e2e8f0;
}

/* 활성 탭 */
.tab.active {
  color: #ffffff;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

/* 탭 라운드 */
.tab-start {
  border-top-left-radius: 14px;
}

.tab-end {
  border-top-right-radius: 14px;
}

/* Box */
.list-box {
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 0 14px 14px 14px;
  padding: 24px;
}

/* Filter */
.filter-row {
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

/* Chart + Analysis Layout */
.chart-analysis-wrapper {
  display: flex;
  gap: 24px;
  align-items: stretch;
}

.chart-wrapper {
  flex: 1.2;
  height: 420px;
  background: #f8fafc;
  border-radius: 14px;
  padding: 24px;
}

.chart-wrapper canvas {
  width: 100% !important;
  height: 100% !important;
}

/* Analysis */
.analysis-section {
  padding: 10px 25px;
  border-radius: 10px;
  background: #f8fafc;
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 섹션 간 간격 강화 */
.analysis-section + .analysis-section {
  margin-top: 14px;
}

/* 왼쪽 컬러 바 (공통) */
.analysis-section::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 4px;
  border-radius: 4px;
}

/* 강점 */
.analysis-section:nth-child(1) {
  background: #f0f7ff;
}
.analysis-section:nth-child(1)::before {
  background: #2563eb;
}

/* 개선점 */
.analysis-section:nth-child(2) {
  background: #fff7ed;
}
.analysis-section:nth-child(2)::before {
  background: #f97316;
}

/* 개선 계획 */
.analysis-section:nth-child(3) {
  background: #f0fdf4;
}
.analysis-section:nth-child(3)::before {
  background: #16a34a;
}

/* 제목 강조 */
.analysis-section h4 {
  font-size: 18px;
  font-weight: 700;
}

h4 {
  margin: 0px;
}

.chart-wrapper {
  position: relative;   /* ⭐ 기준점 */
  flex: 1.2;
  height: 420px;
  background: #f8fafc;
  border-radius: 14px;
  padding: 24px;
}

/* 차트 위 로딩 레이어 */
.chart-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(248, 250, 252, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 5;
  border-radius: 14px;
}

/* 스피너 */
.spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #e2e8f0;
  border-top-color: #1c398e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 10px;
}

.chart-loading-overlay p {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  text-align: center;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

ul {
  padding-left: 16px;
}

li {
  font-size: 15px;
}


</style>