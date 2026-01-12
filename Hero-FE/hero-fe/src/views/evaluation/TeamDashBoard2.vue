<!-- 
  File Name   : TeamDashBoard4.vue
  Description : 팀 평가 대시보드: 팀원별 평가 점수 트렌드 페이지
 
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
            class="tab tab-start"
            @click="goMemberSkill"
          >
            팀원별 역량 상세 분석
          </button>

          <button
            class="tab tab-end active"
            @click="goScoreTrend"
          >
            팀원별 평가 점수 트렌드
          </button>
        </div>
      </div>

      <!-- 리스트 박스 -->
      <div class="list-box">

        <!-- 🔄 로딩 중 -->
        <div v-if="isLoading" class="loading">
          <div class="spinner"></div>
          <p>데이터를 불러오는 중입니다.</p>
        </div>

        <!-- 📊 실제 대시보드 -->
        <div v-else>
          <!-- 필터 -->
          <div class="filter-row">
            <label
              v-for="t in dashboardData"
              :key="t.evaluationTemplateId"
              class="checkbox"
            >
              <input
                type="checkbox"
                :value="t.evaluationTemplateId"
                v-model="checkedTemplateIds"
              />
              {{ t.evaluationTemplateName }}
            </label>
          </div>

          <!-- 차트 -->
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
import { ref, onMounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import Chart from "chart.js/auto";
import apiClient from "@/api/apiClient";
import { useAuthStore } from "@/stores/auth";

//외부 로직
const router = useRouter();
const authStore = useAuthStore();

//Reactive 데이터
const dashboardData = ref<any[]>([]);
const checkedTemplateIds = ref<number[]>([]);
const isLoading = ref(false);

//차트 객체
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

/**
 * 설명: 대시보드 데이터 조회 메소드
 */
const loadDashboard = async () => {
  const departmentId = authStore.user?.departmentId;

  try {
    isLoading.value = true;

    const { data } = await apiClient.get(
      `/evaluation/dashboard/${departmentId}`
    );

    if (!data || data.length === 0) {
      alert("평가 데이터가 존재하지 않습니다.");
      return;
    }

    dashboardData.value = data;
    checkedTemplateIds.value = data.map(
      (t: any) => t.evaluationTemplateId
    );

    await nextTick();
    renderChart(); // ✅ 최초 렌더

  } catch (e) {
    console.error("트렌드 조회 실패", e);
  } finally {
    isLoading.value = false;
  }
};

/**
 * 설명: 평가 점수 트렌드 계산 메소드
 */
const buildTrendData = () => {
  const templates = dashboardData.value.filter(t =>
    checkedTemplateIds.value.includes(t.evaluationTemplateId)
  );

  // 사원 목록 수집
  const memberSet = new Set<string>();

  templates.forEach(template => {
    template.evaluations.forEach((evaluation: any) => {
      evaluation.evaluatees.forEach((e: any) => {
        memberSet.add(e.evaluationEvaluateeName);
      });
    });
  });

  const labels = Array.from(memberSet); // X축: 사원

  const colors = [
    "#1c398e",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#6366f1",
  ];

  const datasets = templates.map((template, idx) => {
    const scoreMap: Record<string, number | null> = {};

    labels.forEach(name => (scoreMap[name] = null));

    template.evaluations.forEach((evaluation: any) => {
      evaluation.evaluatees.forEach((e: any) => {
        scoreMap[e.evaluationEvaluateeName] =
          e.evaluationEvaluateeTotalScore;
      });
    });

    return {
      label: template.evaluationTemplateName,
      data: labels.map(name => scoreMap[name]),
      backgroundColor: colors[idx % colors.length],
      borderRadius: 6,
      barPercentage: 0.7,
      categoryPercentage: 0.7,
    };
  });

  return { labels, datasets };
};

/**
 * 설명: 차트 그리는 메소드
 */
const renderChart = () => {
  if (!chartCanvas.value) return;

  const { labels, datasets } = buildTrendData();

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartCanvas.value, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: ctx =>
              `${ctx.dataset.label}: ${ctx.raw} 점`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
          },
          title: {
            display: true,
            text: "최종 평가 점수",
          },
        },
      },
    },
  });
};

/**
 * 설명: 차트 최신화 메서드
 */
const updateChart = async () => {
  await nextTick();
  renderChart();
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

watch([isLoading, checkedTemplateIds], async () => {
  if (isLoading.value) return;
  if (!dashboardData.value.length) return;

  await nextTick();
  renderChart();
});

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

/* List Box */
.list-box {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 0 14px 14px 14px;
  padding: 24px 32px 32px;
}

/* Filter */
.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

/* Chart */
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
  width: 100% !important;
  height: 100% !important;
  max-width: 900px;
}
</style>