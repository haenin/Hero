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
    <!-- 평가 가이드 생성 헤더 -->
    <div class="header">
      <div class="title-wrapper">
        <button class="back-button" type="button" aria-label="뒤로가기">
          <img src="/images/arrow.svg" alt="" class="back-icon" @click="goBack"/>
        </button>
        <h1 class="title">평가 가이드 작성</h1>
      </div>

      <button class="btn-save" @click="saveGuide">
        <span>저장</span>
      </button>
    </div>

    <div class="content">
      <div class="form-box">
        <h2 class="section-title">평가 가이드 정보</h2>

        <!-- 가이드 제목 -->
        <div class="form-item">
          <label>가이드 제목</label>
          <input
            class="input"
            type="text"
            placeholder="예: 2025년 상반기 평가 가이드"
            v-model="guideName"
          />
        </div>

        <!-- 작성자 & 적용 부서 -->
        <div class="flex-row">
          <div class="form-item">
            <label>작성자</label>
            <input 
              class="input employee-input" 
              type="text"  
              v-model="creator"
              readonly
            />
          </div>

          <div class="form-item">
            <label>적용 부서</label>
            <input 
              class="input department-input"
              type="text" 
              v-model="departmentName"
              readonly
            />
          </div>
        </div>

        <!-- 가이드 본문 -->
        <div class="form-item">
          <h3 class="sub-title">평가 가이드 내용</h3>

          <div ref="editorRef" class="toast-editor"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<!--script-->
<script setup lang="ts">
// Import 구문
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api/apiClient'
import Editor from "@toast-ui/editor"
import "@toast-ui/editor/dist/toastui-editor.css"
import { useAuthStore } from '@/stores/auth';

// useRouter()를 router 변수로 정의 (외부 로직)
const router = useRouter()
const authStore = useAuthStore();

// Reactive 데이터
const guideName = ref('')
const creator = ref('')
const employeeId = ref();
const departmentId = ref<number>();
const departmentName = ref('')
const guideContent = ref('')

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

// 평가 가이드 내용을 기입할 때 사용되는 에디터 참조 데이터
const editorRef = ref<HTMLDivElement | null>(null)
let editorInstance: Editor | null = null

/**
 * 설명 : 이전 페이지 이동 메소드
 */
const goBack = () => {
  router.back()
}

/**
 * 설명 : 평가 가이드 저장 메소드
 */
const saveGuide = async () => {
  if (
    !guideName.value.trim() ||
    !guideContent.value.trim() 
  ) {
    alert("평가 가이드명, 내용은 필수입니다.");
    return;
  }
  
  try {
    const payload = {
        evaluationGuideName: guideName.value,
        evaluationGuideContent: guideContent.value,
        evaluationGuideCreatedAt: new Date(),
        evaluationGuideEmployeeId: employeeId.value,
        evaluationGuideDepartmentId: departmentId.value
    }

    const response = await apiClient.post(
        "/evaluation/evaluation-guide",
        payload
    )

    console.log('📌 평가 가이드 저장 데이터:', payload)

    alert('평가 가이드가 저장되었습니다.')
    goBack();
  } catch (error) {
    console.error("Error saving template:", error);
    alert("저장 실패, 확인 후 재시도해주세요");
  }
}

/**
 * 설명 : 페이지 마운트 시, 평가 가이드의 내용을 기입하기 위한 에디터 객체를 생성하는 생명주기(onMounted) 훅
 */
onMounted(async () => {
  if(!authStore.hasAnyRole(['ROLE_SYSTEM_ADMIN','ROLE_HR_MANAGER','ROLE_HR_EVALUATION'])){
    alert("인사팀이 아닙니다.");
    goBack();
  }

  employeeId.value = authEmployeeId.value
  creator.value = authEmployeeName.value
  departmentId.value = authDepartmentId.value
  departmentName.value = authDepartmentName.value

  //페이지가 렌더링 될 때까지 기다리는데 필요한 코드
  await nextTick()

  if (!editorRef.value) {
    console.error("❌ editorRef가 DOM에 없음")
    return
  }

  //Toast UI 에디터를 화면에 생성 나타내게 하는 객체 생성
  editorInstance = new Editor({
    el: editorRef.value,
    height: "400px",
    initialEditType: "wysiwyg",
    previewStyle: "vertical"
  })

  //사용자가 입력한 HTML 내용을 guideContent에 저장
  editorInstance.on("change", () => {
    guideContent.value = editorInstance!.getHTML()
  })
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
  font-size: 24px;
  font-weight: 600;
  color: #1c398e;
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

.guide-textarea {
  width: 100%;
  height: 300px;
  border-radius: 14px;
  border: 1px solid #E2E8F0;
  padding: 20px;
  font-size: 16px;
  resize: none;
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


label {
  font-size: 15px;
  font-weight: 600;
  color: #1c398e;
}
</style>