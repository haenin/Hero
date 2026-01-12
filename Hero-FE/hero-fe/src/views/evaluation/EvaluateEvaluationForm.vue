<!-- 
  File Name   : EvaluateEvaluationForm.vue
  Description : 평가서 평가 페이지
 
  History
  2025/12/15 - 승민 최초 작성
 
  @author 승민
  @version 1.0
-->
<!--tempalate-->
<template>
  <div class="container">

    <!-- Header -->
    <div class="header">
      <div class="title-wrapper">
        <button class="back-button" type="button" aria-label="뒤로가기">
          <img src="/images/arrow.svg" alt="" class="back-icon" @click="goBack"/>
        </button>
        <h1 class="title">평가 채점</h1>
      </div>

      <div class="btn-container">
        <button
          class="btn-edit"
          @click="submitGrading"
        >
          채점 완료
        </button>
        <button
          class="btn-remove"
          @click="goBack"
        >
          취소
        </button>
      </div>
    </div>

    <div class="content">
      <div class="form-box">

        <h2 class="section-title">{{ evaluation.name }}</h2>

        <div class="flex-row">
          <div class="form-item">
            <label>평가자</label>
            <div class="text-view manager-view">{{ evaluation.managerName }}</div>
          </div>

          <div class="form-item">
            <label>피평가자</label>
            <div class="text-view evaluatee-view">{{ evaluatee.name }}</div>
          </div>
        </div>

        <div class="form-item">
          <label>평가 기간</label>
          <div class="text-view">
            {{ evaluation.periodStart }} ~ {{ evaluation.periodEnd }}
          </div>
        </div>

        <h3 class="sub-title">채점 항목</h3>

        <div
          v-for="(item, index) in formItems"
          :key="item.formItemId"
          class="eval-card"
        >
          <div class="eval-card-header">
            <div class="eval-left">
              <div class="eval-index">{{ index + 1 }}</div>
              <div class="eval-title">{{ item.itemName }}</div>
            </div>

            <div class="weight-text">
              가중치 {{ item.weight }}%
            </div>
          </div>

          <div class="eval-body">

            <!-- 기준 -->
            <div class="criteria-list">
              <div
                v-for="c in item.criterias"
                :key="c.criteriaRank"
                class="criteria-card"
              >
                <strong>{{ c.criteriaRank }}</strong>
                {{ c.criteriaDescription }}
                ({{ c.criteriaMinScore }}~{{ c.criteriaMaxScore }})
              </div>
            </div>

            <div class="form-item">
              <label>피평가자 본인 실적</label>
              <div class="text-view">
                {{ item.selfDescription || '작성된 실적이 없습니다.' }}
              </div>
            </div>

            <div class="score-rank-row">

              <div class="form-item score-item">
                <label>점수</label>
                  <input
                    type="number"
                    v-model.number="item.score"
                    min="0"
                    max="100"
                  />
              </div>

                <div class="form-item rank-item">
                  <label>등급</label>
                  <select v-model="item.rank">
                    <option
                      v-for="c in item.criterias"
                      :key="c.criteriaRank"
                      :value="c.criteriaRank"
                    >
                      {{ c.criteriaRank }}
                    </option>
                  </select>
                </div>

            </div>

            <!-- 평가 코멘트 -->
            <div class="form-item">
              <label>평가 코멘트</label>
              <textarea v-model="item.comment" />
            </div>
          </div>
        </div>

        <!-- 총평 -->
        <div class="form-item">
          <label>총평</label>
          <textarea
            v-model="evaluation.total"
            placeholder="전체 평가에 대한 총평을 입력하세요."
          />
        </div>

      </div>
    </div>

  </div>
</template>

<!--script-->
<script setup lang="ts">
//Import 구문
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/api/apiClient";

//외부 로직
const route = useRoute();
const router = useRouter();
const goBack = () => router.back();

const evaluationId = Number(route.params.id);
const employeeId = Number(route.query.employeeId);

//Reactive 데이터
const evaluation = ref<any>({});
const evaluatee = ref<any>({});
const formItems = ref<any[]>([]);
const formId = ref<number>();

/**
 * 설명: 평가서 데이터를 조회하는 메소드
 */
const loadForm = async () => {
  const { data } = await apiClient.get(
    `/evaluation/evaluation-form/${evaluationId}/${employeeId}`
  );

  formId.value = data.evaluationFormFormId;

  evaluation.value = {
    name: data.evaluationFormEvaluationName,
    managerName: data.evaluationFormEvaluationEmployeeName,
    periodStart: data.evaluationFormEvaluationPeriodStart?.slice(0, 10),
    periodEnd: data.evaluationFormEvaluationPeriodEnd?.slice(0, 10),
    total: data.evaluationFormTotal ?? "",
  };

  evaluatee.value = {
    name: data.evaluationFormEmployeeName,
  };

  formItems.value = data.formItems.map((item: any) => ({
    formItemId: item.formItemFormItemId,
    weight: item.formItemWeight,
    itemName: item.formItemSelectedItemItemName,
    criterias: item.criterias,

    selfDescription: item.formItemDescription,

    score: item.itemScore?.itemScoreScore ?? null,
    rank: item.itemScore?.itemScoreRank ?? null,
    comment: item.itemScore?.itemScoreDescription ?? null,
    itemScoreId: item.itemScore?.itemScoreItemScoreId,
  }));
};

/**
 * 설명: 마운트 시, 평가서 데이터를 조회
 */
onMounted(loadForm);

/**
 * 설명: 채점 제출 메소드
 */
const submitGrading = async () => {
  await apiClient.put("/evaluation/evaluation-form/grading", {
    evaluationFormFormId: formId.value,
    evaluationFormEvaluationId: evaluationId,
    evaluationFormEmployeeId: employeeId,
    evaluationFormCreatedAt: new Date(),
    evaluationFormTotal: evaluation.value.total,

    formItems: formItems.value.map(item => ({
      formItemFormItemId: item.formItemId,
      formItemWeight: item.weight,
      itemScore: {
        itemScoreItemScoreId: item.itemScoreId,
        itemScoreScore: item.score,
        itemScoreRank: item.rank,
        itemScoreDescription: item.comment,
      }
    }))
  });

  alert("채점이 완료되었습니다.");
  router.back();
};
</script>

<!--style-->
<style scoped>
/* ================= Layout ================= */
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: #f5f6fa;
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
  background: white;
  border-radius: 14px;
  border: 2px solid #e2e8f0;
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 32px;
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
  cursor: pointer;
}

.btn-container {
  display: flex;
  gap: 10px;
}

.btn-edit {
  background: linear-gradient(180deg, #1c398e, #162456);
  color: white;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.btn-edit:hover {
  opacity: 0.9;
}

.btn-remove {
  background: linear-gradient(180deg, #1c398e, #162456);
  color: white;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.btn-remove:hover {
  opacity: 0.9;
}

/* ================= Typography ================= */
.section-title {
  text-align: center;
  font-size: 25px;
  font-weight: 700;
  color: #1c398e;
}

.sub-title {
  font-size: 18px;
  font-weight: 600;
  color: #1c398e;
}

label {
  font-size: 14px;
  font-weight: 600;
  color: #1c398e;
}

/* ================= Info Row ================= */
.flex-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.text-view {
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
}

/* ================= Evaluation Card ================= */
.eval-card {
  background: #f8fafc;
  border-radius: 14px;
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
  width: 34px;
  height: 34px;
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
  font-weight: 600;
  color: #1c398e;
}

.weight-text {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

/* ================= Evaluation Body ================= */
.eval-body {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ================= Criteria ================= */
.criteria-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.criteria-card {
  display: flex;
  gap: 10px;
  background: white;
  border: 1px solid #c6d2ff;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
}

.criteria-card strong {
  width: 28px;
  height: 28px;
  background: linear-gradient(180deg, #1c398e, #162456);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

/* ================= Inputs ================= */
input[type="number"],
select {
  width: 120px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #c6d2ff;
  font-size: 14px;
}

textarea {
  min-height: 100px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #c6d2ff;
  resize: none;
  font-size: 14px;
}

/* ================= Hover / Focus ================= */
input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #4f39f6;
  background: #eef2ff;
}

/* ================= Responsive ================= */
@media (max-width: 768px) {
  .form-box {
    padding: 20px;
  }

  .eval-card {
    padding: 16px;
  }

  .eval-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  input[type="number"],
  select {
    width: 100%;
  }
}

.manager-view {
    width: 400px;
}

.evaluatee-view {
    width: 400px;
}

.score-rank-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.score-item {
  flex: 0 0 140px;
}

.rank-item {
  flex: 0 0 140px;
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

