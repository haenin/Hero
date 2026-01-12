<!--
  File Name   : EvaluationDetail.vue
  Description : 생성된 평가 세부 페이지 (평가 상세 조회)
  History
  2025/12/15 - 승민 작성

  @author 승민
-->

<!--template-->
<template>
  <div class="container">
    <!-- Header (CreateEvaluation.vue와 동일 패턴) -->
    <div class="header">
      <div class="title-wrapper">
        <button class="back-button" type="button" aria-label="뒤로가기">
          <img src="/images/arrow.svg" alt="" class="back-icon" @click="goBack"/>
        </button>
        <h1 class="title">평가 상세</h1>
      </div>

      <div class="btn-container">
        <button class="btn-remove" @click="deleteEvaluation">삭제</button>
      </div>
    </div>

    <div class="content">
      <div class="form-box" v-if="evaluation">

        <!-- ================= 평가 기본 정보 ================= -->
        <h2 class="section-title">{{ evaluation.evaluationName }}</h2>

        <div class="info-grid">
          <div class="info-card">
            <div class="info-label">평가자</div>
            <div class="info-value">
              {{ evaluation.evaluationEmployeeName ?? "-" }}
            </div>
          </div>

          <div class="info-card">
            <div class="info-label">부서</div>
            <div class="info-value">
              {{ evaluation.evaluationDepartmentName ?? "-" }}
            </div>
          </div>

          <div class="info-card">
            <div class="info-label">평가 기간</div>
            <div class="info-value">
              {{ formattedPeriod }}
            </div>
          </div>

          <div class="info-card">
            <div class="info-label">평가 종료일</div>
            <div class="info-value">
              {{ formattedEndedAt }}
            </div>
          </div>

          <div class="info-card">
            <div class="info-label">평가 가이드</div>
            <div class="info-value">
              {{ evaluation.evaluationEvaluationGuideName ?? "-" }}
            </div>
          </div>

          <div class="info-card">
            <div class="info-label">상태</div>
            <div class="info-value">
              <span class="badge" :class="statusClass(evaluation.evaluationStatus)">
                {{ statusText(evaluation.evaluationStatus) }}
              </span>
            </div>
          </div>

          <div class="info-card">
            <div class="info-label">집계</div>
            <div class="info-value">
              <span class="mono">
                {{ evaluation.evaluationTotalScore ?? "-" }}
              </span>
              <span class="sep"> / </span>
              <span class="mono">
                {{ evaluation.evaluationTotalRank ?? "-" }}
              </span>
            </div>
          </div>
        </div>

        <!-- ================= 피평가자 ================= -->
        <h3 class="sub-title">피평가자</h3>

        <div class="employee-grid">
          <div
            v-for="emp in evaluation.evaluatees"
            :key="emp.evaluateeEvaluateeId"
            class="employee-card"
          >
            <div class="employee-info">
              <div class="employee-name">{{ emp.evaluateeEmployeeName }}</div>
              <div class="employee-grade">{{ emp.evaluateeGrade ?? "-" }}</div>
            </div>

            <span class="badge small" :class="evaluateeStatusClass(emp.evaluateeStatus)">
              {{ evaluateeStatusText(emp.evaluateeStatus) }}
            </span>
          </div>
        </div>

        <!-- ================= 평가 항목(선택 항목) ================= -->
        <h3 class="sub-title">평가 항목</h3>

        <div
          class="eval-card"
          v-for="(item, index) in evaluation.selectedItems"
          :key="item.selectedItemSelectedItemId"
        >
          <div class="eval-card-header">
            <div class="eval-left">
              <div class="eval-index">{{ index + 1 }}</div>
              <span class="eval-title">{{ item.selectedItemItemName }}</span>
            </div>

            <button
              class="eval-toggle"
              @click="toggleCriteria(item.selectedItemSelectedItemId)"
            >
              {{ openedCriteria[item.selectedItemSelectedItemId] ? "접기" : "기준 보기" }}
            </button>
          </div>

          <div class="eval-body">
            <!-- 항목 설명 -->
            <div class="eval-desc">
              <span class="eval-desc-label">항목 설명</span>
              <p class="eval-desc-text">
                {{ item.selectedItemItemDescription }}
              </p>
            </div>

            <!-- 평가 기준 -->
            <div
              v-if="openedCriteria[item.selectedItemSelectedItemId]"
              class="eval-criteria"
            >
              <h4 class="criteria-title">
                평가 기준 ({{ item.criterias?.length ?? 0 }}개)
              </h4>

              <div class="criteria-list">
                <div
                  class="criteria-card"
                  v-for="c in (item.criterias ?? [])"
                  :key="c.criteriaCriteriaId"
                >
                  <div class="criteria-badge">
                    {{ c.criteriaRank }}
                  </div>

                  <div class="criteria-content">
                    <div class="criteria-score">
                      점수 {{ c.criteriaMinScore }} ~ {{ c.criteriaMaxScore }}
                    </div>
                    <div class="criteria-desc">
                      {{ c.criteriaDescription }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- 로딩/빈값 -->
      <div class="empty" v-else>
        데이터를 불러오는 중입니다...
      </div>
    </div>
  </div>
</template>

<!--script-->
<script setup lang="ts">
//Import 구문
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/api/apiClient";

//외부 로직
const route = useRoute();
const router = useRouter();

/**
 * 설명: 이전 페이지로 이동하는 메소드
 */
const goBack = () => router.back();

const evaluationId = Number(route.params.id);

//Reactive 데이터
const evaluation = ref<any>(null);
const openedCriteria = ref<Record<number, boolean>>({});

/**
 * 설명: 평가 기준 토글 메소드
 * @param {number} selectedItemId - 선택된 평가 항목 ID 
 */
const toggleCriteria = (selectedItemId: number) => {
  openedCriteria.value[selectedItemId] = !openedCriteria.value[selectedItemId];
};

/**
 * 설명: 평가 기간 형식 변환 메소드
 */
const formattedPeriod = computed(() => {
  if (!evaluation.value) return "-";
  const start = evaluation.value.evaluationEvaluationPeriodStart?.slice(0, 10);
  const end = evaluation.value.evaluationEvaluationPeriodEnd?.slice(0, 10);
  if (!start || !end) return "-";
  return `${start} ~ ${end}`;
});

/**
 * 설명: 평가 상태 전환 메소드
 * @param {number} status - 평가 상태 값 
 */
const statusText = (status: number) => {
  switch (status) {
    case 0: return "진행중(미작성 존재)";
    case 1: return "작성완료(채점 대기)";
    case 2: return "완료(집계 완료)";
    default: return `상태 ${status}`;
  }
};

/**
 * 설명: 평가 상태 뱃지색깔 전환 메소드
 * @param {number} status - 평가 상태 값 
 */
const statusClass = (status: number) => {
  switch (status) {
    case 0: return "badge-warn";
    case 1: return "badge-info";
    case 2: return "badge-ok";
    default: return "badge-etc";
  }
};

/**
 * 설명: 피평가자 상태 전환 메소드
 * @param {number} status - 피평가자 상태 값 
 */
const evaluateeStatusText = (status: number) => {
  switch (status) {
    case 0: return "미작성";
    case 1: return "작성완료";
    case 2: return "채점완료";
    default: return `상태 ${status}`;
  }
};

/**
 * 설명: 피평가자 상태 뱃지색깔 전환 메소드 
 * @param {number} status - 피평가자 상태 값 
 */
const evaluateeStatusClass = (status: number) => {
  switch (status) {
    case 0: return "badge-warn";
    case 1: return "badge-info";
    case 2: return "badge-ok";
    default: return "badge-etc";
  }
};

/**
 * 설명: 평가 조회 메소드
 */
const loadEvaluation = async () => {
  const res = await apiClient.get(`/evaluation/evaluation/${evaluationId}`);
  evaluation.value = res.data;

  // 기본: 모두 접힘
  const items = evaluation.value?.selectedItems ?? [];
  items.forEach((it: any) => {
    const key = it.selectedItemSelectedItemId;
    if (typeof key === "number") openedCriteria.value[key] = false;
  });
};

/**
 * 설명: 평가 재조회 메소드
 */
const reload = async () => {
  evaluation.value = null;
  await loadEvaluation();
};

/**
 * 설명: 평가 삭제 메소드
 */
const deleteEvaluation = async () => {
  if (!confirm("정말 이 평가를 삭제할까요? (되돌릴 수 없습니다)")) return;

  await apiClient.delete(`/evaluation/evaluation/${evaluationId}`);
  alert("평가가 삭제되었습니다.");
  router.back();
};

/**
 * 설명: 평가 종료일 포맷
 */
const formattedEndedAt = computed(() => {
  if (!evaluation.value?.evaluationEndedAt) return "-";
  return evaluation.value.evaluationEndedAt.slice(0, 10);
});

/**
 * 설명: 마운트 시, 평가 조회
 */
onMounted(loadEvaluation);
</script>

<!--style-->
<style scoped>
/* ================= Layout ================= */
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: #f5f6fa;
  flex: 1;
  height: 100%;
  min-height: 0;
}

.content {
  width: 100%;
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.form-box {
  max-width: 1200px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 14px;
  outline: 2px solid #e2e8f0;
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.empty {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  color: #64748b;
}

/* ================= Header (CreateEvaluation.vue와 동일) ================= */
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

.btn-container {
  display: flex;
  gap: 10px;
}

.btn-edit {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

.btn-remove {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

/* ================= Typography ================= */
.section-title {
  text-align: center;
  font-size: 25px;
  font-weight: 600;
  color: #1c398e;
}

.sub-title {
  font-size: 20px;
  font-weight: 600;
  color: #1c398e;
  margin-top: 12px;
}

/* ================= Info Grid ================= */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.info-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #0f172b;
}

.mono {
  font-variant-numeric: tabular-nums;
}

.sep {
  color: #94a3b8;
  margin: 0 6px;
}

/* ================= Badges ================= */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
}

.badge.small {
  padding: 5px 10px;
  font-size: 12px;
}

.badge-ok {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #047857;
}

.badge-info {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

.badge-warn {
  background: #fffbeb;
  border-color: #fde68a;
  color: #b45309;
}

.badge-etc {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

/* ================= Evaluatees ================= */
.employee-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.employee-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1.2px solid #e2e8f0;
}

.employee-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.employee-name {
  font-size: 14px;
  font-weight: 700;
  color: #1c398e;
  line-height: 1.2;
}

.employee-grade {
  font-size: 12px;
  color: #64748b;
  line-height: 1.2;
}

/* ================= Evaluation Item Cards (CreateEvaluation.vue 스타일) ================= */
.eval-card {
  background: #f8fafc;
  border-radius: 14px;
  border: 1.5px solid #e2e8f0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.2s ease;
}

/* Header */
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
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  border-radius: 10px;
  color: #fff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eval-title {
  font-size: 16px;
  font-weight: 600;
  color: #1c398e;
}

.eval-toggle {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #1c398e;
  cursor: pointer;
}

/* Body */
.eval-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-top: 1px solid #c6d2ff;
  padding-top: 20px;
}

/* Description */
.eval-desc {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.eval-desc-label {
  font-size: 13px;
  font-weight: 600;
  color: #62748e;
}

.eval-desc-text {
  font-size: 14px;
  color: #314158;
}

/* Criteria */
.eval-criteria {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.criteria-title {
  font-size: 14px;
  font-weight: 600;
  color: #1c398e;
}

.criteria-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.criteria-card {
  display: flex;
  gap: 14px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #c6d2ff;
  padding: 14px;
}

.criteria-badge {
  width: 40px;
  height: 40px;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  border-radius: 10px;
  color: #fff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.criteria-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.criteria-score {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.criteria-desc {
  font-size: 14px;
  color: #314158;
}

/* ================= Responsive ================= */
@media (max-width: 980px) {
  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
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