<!-- 
  <pre>
  File Name   : CreateEvaluationTemplate.vue
  Description : 평가 템플릿을 생성하기 위한 페이지
 
  History
  2025/12/09 - 승민 최초 작성
  </pre>
 
  @author 승민
  @version 1.0
-->

<!--template-->
<template>
  <div class="container">
    <!-- 평가 템플릿 생성 헤더 -->
    <div class="header">
      <div class="title-wrapper">
        <button class="back-button" type="button" aria-label="뒤로가기">
          <img src="/images/arrow.svg" alt="" class="back-icon" @click="goBack"/>
        </button>
        <h1 class="title">평가 템플릿 생성</h1>
      </div>

      <button class="btn-save" @click="saveTemplate">
        <span>저장</span>
      </button>
    </div>

    <div class="content">
      <div class="form-box">
        <h2 class="section-title">평가 템플릿</h2>

        <!-- 평가 템플릿 이름 -->
        <div class="form-item">
          <label>평가서 이름</label>
          <input class="input" type="text" placeholder="예: 2025년 상반기 직원 성과 평가" v-model="templateName"/>
        </div>

        <!-- 생성자 & 생성부서 -->
        <div class="flex-row">
          <div class="form-item">
            <label>생성자</label>
            <input 
              class="input employee-input" 
              type="text" 
              v-model="creator"
              readonly
            />
          </div>
          <div class="form-item">
            <label>생성부서</label>
            <input 
              class="input department-input" 
              type="text"
              v-model="departmentName"
              readonly
            />  
          </div>
        </div>

        <!-- 평가 기간 -->
        <div class="section-group">
          <h3 class="sub-title">평가 기간 정보</h3>
          <div class="flex-row">
            <div class="form-item">
              <label>평가 기간명</label>
              <input class="input period-input" type="text" placeholder="예: 2025년 상반기"  v-model="periodName"/>
            </div>
            <div class="form-item">
              <label>평가 시작일</label>
              <input class="input start-input" type="date" v-model="startDate"/>
            </div>
            <div class="form-item">
              <label>평가 종료일</label>
              <input class="input end-input" type="date" v-model="endDate"/>
            </div>
          </div>
        </div>

        <!-- 평가 유형 -->
        <div class="form-item">
          <h3 class="sub-title">평가 유형</h3>
          <select class="input" v-model="evaluationType">
            <option :value="1">성과평가</option>
            <option :value="2">능력평가</option>
            <option :value="3">행동평가</option>
          </select>
        </div>

        <!-- 평가 항목 -->
        <h3 class="sub-title">평가 항목</h3>

        <div class="evaluation-scroll">
          <div
              class="evaluation-container"
              v-for="(item, index) in templateItems"
              :key="index"
          >
              <!-- 섹션 헤더 -->
              <header class="section-header">
                  <div class="number-badge">{{ index + 1 }}</div>
                  <h2 class="section-title">평가 항목</h2>
                  <button class="icon-button" @click="removeEvaluationItem(index)">
                  <img class="icon" src="/images/trashcan.svg" />
                  </button>
              </header>

              <!-- 항목 제목 -->
              <section class="field-group">
                  <label>항목 제목</label>
                  <input
                  class="input-field"
                  type="text"
                  v-model="item.title"
                  placeholder="예: 업무 수행 능력"
                  />
              </section>

              <!-- 항목 설명 -->
              <section class="field-group">
                  <label>항목 설명</label>
                  <textarea
                  class="textarea-field"
                  v-model="item.description"
                  placeholder="예: 이 항목은 직원의 업무 능력을 평가합니다"
                  ></textarea>
              </section>

              <!-- 평가 기준 영역 -->
              <section class="criteria-section">
                  <label>항목별 평가 기준</label>

                  <div
                  class="criteria-item"
                  v-for="(criteria, cIndex) in item.criteria"
                  :key="cIndex"
                  >
                  <div class="criteria-col">
                      <label>등급</label>
                      <input class="criteria-input" v-model="criteria.grade" />
                  </div>
                  <div class="criteria-col">
                      <label>최소 점수</label>
                      <input class="criteria-input" type="number" v-model="criteria.minScore" />
                  </div>
                  <div class="criteria-col">
                      <label>최대 점수</label>
                      <input class="criteria-input" type="number" v-model="criteria.maxScore" />
                  </div>
                  <div class="criteria-col flex-2">
                      <label>설명</label>
                      <input class="criteria-input" v-model="criteria.description" />
                  </div>

                  <button class="icon-button small" @click="removeCriteria(index, cIndex)">
                      <img class="icon" src="/images/trashcan.svg" />
                  </button>
                  </div>

                  <button class="add-criteria-btn" @click="addCriteria(index)">
                  항목별 기준 추가
                  </button>
              </section>
          </div>
        </div>

        <button class="add-box" @click="addEvaluationItem">
          <div class="add-button">+ 평가 항목 추가</div>
        </button>
      </div>
    </div>
  </div>
</template>

<!--script-->
<script setup lang="ts">
// Import 구문
import { onMounted, ref } from "vue";
import apiClient from "@/api/apiClient";
import { useRouter } from "vue-router";
import { useAuthStore } from '@/stores/auth';

// useRouter()를 router 변수로 정의 (외부 로직)
const router = useRouter();
const authStore = useAuthStore();

console.log(authStore.user)

// Reactive 데이터
const templateName = ref("");
const creator = ref(""); 
const employeeId = ref();     
const departmentId = ref<number>(); 
const departmentName = ref(""); 
const periodName = ref("");
const startDate = ref("");
const endDate = ref("");
const evaluationType = ref<number | null>(null);

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

onMounted(() => {
  if(!authStore.hasAnyRole(['ROLE_SYSTEM_ADMIN','ROLE_HR_MANAGER','ROLE_HR_EVALUATION'])){
    alert("인사팀이 아닙니다.");
    goBack();
  }

  employeeId.value = authEmployeeId.value
  creator.value = authEmployeeName.value
  departmentId.value = authDepartmentId.value
  departmentName.value = authDepartmentName.value
})

// 평가 기준 타입
interface Criteria {
  grade: string;
  minScore: number;
  maxScore: number;
  description: string;
}

// 평가 항목 타입
interface TemplateItem {
  title: string;
  description: string;
  criteria: Criteria[];
}

// 평가 항목 초기 상태
const templateItems = ref<TemplateItem[]>([
  {
    title: "",
    description: "",
    criteria: []
  }
]);


/**
 * 설명 : 평가 항목 추가 메소드
 */
const addEvaluationItem = () => {
  templateItems.value.push({
    title: "",
    description: "",
    criteria: []
  });
};
 
/**
 * 설명 : 평가 항목 삭제 메소드
 * @param {number} index - templateItems 목록의 인덱스
 */
const removeEvaluationItem = (index: number) => {
  templateItems.value.splice(index, 1);
};

/**
 * 설명 : 평가 기준 추가 메소드
 * @param {number} itemIndex - templateItems 목록의 인덱스
 */
const addCriteria = (itemIndex: number) => {
  templateItems.value[itemIndex].criteria.push({
    grade: "",
    minScore: 0,
    maxScore: 100,
    description: ""
  });
};


/**
 * 설명 : 평가 기준 삭제 메소드
 * @param {number} itemIndex, {number} criteriaIndex - templateItems 목록의 인덱스, criteria 목록의 인덱스
 */
const removeCriteria = (itemIndex: number, criteriaIndex: number) => {
  templateItems.value[itemIndex].criteria.splice(criteriaIndex, 1);
};

/**
 * 설명 : 평가 템플릿 저장(등록) 메소드
 */
const saveTemplate = async () => {
  if (
    !templateName.value.trim() ||
    !periodName.value.trim() ||
    !startDate.value ||
    !endDate.value
  ) {
    alert("평가 템플릿명, 기간명, 시작일, 종료일은 필수입니다.");
    return;
  }

  for (const item of templateItems.value) {
    if (!item.title.trim()) {
      alert("모든 평가 항목에는 항목명이 반드시 입력되어야 합니다.");
      return;
    }

    if (item.criteria.length === 0) {
      alert("각 평가 항목에는 최소 1개의 평가 기준이 필요합니다.");
      return;
    }

    for (const criteria of item.criteria) {
      if (!criteria.grade.trim()) {
        alert("모든 평가 기준에는 등급이 반드시 입력되어야 합니다.");
        return;
      }
    }
  }


  try {
    const payload = {
      evaluationTemplateName: templateName.value,
      evaluationTemplateCreatedAt: new Date(), 
      evaluationTemplateEmployeeId: employeeId.value, 
      evaluationTemplateDepartmentId: departmentId.value,
      evaluationTemplateType: evaluationType.value,
      templateItems: templateItems.value.map(item => ({
        templateItemTemplateId: null,
        templateItemItem: item.title,
        templateItemDescription: item.description,
        criterias: item.criteria.map(criteria => ({
          criteriaItemId: null,
          criteriaRank: criteria.grade,
          criteriaDescription: criteria.description,
          criteriaMinScore: criteria.minScore,
          criteriaMaxScore: criteria.maxScore,
        })),
      })),
      evaluationPeriod: {
        evaluationPeriodTemplateId: null,
        evaluationPeriodName: periodName.value,
        evaluationPeriodStart: convertToLocalDateTime(startDate.value),
        evaluationPeriodEnd: convertToLocalDateTime(endDate.value),
      }
    };

    const response = await apiClient.post(
      "/evaluation/evaluation-template",
      payload
    );

    alert("평가 템플릿 저장 완료");
    goBack();

  } catch (error) {
    console.error("Error saving template:", error);
    alert("저장 실패, 확인 후 재시도해주세요");
  }
};


/**
 * 설명 : 날짜에 시간(00:00:00)추가 메소드
 * @param {string} date - 문자열형식의 날짜 데이터
 * @return {string} date - 날짜 데이터에 시간을 추가하여 문자열 반환
 */
const convertToLocalDateTime = (date: string) => {
  return date ? `${date}T00:00:00` : null;
};

/**
 * 설명 : 뒤로 가기 메소드
 */
const goBack = () => router.back();
</script>

<!--style-->
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: #f5f6fa;
  min-height: 0;
  flex: 1;       
  height: 100%;
}

.content {
  width: 100%;
  padding: 24px;

  display: flex;                
  justify-content: center;      
  align-items: flex-start;      

  overflow-y: auto;
  flex: 1;
}

.form-box {
  width: 100%;
  max-width: 1200px; 
  background: white;
  border-radius: 14px;
  outline: 2px #E2E8F0 solid;
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

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

.btn-save {
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  color: white;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

.btn-save:hover {
  opacity: 0.9;
}

.form-item {
  display: flex;
  flex-direction: column;
}

.input {
  padding: 16px 20px;
  background: #F8FAFC;
  border-radius: 11px;
  border: 1px solid #E2E8F0;
}

.flex-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.sub-title {
  color: #1C398E;
  font-size: 20px;
  margin-bottom: 12px;
}

/* 평가 항목 리스트 */
.item-list {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 11px;
  padding: 20px;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.item-index {
  width: 40px;
  height: 40px;
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  color: white;
  border-radius: 11px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-box {
  width: 100%;
  height: 64px;
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.10);
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.add-button {
  color: white;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.evaluation-container {
  width: 100%;
  background: #f8fafc;
  border-radius: 11px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.number-badge {
  width: 40px;
  height: 40px;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  border-radius: 11px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.section-title {
  flex: 1;
  margin-left: 16px;
  text-align: center;
  font-size: 25px;
  font-weight: 600;
  color: #1c398e;
}

.icon-button {
  width: 40px;
  height: 40px;
  background: transparent;
  cursor: pointer;
}

.icon-button.small {
  width: 32px;
  height: 32px;
}

.field-group {
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 15px;
  font-weight: 600;
  color: #1c398e;
}

.required {
  color: #fb2c36;
}

.input-field,
.textarea-field {
  background: white;
  border-radius: 11px;
  border: 1px solid #e2e8f0;
  padding: 14px 20px;
  font-size: 16px;
}

.textarea-field {
  height: 100px;
  resize: none;
}

/* 평가 기준 */
.criteria-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.criteria-empty-box {
  text-align: center;
  color: #62748e;
  font-size: 14px;
  background: #f8fafc;
  border-radius: 11px;
  padding: 20px;
  border: 1px solid #cad5e2;
}

.criteria-item {
  background: #fff;
  border-radius: 11px;
  border: 1px solid #e2e8f0;
  padding: 16px;
  display: flex;
  gap: 12px;
}

.criteria-col {
  display: flex;
  flex-direction: column;
  width: 180px;
}

.criteria-col.flex-2 {
  width: 100%;
}

.criteria-col label {
  font-size: 13px;
  color: #62748e;
  margin-bottom: 6px;
}

.criteria-input {
  background: #f8fafc;
  border-radius: 11px;
  border: 1px solid #e2e8f0;
  padding: 12px;
  font-size: 15px;
}

.add-criteria-btn {
  background: #fff;
  color: #1c398e;
  font-weight: 600;
  border-radius: 11px;
  padding: 12px;
  border: 1.5px solid #1c398e;
  cursor: pointer;
}

.employee-input {
    width: 550px;
}

.department-input {
    width: 555px;
}

.period-input {
    width: 400px;
}

.start-input {
    width: 340px;
}

.end-input {
    width: 340px;
}

.back-icon {
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

.evaluation-scroll {
  max-height: 500px;        
  overflow-y: auto;
  padding-right: 6px;      
}
</style>