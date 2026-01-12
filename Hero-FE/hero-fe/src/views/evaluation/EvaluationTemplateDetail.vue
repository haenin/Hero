<!-- 
  <pre>
  File Name   : EvaluationTemplateDetail.vue
  Description : 평가 템플릿 상세 페이지
 
  History
  2025/12/09 - 승민 최초 작성
  </pre>
 
  @author 승민
  @version 1.0
-->

<!--template-->
<template>
  <div class="container">
    <!--평가 템플릿 세부 페이지 헤더-->
    <div class="header">
      <div class="title-wrapper">
        <button class="back-button" type="button" aria-label="뒤로가기">
          <img src="/images/arrow.svg" alt="" class="back-icon" @click="goBack"/>
        </button>
        <h1 class="title">평가 템플릿 상세</h1>
      </div>

      <div class="btn-container">
        <button class="btn-edit" @click="goToEdit">수정</button>
        <button class="btn-remove" @click="deleteTemplate">삭제</button>
      </div>
    </div>

    <!--평가 템플릿 세부 페이지 내용-->
    <div class="content">
      <div class="form-box">
        <h2 class="section-title">평가 템플릿 상세</h2>

        <!-- 평가 템플릿 이름 -->
        <div class="form-item">
          <label>평가서 이름</label>
          <div class="text-view name-text">{{ template?.evaluationTemplateName }}</div>
        </div>

        <!-- 생성자 & 생성부서 -->
        <div class="flex-row">
          <div class="form-item">
            <label>생성자</label>
            <div class="text-view employee-text">{{ template?.evaluationTemplateEmployeeName }}</div>
          </div>

          <div class="form-item">
            <label>생성부서</label>
            <div class="text-view department-text">{{ template?.evaluationTemplateDepartmentName }}</div>
          </div>
        </div>

        <!-- 평가 기간 -->
        <div class="section-group">
          <h3 class="sub-title">평가 기간 정보</h3>
          <div class="flex-row">
            <div class="form-item">
              <label>평가 기간명</label>
              <div class="text-view period-text">{{ template?.evaluationPeriodName }}</div>
            </div>

            <div class="form-item">
              <label>평가 시작일</label>
              <div class="text-view start-text">{{ formatDate(template?.evaluationPeriodStart) }}</div>
            </div>

            <div class="form-item">
              <label>평가 종료일</label>
              <div class="text-view end-text">{{ formatDate(template?.evaluationPeriodEnd) }}</div>
            </div>
          </div>
        </div>

        <!-- 평가 유형 -->
        <div class="form-item">
          <label>평가 유형</label>
          <div class="text-view">
            {{ getEvaluationTypeText(template?.evaluationTemplateType) }}
          </div>
        </div>

        <!-- 평가 항목 -->
        <h3 class="sub-title">평가 항목</h3>

        <div class="evaluation-scroll">
          <div
            class="evaluation-container"
            v-for="(item, index) in template?.templateItems"
            :key="index"
          >
            <header class="section-header">
              <div class="number-badge">{{ Number(index) + 1 }}</div>
            </header>

            <section class="field-group">
              <label>항목 제목</label>
              <div class="text-view">{{ item.templateItemItem }}</div>
            </section>

            <section class="field-group">
              <label>항목 설명</label>
              <div class="text-view">{{ item.templateItemDescription }}</div>
            </section>

            <section class="criteria-section">
              <label>항목별 평가 기준</label>

              <div
                class="criteria-item"
                v-for="(criteria, cIdx) in item.criterias"
                :key="cIdx"
              >
                <div class="criteria-col">
                  <label>등급</label>
                  <div class="text-view small">{{ criteria.criteriaRank }}</div>
                </div>
                <div class="criteria-col">
                  <label>최소 점수</label>
                  <div class="text-view small">{{ criteria.criteriaMinScore }}</div>
                </div>
                <div class="criteria-col">
                  <label>최대 점수</label>
                  <div class="text-view small">{{ criteria.criteriaMaxScore }}</div>
                </div>
                <div class="criteria-col flex-2">
                  <label>설명</label>
                  <div class="text-view">{{ criteria.criteriaDescription }}</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<!--script-->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/api/apiClient";
import { useAuthStore } from '@/stores/auth';

// useRouter()를 router 변수로 정의, useRoute()를 route 변수로 정의 (외부 로직)
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

//URL의 /:id를 templateId 변수로 정의
const templateId = route.params.id;

// Reactive 데이터
const template = ref<any>(null);

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

/**
 * 설명 : 평가 템플릿 상세 데이터 조회 메소드
 */
const getTemplateDetail = async () => {
  const res = await apiClient.get(
    `/evaluation/evaluation-template/${templateId}`
  );
  template.value = res.data;
};

/**
 * 설명 : 조회한 날짜 데이터에서 시간 제거 메소드
 * @param {string} date - 문자열형식의 날짜 데이터
 * @return {string} date - 날짜 데이터에 시간을 제거하여 문자열 반환
 */
const formatDate = (date: string | null) => {
  return date ? date.split("T")[0] : "-";
};


/**
 * 설명 : 이전 페이지 이동 메소드
 */
const goBack = () => router.back();

/**
 * 설명 : 수정 페이지로 이동
 */
const goToEdit = () => {
  if(authDepartmentId.value != 2){
    alert("인사팀이 아니라서 수정할 수 없습니다.")
    goBack();
  }
  router.push(`/evaluation/template/edit/${templateId}`);
};

/**
 * 설명 : 평가 템플릿 제거 메소드
 */
const deleteTemplate = async () => {
  const confirmDelete = confirm("정말 이 평가 템플릿을 삭제하시겠습니까?");
  if (!confirmDelete) return;

  try {
    await apiClient.delete(
      `/evaluation/evaluation-template/${templateId}`
    );

    alert("평가 템플릿이 삭제되었습니다.");
    router.back();

  } catch (error) {
    console.error("삭제 실패:", error);
    alert("삭제에 실패했습니다. 다시 시도해주세요.");
  }
};

/**
 * 설명 : 평가 유형 데이터 구분 메소드
 * @param {number} type - 평가 유형 데이터
 * @return {string} - 평가 유형 문자열 반환
 */
const getEvaluationTypeText = (type: number | null) => {
  switch (type) {
    case 1:
      return "성과평가";
    case 2:
      return "능력평가";
    case 3:
      return "행동평가";
    default:
      return "-";
  }
};


/**
 * 설명 : 페이지 마운트 시, 평가 템플릿의 세부 데이터를 조회하기 위한 생명주기(onMounted) 훅
 */
onMounted(() => {
  getTemplateDetail();
});
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

  display: flex;                /* ⭐ 핵심 */
  justify-content: center;      /* ⭐ 가로 중앙 */
  align-items: flex-start;      /* 세로는 위에서 시작 */

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
  width: 100%;
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

.btn-remove {
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  color: white;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

.btn-remove:hover {
  opacity: 0.9;
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

.section-title {
  text-align: center;
  font-size: 25px;
  color: #0F172B;
  font-weight: 600;
}

.sub-title {
  color: #1C398E;
  font-size: 20px;
  margin-bottom: 12px;
}

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

.text-view {
  padding: 14px 20px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  color: #0F172B;
}

.text-view.small {
  padding: 10px 14px;
}

.name-text {
    margin-top: 8px;
}

.employee-text {
    width: 550px;
    margin-top: 8px;
}

.department-text {
    width: 550px;
    margin-top: 8px;
}

.period-text {
    width: 380px;
    margin-top: 8px;
}

.start-text {
    width: 350px;
    margin-top: 8px;
}

.end-text {
    width: 350px;
    margin-top: 8px;
}

.back-icon {
    cursor: pointer;
}

.btn-container {
  display:flex; 
  gap:10px;
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