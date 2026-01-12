<!-- 
  File Name   : EditEvaluationGuide.vue
  Description : 평가 가이드 수정 페이지
 
  History
  2025/12/11 - 승민 최초 작성
 
  @author 
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
        <h1 class="title">평가 가이드 수정</h1>
      </div>

      <button class="btn-save" @click="updateGuide">
        <span>저장</span>
      </button>
    </div>

    <div class="content">
      <div class="form-box">
        <h2 class="section-title">평가 가이드 정보</h2>

        <!-- 제목 수정 -->
        <div class="form-item">
          <label>가이드 제목</label>
          <input class="input" type="text" v-model="guideName" />
        </div>

        <!-- 작성자 & 적용 부서 -->
        <div class="flex-row">
          <div class="form-item">
            <label>작성자</label>
            <input class="input employee-input" type="text" v-model="employeeName" readonly />
          </div>

          <div class="form-item">
            <label>적용 부서</label>
            <input class="input department-input" type="text" v-model="departmentName" />
          </div>
        </div>

        <!-- 가이드 본문 수정 -->
        <div class="form-item">
          <h3 class="sub-title">평가 가이드 내용</h3>

          <!-- toast-ui editor -->
          <div ref="editorRef"></div>
        </div>

      </div>
    </div>
  </div>
</template>

<!--script-->
<script setup lang="ts">
// Import 구문
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import apiClient from "@/api/apiClient"

// TOAST UI Editor
import Editor from "@toast-ui/editor"
import "@toast-ui/editor/dist/toastui-editor.css"

// 외부 로직
const route = useRoute()
const router = useRouter()

// Reactive 변수
const guideId = ref<number | null>(null)
const guideName = ref<string>("")
const employeeId = ref<number | null>(null)
const employeeName = ref<string>("")
const departmentId = ref<number | null>(null)
const departmentName = ref<string>("")
const guideContent = ref<string>("")

// Editor 참조 변수 & Editor 객체 변수
const editorRef = ref<any>(null)
let editorInstance: any = null

// 이전 페이지로 이동 메소드
const goBack = () => {
  router.back()
}

/**
 * 설명: 평가 가이드 수정 메소드
 */
const updateGuide = async () => {
  if (
    !guideName.value.trim() ||
    !guideContent.value.trim() 
  ) {
    alert("평가 가이드명, 내용은 필수입니다.");
    return;
  }

  const htmlContent = editorInstance.getHTML()

  const payload = {
    evaluationGuideEvaluationGuideId: guideId.value,
    evaluationGuideName: guideName.value,
    evaluationGuideContent: htmlContent,
    evaluationGuideCreatedAt: new Date(),
    evaluationGuideEmployeeId: employeeId.value,
    evaluationGuideEmployeeName: employeeName.value,
    evaluationGuideDepartmentId: departmentId.value,
    evaluationGuideDepartmentName: departmentName.value
  }

  try {
    await apiClient.put(
      "/evaluation/evaluation-guide",
      payload
    )

    alert("평가 가이드가 수정되었습니다.")
    router.back()
  } catch (error) {
    console.error("수정 실패:", error)
    alert("수정에 실패했습니다. 다시 시도해주세요.")
  }
}

/**
 * 설명: 마운트 시, 평가 가이드 데이터 조회
 */
onMounted(async () => {
  const paramId = route.params.id

  //URL 파라미터 값이 유효한지 판단
  if (!paramId || isNaN(Number(paramId))) {
    alert("잘못된 접근입니다.")
    router.back()
    return
  }

  guideId.value = Number(paramId)

  try {
    const res = await apiClient.get(
      `/evaluation/evaluation-guide/${guideId.value}`
    )

    const data = res.data

    guideId.value = data.evaluationGuideEvaluationGuideId
    guideName.value = data.evaluationGuideName
    employeeId.value = data.evaluationGuideEmployeeId
    employeeName.value = data.evaluationGuideEmployeeName
    departmentId.value = data.evaluationGuideDepartmentId
    departmentName.value = data.evaluationGuideDepartmentName
    guideContent.value = data.evaluationGuideContent

    // Editor 객체 초기화
    editorInstance = new Editor({
      el: editorRef.value,
      height: "500px",
      initialEditType: "wysiwyg",
      previewStyle: "vertical",
      initialValue: guideContent.value
    })

    //Editor 내용 수정 시, guideContent 변수에 반영
    editorInstance.on("change", () => {
      guideContent.value = editorInstance.getHTML()
    })

  } catch (error) {
    console.error("조회 실패:", error)
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
  gap: 8px;
}

.input {
  padding: 16px 20px;
  background: #F8FAFC;
  border-radius: 11px;
  border: 1px solid #E2E8F0;
  font-size: 16px;
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

.employee-input,
.department-input {
  width: 550px;
}

.back-icon {
  cursor: pointer;
}

.section-title {
  flex: 1;
  margin-left: 16px;
  text-align: center;
  font-size: 25px;
  font-weight: 600;
  color: #1c398e;
}

label {
  font-size: 15px;
  font-weight: 600;
  color: #1c398e;
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