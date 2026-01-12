<!-- 
  File Name   : CreateEvaluationForm.vue
  Description : 피평가자가 평가서를 작성하는 페이지
 
  History
  2025/12/15 - 승민 최초 작성
 
  @author 승민
-->

<!--template-->
<template>
  <div class="container">

    <!-- ===== Header ===== -->
    <div class="header">
        <div class="title-wrapper">
          <button class="back-button" type="button" aria-label="뒤로가기">
            <img src="/images/arrow.svg" alt="" class="back-icon" @click="goBack"/>
          </button>
          <h1 class="title">평가서 작성</h1>
        </div>

        <div class="btn-container">
            <button
            class="btn-edit"
            @click="submitForm"
            :disabled="weightSum !== 100"
            >
            저장
            </button>
            <button class="btn-remove" @click="goBack">
            취소
            </button>
        </div>
    </div>

    <div class="content">
      <div class="top-layout">

        <!-- ===== 왼쪽 : 평가서 ===== -->
        <div class="form-box">

          <!-- 평가 정보 -->
          <h2 class="section-title">{{ evaluation.name }}</h2>

          <div class="flex-row">
            <div class="form-item">
              <label>평가자</label>
              <div class="text-view manager-view">
                {{ evaluation.managerName }}
              </div>
            </div>

            <div class="form-item">
              <label>피평가자</label>
              <div class="text-view evaluatee-view">
                {{ evaluatee.name }}
              </div>
            </div>
          </div>

          <div class="form-item">
            <label>평가 기간</label>
            <div class="text-view">
              {{ evaluation.periodStart }} ~ {{ evaluation.periodEnd }}
            </div>
          </div>

          <!-- ===== 평가 항목 ===== -->
          <h3 class="sub-title">평가 항목</h3>

          <div
            v-for="(item, index) in formItems"
            :key="item.selectedItemId"
            class="eval-card"
          >
            <div class="eval-card-header">
              <div class="eval-left">
                <div class="eval-index">{{ index + 1 }}</div>
                <div class="eval-title">{{ item.itemName }}</div>
              </div>

              <div class="weight-input">
                  <span>가중치</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      v-model.number="item.weight"
                    />
                    %
              </div>
            </div>

            <div class="eval-body">

              <p>{{ item.description }}</p>

              <!-- 평가 기준 -->
              <div class="criteria-list">
                <div
                  v-for="c in item.criterias"
                  :key="c.criteriaRank"
                  class="criteria-card"
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

              <!-- 본인 실적 -->
              <div class="form-item">
                <label>본인 실적</label>
                <div class="self-desc-card">
                  <textarea
                    v-model="item.selfDescription"
                    placeholder="본인의 실적을 구체적으로 작성해주세요."
                  />
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- ===== 오른쪽 : 가중치 카드 ===== -->
        <aside class="weight-card">
          <h3>가중치 합계</h3>
          <div class="weight-value">
            <span class="value">{{ weightSum }}</span> %
          </div>

          <div class="weight-bar">
            <div class="weight-fill" :style="{ width: gaugeWidth }"></div>
          </div>
          <p class="warning" v-if="weightSum !== 100">
            가중치 합계는 100%여야 합니다.
          </p>
        </aside>

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
import { useAuthStore } from '@/stores/auth';

// 외부 로직
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

// Reactive 데이터
const authEmployeeId = ref();
const authEmployeeName = ref();
const authDepartmentId = ref();
const authDepartmentName = ref();
const authGradeId = ref();
const authGradeName = ref();

const evaluation = ref<any>({});
const evaluatee = ref<any>({});
const formItems = ref<any[]>([]);

authEmployeeId.value = authStore.user?.employeeId
authEmployeeName.value = authStore.user?.employeeName
authDepartmentId.value = authStore.user?.departmentId
authDepartmentName.value = authStore.user?.departmentName
authGradeId.value = authStore.user?.gradeId
authGradeName.value = authStore.user?.gradeName

const evaluationId = Number(route.params.id);
const employeeId = Number(route.query.employeeId);
const departmentId = Number(route.query.departmentId);

/**
 * 설명: 이전 페이지로 이동하는 메소드
 */
const goBack = () => router.back();



/**
 * 설명: 평가 데이터 조회 메소드
 */
const loadData = async () => {
  const res = await apiClient.get(
    `/evaluation/evaluation/${evaluationId}`
  );
  const data = res.data;

  evaluation.value = {
    name: data.evaluationName,
    managerName: data.evaluationEmployeeName,
    periodStart: data.evaluationEvaluationPeriodStart?.slice(0, 10),
    periodEnd: data.evaluationEvaluationPeriodEnd?.slice(0, 10),
  };

  const target = data.evaluatees.find(
    (e: any) => e.evaluateeEmployeeId === employeeId
  );

  evaluatee.value = {
    name: target.evaluateeEmployeeName,
    grade: target.evaluateeGrade,
  };

  formItems.value = data.selectedItems.map((item: any) => ({
    selectedItemId: item.selectedItemSelectedItemId,
    itemName: item.selectedItemItemName,
    description: item.selectedItemItemDescription,
    weight: 0,
    selfDescription: "",
    criterias: item.criterias,
  }));
};

/**
 * 설명: 마운트 시, 평가 데이터 조회
 */
onMounted(() => {
    if(authEmployeeId.value != employeeId){
        alert("피평가자 본인이 아니시군요.")
        goBack()
    }
    loadData();
});

/* ===== 가중치 합 ===== */
const weightSum = computed(() =>
  formItems.value.reduce((sum, i) => sum + (i.weight || 0), 0)
);

/* ===== 저장 ===== */
const submitForm = async () => {
  if (weightSum.value !== 100) {
    alert("가중치 합계는 100%여야 합니다.");
    return;
  }

  await apiClient.post("/evaluation/evaluation-form", {
    evaluationFormEvaluationId: evaluationId,
    evaluationFormEmployeeId: employeeId,
    evaluationFormDepartmentId: departmentId,
    evaluationFormCreatedAt: new Date(),
    formItems: formItems.value.map(item => ({
      formItemSelectedItemId: item.selectedItemId,
      formItemWeight: item.weight,
      formItemDescription: item.selfDescription,
      itemScore: {

      },
    })),
  });

  alert("평가서가 저장되었습니다.");
  router.back();
};

const gaugeWidth = computed(() => {
  const value = Math.min(weightSum.value, 100);
  return `${value}%`;
});
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
  width: 100%;
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.top-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  max-width: 1400px;
  margin: 0 auto;
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
  background: linear-gradient(180deg, #1c398e, #162456);;
  color: white;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
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
}

.btn-remove:hover {
  opacity: 0.9;
}

/* ================= Form Box ================= */
.form-box {
  flex: 1;
  background: white;
  border-radius: 14px;
  outline: 2px solid #e2e8f0;
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ================= Typography ================= */
.section-title {
  text-align: center;
  font-size: 25px;
  font-weight: 600;
  color: #1c398e;
}

.sub-title {
  font-size: 18px;
  font-weight: 600;
  color: #1c398e;
  margin-top: 12px;
}

label {
  font-weight: 600;
  color: #1c398e;
}

/* ================= Form ================= */
.flex-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input,
.text-view {
  padding: 14px 18px;
  background: #f8fafc;
  border-radius: 11px;
  border: 1px solid #e2e8f0;
}

.textarea {
  min-height: 140px;
  resize: none;
}

/* ================= Weight Card ================= */
.weight-card {
  width: 320px;
  background: #eef2ff;
  border: 1px solid #c6d2ff;
  border-radius: 14px;
  padding: 20px;
  position: sticky;
  top: 0;
}

.warning {
  font-size: 13px;
  color: #2802d2;
}

.weight-value {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 4px;
  margin-top: 12px;
}

.value {
  font-size: 32px;
  font-weight: 700;
}

.weight-bar {
  margin-top: 10px;
  background: white;
  height: 12px;
  border-radius: 999px;
}

.weight-fill {
  height: 100%;
  background: #041798;
  border-radius: 999px;
}

/* ================= Evaluation Card ================= */
.eval-card {
  background: #f8fafc;
  border-radius: 14px;
  border: 1.5px solid #e2e8f0;
  padding: 24px;
}

.eval-card.active {
  background: #eef2ff;
  border-color: #4f39f6;
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
  font-weight: 600;
  color: #1c398e;
}

.eval-body {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ================= Criteria ================= */
.criteria-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.criteria-card {
  display: flex;
  gap: 12px;
  background: white;
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

.weight-input {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.weight-input input {
  width: 70px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #c6d2ff;
  text-align: right;
}

.manager-view {
    width: 370px;
}

.evaluatee-view {
    width: 370px;
}

.self-desc-card {
  background: white;
  border: 1.5px solid #c6d2ff;
  border-radius: 14px;
  padding: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.self-desc-card:focus-within {
  border-color: #4f39f6;
  box-shadow: 0 0 0 3px rgba(79, 57, 246, 0.15);
}

.self-desc-card textarea {
  width: 100%;
  min-height: 140px;
  resize: none;
  border: none;
  outline: none;
  font-size: 14px;
  line-height: 1.6;
  background: transparent;
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