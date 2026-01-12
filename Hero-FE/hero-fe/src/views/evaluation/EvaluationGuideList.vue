<!-- 
  File Name   : EvaluationGuideList.vue
  Description : 평가 가이드 목록 페이지
 
  History
  2025/12/10 - 승민 최초 작성
 
  @author 승민
  @version 1.0
-->
<!--template-->
<template>
  <div class="container">
    <div class="inner-wrapper">
      <div class="content-box">
        <!-- 헤더 -->
        <div class="header">
          <button
            v-if="authStore.hasAnyRole(['ROLE_SYSTEM_ADMIN','ROLE_HR_MANAGER','ROLE_HR_EVALUATION'])"
            class="btn-new"
            @click="createGuide"
          >
            + 새 평가 가이드 작성
          </button>
        </div>

        <!-- 테이블 -->
        <div class="table-wrapper">
          <!-- 테이블 헤더 -->
          <div class="table-header">
            <div class="col">문서번호</div>
            <div class="col">제목</div>
            <div class="col">적용부서</div>
            <div class="col">작성자</div>
            <div class="col">작성일시</div>
          </div>

          <!-- 테이블 바디 -->
          <div class="table-body">
            <div
              class="row"
              v-for="(item, index) in evaluationGuides"
              :key="item.evaluationGuideEvaluationGuideId"
              :class="{ alt: index % 2 !== 0 }"
              @click="goToDetail(item.evaluationGuideEvaluationGuideId)"
            >
              <div class="col blue">
                {{ item.evaluationGuideEvaluationGuideId }}
              </div>
              <div class="col">{{ item.evaluationGuideName }}</div>
              <div class="col">{{ item.evaluationGuideDepartmentName }}</div>
              <div class="col">{{ item.evaluationGuideEmployeeName }}</div>
              <div class="col">
                {{ formatDate(item.evaluationGuideCreatedAt) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 페이징 (UI용) -->
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
//Import 구문
import apiClient from "@/api/apiClient"
import { ref, onMounted, computed, watch } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from '@/stores/auth';
import SlidingPagination from '@/components/common/SlidingPagination.vue';

//외부 로직
const router = useRouter();
const authStore = useAuthStore();

//페이지네이션 타입
interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// 평가 가이드 객체 
interface EvaluationGuideResponseDTO {
  evaluationGuideEvaluationGuideId: number
  evaluationGuideName: string
  evaluationGuideContent: string
  evaluationGuideCreatedAt: string
  evaluationGuideEmployeeId: number
  evaluationGuideEmployeeName: string
  evaluationGuideDepartmentId: number
  evaluationGuideDepartmentName: string
  evaluationGuideGradeId: number
  evaluationGuideGrade: string
}

// Reactive 데이터
const evaluationGuides = ref<EvaluationGuideResponseDTO[]>([])
const loading = ref<boolean>(false)
const errorMessage = ref<string>("")

const currentPage = ref(0) 
const pageSize = ref(10)
const totalPages = ref(0)

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
 * 설명: 전체 평가 가이드 조회
 */
const selectEvaluationGuideList = async () => {
  try {
    loading.value = true

    const res = await apiClient.get<PageResponse<EvaluationGuideResponseDTO>>(
      "/evaluation/evaluation-guide/all",
      {
        params: {
          page: currentPage.value,
          size: pageSize.value,
        },
      }
    )

    evaluationGuides.value = res.data.content
    totalPages.value = res.data.totalPages
  } catch (e) {
    errorMessage.value = "평가 가이드 조회에 실패했습니다."
    console.error(e)
  } finally {
    loading.value = false
  }
}

/**
 * 설명: 페이지 번호로 이동하는 메소드
 * @param {number} page - 페이지 번호
 */
const goPage = (page: number) => {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  selectEvaluationGuideList()
}

/**
 * 페이지 계산 메소드
 */
const pageNumbers = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i)
})

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
 * 설명: 평가 가이드 작성 페이지 이동하는 메소드
 */
const createGuide = () => {
  router.push("/evaluation/guide/create")
}

/**
 * 설명: 평가 가이드 상세 페이지 이동하는 메소드
 */
const goToDetail = (guideId: number) => {
  router.push(`/evaluation/guide/${guideId}`)
}

watch(currentPage, () => {
  selectEvaluationGuideList();
});

/**
 * 설명: 마운트 시 전체 평가 가이드 데이터 조회하는 생명주기 훅
 */
onMounted(async () => {
  await selectEvaluationGuideList()
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

  align-items: center;
}

.table-body .row.alt {
  background: #F8FAFC;
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

.btn-new.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
}
</style>