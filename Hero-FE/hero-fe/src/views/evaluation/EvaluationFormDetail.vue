<!--
  File Name   : EvaluationFormDetail.vue
  Description : 평가서 세부 페이지 
  History
  2025/12/17 - 승민 작성

  @author 승민
-->

<!--template-->
<template>
  <div class="container" :class="{ 'modal-container': isModal }">

    <!-- ===== Header ===== -->
    <div class="header" v-if="!isModal">
      <div class="title-wrapper">
        <button class="back-button" type="button" aria-label="뒤로가기">
          <img src="/images/arrow.svg" alt="" class="back-icon" @click="goBack"/>
        </button>
        <h1 class="title">평가서 상세</h1>
      </div>
    </div>
    
    <div class="content">
      <div class="form-box" :class="{ 'modal-form-box': isModal }">

        <!-- ===== 평가명 ===== -->
        <h2 class="section-title">
          {{ evaluation.evaluationFormEvaluationName }}
        </h2>

        <!-- ===== 평가 정보 ===== -->
        <div class="flex-row">
          <div class="form-item">
            <label>평가자</label>
            <div class="text-view manager-view">
              {{ evaluation.evaluationFormEvaluationEmployeeName }}
            </div>
          </div>

          <div class="form-item">
            <label>피평가자</label>
            <div class="text-view evaluatee-view">
              {{ evaluation.evaluationFormEmployeeName }}
            </div>
          </div>
        </div>

        <div class="form-item">
          <label>평가 기간</label>
          <div class="text-view">
            {{ evaluation.evaluationFormEvaluationPeriodStart }} ~
            {{ evaluation.evaluationFormEvaluationPeriodEnd }}
          </div>
        </div>

        <!-- ===== 그래프 + 최종 결과 ===== -->
        <div class="overview-row">

          <!-- 그래프 -->
          <div class="chart-box small">
            <label>항목별 점수</label>
            <canvas ref="scoreChart"></canvas>
          </div>

          <!-- 최종 결과 -->
          <div class="summary-grid">

            <!-- 최종 점수 -->
            <div class="summary-card score">
                <label>최종 점수</label>
                <div class="summary-value">
                {{ evaluation.evaluationFormTotalScore ?? '-' }} 점
                </div>
            </div>

            <!-- 최종 등급 -->
            <div class="summary-card rank">
                <label>최종 등급</label>
                <div class="summary-rank">
                {{ evaluation.evaluationFormTotalRank ?? '-' }}
                </div>
            </div>

          </div>

        </div>

        <h3 class="sub-title">평가 항목</h3>

        <!-- ===== 평가 항목 ===== -->
        <div
          v-for="(item, index) in evaluation.formItems"
          :key="item.formItemFormItemId"
          class="eval-card"
        >
          <!-- 항목 헤더 -->
          <div class="eval-card-header">
            <div class="eval-left">
              <div class="eval-index">{{ index + 1 }}</div>
              <div class="eval-title">
                {{ item.formItemSelectedItemItemName }}
              </div>
            </div>

            <div class="weight-text">
              가중치 {{ item.formItemWeight }}%
            </div>
          </div>

          <!-- 항목 설명 -->
          <p class="item-description">
            {{ item.formItemSelectedItemItemDescription || '항목 설명이 없습니다.' }}
          </p>

          <div class="eval-body">

            <!-- ===== 상단 2컬럼 ===== -->
            <div class="eval-two-column">

              <!-- 피평가자 -->
              <div class="eval-box">
                <label>피평가자 작성 내용</label>
                <div class="text-view">
                  {{ item.formItemDescription || '작성된 실적이 없습니다.' }}
                </div>
              </div>

              <!-- 평가자 -->
              <div class="eval-box highlight">

                <div class="score-box-row">
                  <div class="score-box">
                    <label>점수</label>
                    <div class="score-value">
                      {{ item.itemScore?.itemScoreScore ?? '-' }} 점
                    </div>
                  </div>

                  <div class="rank-box">
                    <label>등급</label>
                    <div class="rank-value">
                      {{ item.itemScore?.itemScoreRank ?? '-' }}
                    </div>
                  </div>
                </div>

                <div class="form-item">
                  <label>평가자 코멘트</label>
                  <div class="text-view">
                    {{ item.itemScore?.itemScoreDescription || '작성된 코멘트가 없습니다.' }}
                  </div>
                </div>

              </div>
            </div>

            <!-- ===== 평가 기준 ===== -->
            <div class="criteria-header">
              <span class="criteria-title">평가 기준</span>
              <button
                class="toggle-btn"
                @click="toggleCriteria(item.formItemFormItemId)"
              >
                {{ openedCriteria[item.formItemFormItemId] ? '숨기기' : '보기' }}
              </button>
            </div>

            <div
              v-if="openedCriteria[item.formItemFormItemId]"
              class="criteria-list"
            >
              <div
                v-for="c in item.criterias"
                :key="c.criteriaCriteriaId"
                class="criteria-card"
                :class="{ active: c.criteriaRank === item.itemScore?.itemScoreRank }"
              >
                <div class="criteria-badge">
                  {{ c.criteriaRank }}
                </div>
                <div>
                  {{ c.criteriaDescription }}
                  <small>
                    ({{ c.criteriaMinScore }} ~ {{ c.criteriaMaxScore }}점)
                  </small>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- ===== 총평 ===== -->
        <div class="form-item">
          <label>평가자 종합 총평</label>
          <div class="final-box">
            {{ evaluation.evaluationFormTotal || '작성된 총평이 없습니다.' }}
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
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/api/apiClient";
import Chart from "chart.js/auto";

//외부 로직
const route = useRoute();
const router = useRouter();

const props = defineProps<{
  isModal?: boolean;
  modalEvaluationId?: number;
  modalEmployeeId?: number;
}>();

const emit = defineEmits(['close']);

/**
 * 설명: 이전 페이지 이동하는 메소드
 */
const goBack = () => {
  if (props.isModal) emit('close');
  else router.back();
};

const evaluationId = props.isModal ? (props.modalEvaluationId ?? 0) : Number(route.params.id);
const employeeId = props.isModal ? (props.modalEmployeeId ?? 0) : Number(route.query.employeeId);

//Reactive 데이터
const evaluation = ref<any>({});
const openedCriteria = ref<Record<number, boolean>>({});

//Chart.js 객체 데이터
const scoreChart = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

/**
 * 설명: 평가 기준 토글 메소드
 * @param {number} id - 평가 기준 번호 
 */
const toggleCriteria = (id: number) => {
  openedCriteria.value[id] = !openedCriteria.value[id];
};

/**
 * 설명: 차트 랜더링 메소드
 */
const renderChart = async () => {
  await nextTick();
  if (!scoreChart.value || !evaluation.value.formItems) return;

  const labels = evaluation.value.formItems.map(
    (i: any) => i.formItemSelectedItemItemName
  );

  const scores = evaluation.value.formItems.map(
    (i: any) => i.itemScore?.itemScoreScore ?? 0
  );

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(scoreChart.value, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          data: scores,
          backgroundColor: "#4f39f6",
          borderRadius: 6,
          barThickness: 18,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 20, font: { size: 11 } },
        },
        x: {
          ticks: { font: { size: 11 } },
        },
      },
    },
  });
};

/**
 * 설명: 평가서 데이터 조회 메소드
 */
const loadDetail = async () => {
  if (!evaluationId || !employeeId) {
    console.warn('유효하지 않은 평가 ID 또는 사원 ID입니다.', { evaluationId, employeeId });
    return;
  }

  try {
    const response = await apiClient.get(
      `/evaluation/evaluation-form/${evaluationId}/${employeeId}`
    );

    // API 응답 구조에 따라 데이터 추출 (CustomResponse 대응)
    const data = response.data.data || response.data;

    evaluation.value = {
      ...data,
      evaluationFormEvaluationPeriodStart:
        data.evaluationFormEvaluationPeriodStart?.slice(0, 10),
      evaluationFormEvaluationPeriodEnd:
        data.evaluationFormEvaluationPeriodEnd?.slice(0, 10),
    };

    renderChart();
  } catch (error) {
    console.error('평가 상세 조회 실패:', error);
  }
};

/**
 * 설명: 마운트 시, 평가서 데이터 조회
 */
onMounted(loadDetail);
</script>

<!--style-->
<style scoped>
/* ================= Layout ================= */
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  background: #f5f6fa;
}

.container.modal-container {
  min-height: auto;
  height: 100%;
}

.content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.form-box {
  max-width: 1200px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-box.modal-form-box {
  border: none;
  padding: 40px;
  max-width: none;
}

/* ================= Header ================= */
.header {
  height: auto;
  padding: 10px 20px;
  background: #ffffff;
  border-bottom: 2px solid #e2e8f0;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  color: #0f172b;
  text-align: left;
  white-space: nowrap;
  font-family: "Inter-Regular", sans-serif;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.07px;
  font-weight: 400;
  left: 0px;
  top: 0px;
}

.back-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

/* ================= Modal Header ================= */
.modal-header-bar {
  padding: 16px 24px 0 24px;
  display: flex;
  align-items: center;
}

.btn-back-modal {
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-back-modal:hover { color: #334155; }

/* ================= Typography ================= */
.section-title {
  text-align: center;
  font-size: 25px;
  font-weight: 800;
  color: #1c398e;
}

.sub-title {
  font-size: 20px;
  font-weight: 700;
  color: #1c398e;
}

label {
  font-size: 14px;
  font-weight: 600;
  color: #1c398e;
}

/* ================= Info ================= */
.flex-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.text-view {
  padding: 14px 18px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  line-height: 1.6;
}

/* ================= Overview (Chart + Summary) ================= */
.overview-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: stretch;
}

/* ===== Chart ===== */
.chart-box {
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.chart-box.small {
  height: 180px;
}

.chart-box label {
  display: block;
  margin-bottom: 8px;
}

.chart-box canvas {
  height: 120px !important;
}

/* ===== Summary ===== */
.summary-box {
  display: flex;
  gap: 48px;
  padding: 24px;
  background: linear-gradient(135deg, #eef2ff, #eff6ff);
  border-radius: 16px;
  border: 1px solid #c6d2ff;
}

.summary-box.compact {
  flex-direction: column;
  gap: 16px;
  justify-content: center;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-value {
  font-size: 30px;
  font-weight: 800;
  color: #1c398e;
}

.summary-rank {
  font-size: 30px;
  font-weight: 800;
  color: #16a34a;
}

/* ================= Eval Card ================= */
.eval-card {
  background: #f8fafc;
  border-radius: 16px;
  border: 1.5px solid #e2e8f0;
  padding: 24px;
}

.eval-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.eval-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.eval-index {
  width: 36px;
  height: 36px;
  background: linear-gradient(180deg, #1c398e, #162456);
  color: white;
  border-radius: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eval-title {
  font-size: 16px;
  font-weight: 700;
  color: #1c398e;
}

.weight-text {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

/* ===== Item Description ===== */
.item-description {
  margin: 8px 0 0 48px;
  font-size: 14px;
  color: #475569;
}

/* ================= Eval Body ================= */
.eval-body {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ===== Two Column ===== */
.eval-two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
}

.eval-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.eval-box.highlight {
  background: #eef2ff;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid #c6d2ff;
}

/* ================= Score / Rank ================= */
.score-box-row {
  display: flex;
  gap: 16px;
}

.score-box,
.rank-box {
  flex: 1;
  background: #ffffff;
  border: 1px solid #c6d2ff;
  border-radius: 12px;
  padding: 12px 16px;
}

.score-value {
  font-size: 20px;
  font-weight: 700;
  color: #1c398e;
}

.rank-value {
  font-size: 20px;
  font-weight: 700;
  color: #16a34a;
}

/* ================= Criteria ================= */
.criteria-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.criteria-title {
  font-size: 15px;
  font-weight: 700;
  color: #1c398e;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: #4f39f6;
  cursor: pointer;
}

.criteria-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.criteria-card {
  display: flex;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #c6d2ff;
  border-radius: 12px;
  padding: 12px;
}

.criteria-badge {
  width: 36px;
  height: 36px;
  background: linear-gradient(180deg, #1c398e, #162456);
  color: white;
  border-radius: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.criteria-card.active {
  background: #eef2ff;
  border-color: #4f39f6;
}

/* ================= Final Comment ================= */
.final-box {
  padding: 24px;
  background: linear-gradient(135deg, #eef2ff, #eff6ff);
  border-radius: 16px;
  border: 1px solid #c6d2ff;
}

/* ================= Width ================= */
.manager-view {
  width: 370px;
}

.evaluatee-view {
  width: 370px;
}

/* ================= Responsive ================= */
@media (max-width: 900px) {
  .overview-row {
    grid-template-columns: 1fr;
  }

  .eval-two-column {
    grid-template-columns: 1fr;
  }

  .chart-box.small {
    height: 200px;
  }
}

/* ===== Summary Grid ===== */
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: 100%;
}

/* ===== Summary Card ===== */
.summary-card {
  background: linear-gradient(135deg, #eef2ff, #eff6ff);
  border: 1px solid #c6d2ff;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.summary-card label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

/* 점수 */
.summary-card.score .summary-value {
  font-size: 24px;
  font-weight: 800;
  color: #1c398e;
}

/* 등급 */
.summary-card.rank {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border-color: #86efac;
}

/* 등급 */
.summary-card.rank .summary-rank {
  font-size: 26px;
  font-weight: 900;
  color: #16a34a;
  letter-spacing: 1px;
}

.back-button {
  width: 40px;
  height: 40px;                 /* 버튼 박스 고정 */
  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 10px;
  transition: transform 0.2s ease, background 0.2s ease;
}

.back-button:hover {
  transform: translateX(-2px);
  background: #F1F5F9;
}

.back-icon {
  width: 20px;
  height: 20px;
  display: block;               /* baseline 튐 방지 */
}

@media (max-width: 768px) {

  .back-button {
    width: 36px;
    height: 36px;
  }

  .back-icon {
    width: 18px;
    height: 18px;
  }
}

</style>