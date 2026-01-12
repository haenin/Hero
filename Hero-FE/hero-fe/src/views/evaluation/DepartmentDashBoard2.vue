<!-- 
  File Name   : DepartmentDashBoard2.vue
  Description : 부서별 역량 대시보드: 직급별 점수 편차 페이지
 
  History
  2025/12/22 - 승민 최초 작성
 
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
            class="tab active"
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
            class="tab tab-end"
            @click="goRecommendation"
          >
            우수 사원 추천
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="list-box">

        <!-- 🔄 로딩 중 -->
        <div v-if="isLoading" class="loading">
          <div class="spinner"></div>
          <p>데이터를 불러오는 중입니다.</p>
        </div>

        <!-- 📊 실제 콘텐츠 -->
        <div v-else>

          <div class="filter-row">
            <select v-model="selectedTemplateId">
              <option
                v-for="t in dashboardData"
                :key="t.evaluationTemplateId"
                :value="t.evaluationTemplateId"
              >
                {{ t.evaluationTemplateName }}
              </option>
            </select>
          </div>

          <div class="chart-wrapper">
            <canvas ref="chartCanvas"></canvas>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<!--script-->
<script setup lang="ts">
//Import 구문
import { ref, onMounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import Chart from "chart.js/auto";
import apiClient from "@/api/apiClient";

//외부 로직
const router = useRouter();

//Reactive 데이터
const activeTab = ref("deptAvg");
const dashboardData = ref<any[]>([]);
const selectedTemplateId = ref<number | null>(null);
const isLoading = ref(false);

//차트 객체
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

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
 * 설명: 대시보드 데이터 조회 메소드
 */
const loadDashboard = async () => {
  try {
    isLoading.value = true;

    const { data } = await apiClient.get("/evaluation/dashboard/all");

    if (!data || data.length === 0) {
      alert("평가 데이터가 존재하지 않습니다.");
      return;
    }

    dashboardData.value = data;
    selectedTemplateId.value = data[0]?.evaluationTemplateId ?? null;

    await nextTick();
    renderDepartmentChart();

  } catch (e) {
    console.error("대시보드 조회 실패", e);
  } finally {
    isLoading.value = false;
  }
};

/**
 * 설명: 선택된 평가 데이터를 그래프에 맞게 가공하는 메소드 
 * @param {any[]} data - 선택된 평가 데이터  
 */
const calculateGradeStats = (data: any[]) => {
  if (!selectedTemplateId.value) {
    return { labels: [], avgs: [], stds: [], counts: [] };
  }

  const template = data.find(
    t => t.evaluationTemplateId === selectedTemplateId.value
  );
  if (!template) {
    return { labels: [], avgs: [], stds: [], counts: [] };
  }

  const gradeMap: Record<string, number[]> = {};

  template.evaluations.forEach((evaluation: any) => {
    evaluation.evaluatees.forEach((e: any) => {
      const grade = e.evaluationEvaluateeGrade;
      if (!gradeMap[grade]) gradeMap[grade] = [];
      gradeMap[grade].push(e.evaluationEvaluateeTotalScore);
    });
  });

  const labels: string[] = [];
  const avgs: number[] = [];
  const stds: number[] = [];
  const counts: number[] = [];

  Object.entries(gradeMap).forEach(([grade, scores]) => {
    const avg =
      scores.reduce((a, b) => a + b, 0) / scores.length;

    const variance =
      scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) /
      scores.length;

    labels.push(grade);
    avgs.push(Number(avg.toFixed(1)));
    stds.push(Number(Math.sqrt(variance).toFixed(1)));
    counts.push(scores.length); 
  });

  return { labels, avgs, stds, counts };
};

/**
 * 설명: 그래프를 그리는 메소드
 */
const renderDepartmentChart = () => {
  if (!chartCanvas.value) return;

  const { labels, avgs, stds, counts } =
    calculateGradeStats(dashboardData.value);

  const displayLabels = labels.map(
    (grade, idx) => `${grade} (${counts[idx]}명)`
  );

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartCanvas.value, {
    type: "bar",
    data: {
      labels: displayLabels,
      datasets: [
        {
          label: "직급별 평균 점수",
          data: avgs,
          backgroundColor: "#1c398e",
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.6,
        },
        {
          label: "직급별 점수 표준 편차",
          data: stds,
          backgroundColor: "#f59e0b",
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.6,
        },
      ],
    },
    options: {
      responsive: true,
      animation: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: ctx =>
              `${ctx.dataset.label}: ${ctx.raw}점`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: "점수",
          },
        },
      },
    },
  });
};

/**
 * 설명: 평가 템플릿 값을 감지하는 훅
 */
watch(activeTab, tab => {
  if (tab === "deptAvg") {
    setTimeout(renderDepartmentChart, 0);
  }
});

watch([isLoading, selectedTemplateId], async () => {
  if (isLoading.value) return;
  if (!dashboardData.value.length) return;

  await nextTick();
  renderDepartmentChart();
});


onMounted(loadDashboard);
</script>

<!--style-->
<style scoped>
.page {
  background: #f5f6fa;
  height: 100%;
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

.tab {
  padding: 10px 18px;
  display: flex;
  align-items: center;
  justify-content: center;

  border-top: 1px solid #e2e8f0;
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;

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

/* ===== Filter ===== */
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

/* Content Box */
.list-box {
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 0 14px 14px 14px;
  padding: 24px;
}

.chart-wrapper {
  height: 420px;
  background: #f8fafc;
  border-radius: 14px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-wrapper canvas {
  max-width: 900px;
  max-height: 360px;
}

.placeholder {
  height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #1c398e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>