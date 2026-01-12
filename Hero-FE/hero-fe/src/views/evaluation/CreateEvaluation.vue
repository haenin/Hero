<!-- 
  <pre>
  File Name   : CreateEvaluation.vue
  Description : 평가를 생성하기 위한 페이지
 
  History
  2025/12/14 - 승민 최초 작성
  </pre>
 
  @author 승민
  @version 1.0
-->

<!--template-->
<template>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="title-wrapper">
        <button class="back-button" type="button" aria-label="뒤로가기">
          <img src="/images/arrow.svg" alt="" class="back-icon" @click="goBack"/>
        </button>
        <h1 class="title">평가 생성</h1>
      </div>

      <div class="btn-container">
        <button class="btn-edit" @click="saveEvaluation">저장</button>
        <button class="btn-remove" @click="goBack">취소</button>
      </div>
    </div>

    <div class="content">
      <div class="form-box">

        <!-- ================= 평가 정보 ================= -->
        <h2 class="section-title">평가 생성</h2>

        <div class="form-item">
          <label>평가 이름</label>
          <input
            class="input"
            v-model="evaluationName"
            placeholder="예: 인사팀 2025 상반기 평가"
          />
        </div>

        <div class="flex-row">
          <div class="form-item period-input">
            <label>평가 기간</label>
            <div class="text-view">{{ formattedPeriod }}</div>
          </div>

          <div class="form-item period-input">
            <label>평가 가이드 <span class="required">*</span></label>
            <select class="input guide-input" v-model="selectedGuideId">
              <option disabled value="">가이드를 선택하세요</option>
              <option
                v-for="g in guideList"
                :key="g.evaluationGuideEvaluationGuideId"
                :value="g.evaluationGuideEvaluationGuideId"
              >
                {{ g.evaluationGuideName }}
              </option>
            </select>
          </div>
        </div>

        <!-- ================= 피평가자 ================= -->
        <h3 class="sub-title">피평가자 선택</h3>

        <div class="employee-grid">
        <label
            v-for="emp in employees"
            :key="emp.employeeEmployeeId"
            class="employee-card"
            :class="{ selected: selectedEmployeeIds.includes(emp.employeeEmployeeId) }"
        >
            <input
            type="checkbox"
            v-model="selectedEmployeeIds"
            :value="emp.employeeEmployeeId"
            />
            <div class="employee-info">
            <div class="employee-name">{{ emp.employeeEmployeeName }}</div>
            <div class="employee-grade">{{ emp.employeeGrade }}</div>
            </div>
        </label>
        </div>

        <!-- ================= 평가 항목 ================= -->
        <h3 class="sub-title">평가 항목</h3>
        <div class="evaluation-scroll">
          <div
            class="eval-card"
            v-for="(item, index) in templateItems"
            :key="item.templateItemItemId"
            :class="{ active: selectedItemIds.includes(item.templateItemItemId) }"
          >
            <!-- 카드 헤더 -->
            <div class="eval-card-header">
              <div class="eval-left">

                <!-- 체크박스 (번호 왼쪽) -->
                <input
                  class="eval-checkbox"
                  type="checkbox"
                  v-model="selectedItemIds"
                  :value="item.templateItemItemId"
                />

                <!-- 번호 -->
                <div class="eval-index">{{ index + 1 }}</div>

                <!-- 제목 -->
                <span class="eval-title">{{ item.templateItemItem }}</span>
            </div>

            <button
              class="eval-toggle"
              @click="toggleCriteria(item.templateItemItemId)"
            >
              {{ openedCriteria[item.templateItemItemId] ? "접기" : "기준 보기" }}
            </button>
          </div>


          <!-- 카드 바디 -->
          <div class="eval-body">
              <!-- 항목 설명 -->
              <div class="eval-desc">
              <span class="eval-desc-label">항목 설명</span>
              <p class="eval-desc-text">
                  {{ item.templateItemDescription }}
              </p>
              </div>

              <!-- 평가 기준 -->
              <div
              v-if="openedCriteria[item.templateItemItemId]"
              class="eval-criteria"
              >
              <h4 class="criteria-title">
                  평가 기준 ({{ item.criterias.length }}개)
              </h4>

              <div class="criteria-list">
                  <div
                  class="criteria-card"
                  v-for="c in item.criterias"
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

      </div>
    </div>
  </div>
</template>

<!--script-->
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/api/apiClient";
import { useAuthStore } from '@/stores/auth';

//외부 로직
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const templateId = Number(route.params.id);

//Reactive 데이터
const evaluationName = ref("");

const template = ref<any>(null);
const templateItems = ref<any[]>([]);
const selectedItemIds = ref<number[]>([]);

const authEmployeeId = ref();
const authEmployeeName = ref();
const authDepartmentId = ref();
const authDepartmentName = ref();
const authGradeId = ref();
const authGradeName = ref();


authEmployeeId.value = authStore.user?.employeeId
authEmployeeName.value = authStore.user?.employeeName
authDepartmentId.value = authStore.user?.departmentId
authDepartmentName.value = authStore.user?.departmentName
authGradeId.value = authStore.user?.gradeId
authGradeName.value = authStore.user?.gradeName



// 기준 접기/펼치기 상태 
const openedCriteria = ref<{ [key: number]: boolean }>({});
const toggleCriteria = (itemId: number) => {
  openedCriteria.value[itemId] = !openedCriteria.value[itemId];
};

// 평가 기간
const formattedPeriod = computed(() => {
  if (!template.value) return "";
  const start = template.value.evaluationPeriodStart?.slice(0, 10);
  const end = template.value.evaluationPeriodEnd?.slice(0, 10);
  return `${start} ~ ${end}`;
});

// 평가 가이드 
const guideList = ref<any[]>([]);
const selectedGuideId = ref("");

// 피평가자 
const employees = ref<any[]>([]);
const selectedEmployeeIds = ref<number[]>([]);

/**
 * 설명: 이전 페이지로 이동하는 메소드
 */
const goBack = () => router.back();

/**
 * 설명: 평가 테플릿을 조회하는 메소드
 */
const loadTemplate = async () => {
  const res = await apiClient.get(`/evaluation/evaluation-template/${templateId}`);
  template.value = res.data;
  templateItems.value = res.data.templateItems;

  await loadEmployees(authDepartmentId.value);
};

/** 
 * 설명: 평가 가이드 조회하는 메소드  
 */
const loadGuides = async () => {
  const res = await apiClient.get(`/evaluation/evaluation-guide/all2`);
  guideList.value = res.data;
};

/**
 * 설명: 피평가자를 조회하는 메소드
 * @param {number} deptId - 부서 번호
 */
const loadEmployees = async (deptId: number) => {
  const res = await apiClient.get(`/evaluation/evaluation/employee/${deptId}`);
  employees.value = res.data;

  selectedEmployeeIds.value = res.data.map(
    (emp: any) => emp.employeeEmployeeId
  );
};

/**
 * 설명: 평가 저장 메소드
 */
const saveEvaluation = async () => {
  if (!evaluationName.value.trim()) {
    alert("평가명을 입력하세요.");
    return;
  }
  if (!selectedGuideId.value) {
    alert("평가 가이드를 선택하세요.");
    return;
  }
  if (selectedItemIds.value.length === 0) {
    alert("평가 항목을 최소 1개 선택하세요.");
    return;
  }
  if (selectedEmployeeIds.value.length === 0) {
    alert("피평가자를 최소 1명 선택하세요.");
    return;
  }

  const payload = {
    evaluationEmployeeId: authEmployeeId.value,
    evaluationDepartmentId: authDepartmentId.value,
    evaluationTemplateId: templateId,
    evaluationName: evaluationName.value,
    evaluationStatus: 0,
    evaluationCreatedAt: new Date(),
    evaluationEvaluationGuideId: selectedGuideId.value,
    evaluationEvaluationPeriodId: template.value.evaluationPeriodEvaluationPeriodId,

    selectedItems: selectedItemIds.value.map(id => ({
      selectedItemItemId: id
    })),

    evaluatees: selectedEmployeeIds.value.map(id => ({
      evaluateeEmployeeId: id,
      evaluateeStatus: 0
    }))
  };

  await apiClient.post("/evaluation/evaluation", payload);
  alert("평가가 생성되었습니다.");
  router.back();
};

/**
 * 설명: 마운트 시, 평가 테플릿과 가이드 조회
 */
onMounted(async () => {
  if(!authStore.hasAnyRole(['ROLE_SYSTEM_ADMIN','ROLE_DEPT_MANAGER'])){
    alert("직급이 부장이 아니시라서 평가를 생성할 수 없습니다.")
    goBack();
  }
  await loadTemplate();
  await loadGuides();
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

.btn-container {
  display: flex;
  gap: 10px;
}

.btn-edit {
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);;
  color: white;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

.btn-edit:hover {
  opacity: 0.9;
}

.btn-remove {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

.btn-remove:hover {
  opacity: 0.9;
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

label {
  font-size: 15px;
  font-weight: 600;
  color: #1c398e;
}

.required {
  color: #fb2c36;
}

/* ================= Form ================= */
.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input {
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 11px;
  border: 1px solid #e2e8f0;
  font-size: 15px;
}

.text-view {
  margin-top: 8px;
  padding: 14px 20px;
  background: #f8fafc;
  border-radius: 11px;
  border: 1px solid #e2e8f0;
  font-size: 15px;
  color: #0f172b;
}

.text-view.small {
  padding: 10px 14px;
  font-size: 14px;
}

.flex-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.period-input {
  width: 400px;
}

/* ================= Employee (Compact) ================= */
.employee-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}

.employee-card {
  display: flex;
  align-items: center;
  gap: 8px;             
  width: 150px;
  padding: 8px 10px;    
  background: #f8fafc;
  border-radius: 10px;
  border: 1.2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.15s ease;
}

.employee-card input {
  width: 16px;
  height: 16px;
  accent-color: #1c398e;
}

.employee-card.selected {
  background: #eef2ff;
  border-color: #4f39f6;
}

.employee-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.employee-name {
  font-size: 14px;
  font-weight: 600;
  color: #1c398e;
  line-height: 1.2;
}

.employee-grade {
  font-size: 12px;
  color: #64748b;
  line-height: 1.2;
}

/* ================= Evaluation Item ================= */
.evaluation-container {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px;
  transition: all 0.2s ease;
}

.evaluation-container.selected {
  background: #eef2ff;
  border-color: #4f39f6;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
}

.number-badge {
  width: 40px;
  height: 40px;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  font-weight: 700;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-check {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #1c398e;
  flex: 1;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #1c398e;
  cursor: pointer;
}

/* ================= Criteria ================= */
.criteria-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 16px;
}

.criteria-card {
  display: flex;
  gap: 14px;
  background: white;
  border-radius: 12px;
  border: 1px solid #c6d2ff;
  padding: 14px;
}

.criteria-badge {
  width: 40px;
  height: 40px;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  border-radius: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.criteria-body {
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

.eval-card.active {
  background: #eef2ff;
  border-color: #4f39f6;
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

.eval-check {
  display: flex;
  align-items: center;
  gap: 10px;
}

.eval-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #1c398e;
  cursor: pointer;
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

.guide-input {
    margin-top: 8px;
}

.evaluation-scroll {
  max-height: 500px;        
  overflow-y: auto;
  padding-right: 6px;      
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