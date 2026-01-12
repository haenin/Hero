<!-- 
  File Name   : EvaluationGuideDetail.vue
  Description : 평가 가이드 세부 페이지
 
  History
  2025/12/10 - 승민 최초 작성
 
  @author 승민
  @version 1.0
-->

<!--template-->
<template>
  <div class="container">
    <!-- 헤더 -->
    <div class="header">
      <div class="title-wrapper">
        <button class="back-button" type="button" aria-label="뒤로가기">
          <img src="/images/arrow.svg" alt="" class="back-icon" @click="goBack"/>
        </button>
        <h1 class="title">평가 가이드 상세 페이지</h1>
      </div>

      <div class="btn-container">
        <button class="btn-edit" @click="goToEdit">수정</button>
        <button class="btn-remove" @click="deleteGuide">삭제</button>
      </div>
    </div>

    <div class="content">
      <div class="form-box">
        <h2 class="section-title">평가 가이드 상세</h2>

        <!-- 가이드 제목 -->
        <div class="form-item">
          <label>가이드 제목</label>
          <div class="view-text">{{ guideName }}</div>
        </div>

        <!-- 작성자 & 적용 부서 -->
        <div class="flex-row">
          <div class="form-item">
            <label>작성자</label>
            <div class="view-text employee-input">{{ creator }}</div>
          </div>

          <div class="form-item">
            <label>적용 부서</label>
            <div class="view-text department-input">{{ departmentName }}</div>
          </div>
        </div>

        <!-- 평가 가이드 본문 (에디터 HTML 그대로 출력) -->
        <div class="form-item">
          <h3 class="sub-title">평가 가이드 내용</h3>

          <div class="guide-view" v-html="guideContent"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<!--script-->
<script setup lang="ts">
//Import 구문
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import apiClient from "@/api/apiClient"
import "@toast-ui/editor/dist/toastui-editor.css"
import { useAuthStore } from '@/stores/auth';

// 외부 로직
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

//Reactive 데이터
const guideId = ref<number | null>(null)
const guideName = ref<string>("")
const creator = ref<string>("")
const departmentName = ref<string>("")
const guideContent = ref<string>("")

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
 * 설명: 이전 페이지로 이동하는 메소드
 */
const goBack = () => {
  router.back()
}

/**
 * 설명: 평가 가이드 수정 페이지로 이동하는 메소드
 */
const goToEdit = () => {
  if(authDepartmentId.value != 2){
    alert("인사팀이 아니라서 수정할 수 없습니다.")
    goBack();
  }


  router.push(`/evaluation/guide/edit/${guideId.value}`);
};

/**
 * 설명 : 평가 템플릿 제거 메소드
 */
const deleteGuide = async (): Promise<void> => {
  if (!guideId.value) {
    alert("삭제할 가이드 ID가 없습니다.")
    return
  }

  const confirmDelete: boolean = confirm("정말 이 평가 가이드 삭제하시겠습니까?")
  if (!confirmDelete) return

  try {
    await apiClient.delete(
      `/evaluation/evaluation-guide/${guideId.value}`
    )

    alert("평가 가이드가 삭제되었습니다.")
    router.back()   // ✅ 삭제 후 이전 페이지 이동

  } catch (error) {
    console.error("삭제 실패:", error)
    alert("삭제에 실패했습니다. 다시 시도해주세요.")
  }
}

/**
 * 설명: 페이지 로드 시 평가 가이드 조회를 위한 생명주기 훅
 */
onMounted(async (): Promise<void> => {
  try {
    const paramId = route.params.id

    if (!paramId || isNaN(Number(paramId))) {
      alert("잘못된 접근입니다.")
      router.back()
      return
    }

    guideId.value = Number(paramId)

    const response = await apiClient.get(
      `/evaluation/evaluation-guide/${guideId.value}`
    )

    const data = response.data

    guideName.value = data.evaluationGuideName as string
    creator.value = data.evaluationGuideEmployeeName as string
    departmentName.value = data.evaluationGuideDepartmentName as string
    guideContent.value = data.evaluationGuideContent as string

  } catch (error) {
    console.error("평가 가이드 조회 실패:", error)
    alert("평가 가이드 조회에 실패했습니다.")
  }
})
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

.section-title {
  flex: 1;
  margin-left: 16px;
  text-align: center;
  font-size: 25px;
  font-weight: 600;
  color: #1c398e;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.view-text {
  padding: 16px 20px;
  background: #F8FAFC;
  border-radius: 11px;
  border: 1px solid #E2E8F0;
  font-size: 16px;
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

/* ✅ 에디터 HTML 출력 영역 */
.guide-view {
  width: 100%;
  min-height: 300px;
  border-radius: 14px;
  border: 1px solid #E2E8F0;
  padding: 20px;
  font-size: 16px;
  background: #fff;
  line-height: 1.7;
}

/* ✅ 에디터에서 작성한 표 스타일 유지 */
:deep(.guide-view table) {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

:deep(.guide-view th),
:deep(.guide-view td) {
  border: 1px solid #cbd5e1;
  padding: 10px;
  text-align: center;
}

:deep(.guide-view th) {
  background: #f1f5f9;
  font-weight: 600;
}

.employee-input {
  width: 550px;
}

.department-input {
  width: 550px;
}

.back-icon {
  cursor: pointer;
}

label {
  font-size: 15px;
  font-weight: 600;
  color: #1c398e;
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
  margin-right: 10px;
}

.btn-edit:hover {
  opacity: 0.9;
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