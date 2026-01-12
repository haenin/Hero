<!-- 
  <pre>
  File Name   : EvaluationTemplateList.vue
  Description : 평가 템플릿 목록 페이지
 
  History
  2025/12/09 - 승민 최초 작성
  </pre>
 
  @author 승민
  @version 1.0
-->

<!--template-->
<template>
  <div class="container">
    <div class="inner-wrapper">
      <div class="content-box">
        <div class="header">
          <button
            v-if="authStore.hasAnyRole(['ROLE_SYSTEM_ADMIN','ROLE_HR_MANAGER','ROLE_HR_EVALUATION'])"
            class="btn-new"
            @click="createTemplate"
          >
            + 새 템플릿 작성
          </button>
        </div>

        <div class="table-wrapper">
          <!--표 헤더-->
          <div class="table-header">
            <div class="col">문서번호</div>
            <div class="col">제목</div>
            <div class="col">기안부서</div>
            <div class="col">기안자</div>
            <div class="col">기안일시</div>
          </div>

          <!--표 바디-->
          <div class="table-body">
            <div
                class="row"
                v-for="(item, index) in evaluationTemplates"
                :key="item.evaluationTemplateTemplateId"
                :class="{ alt: index % 2 !== 0 }"
                @click="goToDetail(item.evaluationTemplateTemplateId)"
            >
                <div class="col blue">{{ item.evaluationTemplateTemplateId }}</div>
                <div class="col">{{ item.evaluationTemplateName }}</div>
                <div class="col">{{ item.evaluationTemplateDepartmentName }}</div>
                <div class="col">{{ item.evaluationTemplateEmployeeName }}</div>
                <div class="col">{{ formatDate(item.evaluationTemplateCreatedAt) }}</div>
            </div>
          </div>
        </div>

        <!--페이지 네이션 버튼-->
        <SlidingPagination
          v-model="currentPage"
          :total-pages="totalPages"
        />
      </div>
    </div>
  </div>
</template>

<!--script-->
<script setup lang="ts">
import apiClient from '@/api/apiClient';
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import SlidingPagination from '@/components/common/SlidingPagination.vue';


// useRouter()를 router변수로 정의 (외부 로직)
const router = useRouter();
const authStore = useAuthStore();

//페이지네이션 타입
interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

//평가 기준 타입
interface CriteriaResponseDTO {
  criteriaCriteriaId: number
  criteriaItemId: number
  criteriaRank: string
  criteriaDescription: string
  criteriaMinScore: number
  criteriaMaxScore: number
}

//평가 항목 타입
interface TemplateItemResponseDTO {
  templateItemItemId: number
  templateItemTemplateId: number
  templateItemItem: string
  templateItemDescription: string
  criterias: CriteriaResponseDTO[]
}

//평가 템플릿 타입
interface EvaluationTemplateResponseDTO {
  evaluationTemplateTemplateId: number
  evaluationTemplateName: string
  evaluationTemplateCreatedAt: string
  evaluationTemplateEmployeeId: number
  evaluationTemplateEmployeeName: string
  evaluationTemplateDepartmentId: number
  evaluationTemplateDepartmentName: string
  evaluationTemplateGradeId: number
  evaluationTemplateGrade: string
  evaluationTemplateType: number
  evaluationPeriodEvaluationPeriodId: number
  evaluationPeriodName: string
  evaluationPeriodStart: string
  evaluationPeriodEnd: string
  templateItems: TemplateItemResponseDTO[]
}

// Reactive 데이터
const evaluationTemplates = ref<EvaluationTemplateResponseDTO[]>([])

const currentPage = ref(0)   // 0부터 시작
const pageSize = ref(10)
const totalPages = ref(0)

const loading = ref(false)
const errorMessage = ref('')

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
 * 설명 : 전체 평가 템플릿 조회 메소드
 */
const selectEvaluationTemplateList = async (): Promise<void> => {
  try {
    loading.value = true

    const res = await apiClient.get<PageResponse<EvaluationTemplateResponseDTO>>(
      '/evaluation/evaluation-template/all',
      {
        params: {
          page: currentPage.value,
          size: pageSize.value
        }
      }
    )

    evaluationTemplates.value = res.data.content
    totalPages.value = res.data.totalPages

  } catch (error) {
    errorMessage.value = '평가 템플릿 조회에 실패했습니다.'
    console.error(error)
  } finally {
    loading.value = false
  }
}


/**
 * 설명 : String 타입 날짜 Date 타입으로 변화하는 메소드
 * @param {string} dateString - 문자열형식의 날짜 데이터
 * @return {Date} date - Date 타입의 날짜 데이터
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)

  const year = date.getFullYear()
  const month = date.getMonth() + 1   // 0부터 시작하므로 +1
  const day = date.getDate()

  return `${year}년 ${month}월 ${day}일`
}

/**
 * 설명 : 평가 템플릿 생성 페이지로 이동하는 메소드
 */
const createTemplate = () => {
    router.push('/evaluation/template/create')
}

/**
 * 설명 : 평가 템플릿 세부 페이지로 이동하는 메소드
 * @param {number} templateId - 평가 템플릿 pk 
 */
const goToDetail = (templateId: number) => {
  router.push(`/evaluation/template/${templateId}`);
};

/**
 * 설명 : 원하는 페이지 번호로 이동하는 메서드
 * @param {number} page - 페이지 번호 
 */
const goToPage = async (page: number) => {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  await selectEvaluationTemplateList()
}

/**
 * 설명 : 이전 페이지로 이동하는 메서드 
 */
const goPrev = async () => {
  if (currentPage.value > 0) {
    await goToPage(currentPage.value - 1)
  }
}

/**
 * 설명 : 다음 페이지로 이동하는 메서드
 */
const goNext = async () => {
  if (currentPage.value < totalPages.value - 1) {
    await goToPage(currentPage.value + 1)
  }
}

watch(currentPage, () => {
  selectEvaluationTemplateList();
});

/**
 * 설명 : 페이지 마운트 시, 전체 평가 템플릿의 데이터를 조회하기 위한 생명주기(onMounted) 훅
 */
onMounted(async () => {
  await selectEvaluationTemplateList()
})
</script>

<!--style-->
<style scoped>
/* 컨테이너 전체 */
.container {
  background: #f5f6fa;
  display: flex;
  flex-direction: column;
}

/* 내부 레이아웃 */
.inner-wrapper {
  padding: 24px;
  display: flex;
}

.content-box {
  background: white;
  border-radius: 14px;
  outline: 2px #E2E8F0 solid;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* 헤더 */
.header {
  padding: 20px;
}

.btn-new {
  padding: 8px 16px;
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  border: none;
  cursor: pointer;
}

.btn-new:hover {
  opacity: 0.9;
}

/* 테이블 */
.table-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.table-header {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr 1fr 1.5fr;
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  color: white;
  font-size: 14px;
  font-weight: bold;
  padding: 11px 16px;
}

.table-body .row {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr 1fr 1.5fr;
  padding: 16px;
  border-top: 1px solid #E2E8F0;
  cursor: pointer;
}

.table-body .row.alt {
  background: white;
}

.col {
  font-size: 14px;
  color: #0F172B;
}

.table-header .col {
  color: white;
}

.col.blue {
  color: #155DFC;
}

/* 페이징 */
.paging {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 16px;
  background: white;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
}

.page-btn {
  padding: 5px 12px;
  border-radius: 4px;
  border: 1px solid #CAD5E2;
  color: #62748E;
  font-size: 14px;
  cursor: pointer;
}

.page-btn.active {
  background: #155DFC;
  border: none;
  color: #fff;
}

.page-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-new.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
}
</style>