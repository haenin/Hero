
<!-- 
  File Name   : EvaluationList.vue
  Description : 평가 템플릿 목록 조회 페이지
 
  History
  2025/12/14 - 승민 최초 작성
 
  @author 승민
  @version 1.0
-->

<!--template-->
<template>
  <div class="page">
    <div class="content-wrapper">

      <!-- 상단 탭 -->
      <div class="tabs">
        <div class="inbox-tabs">
          <button
            class="tab tab-start active"
            @click="goTemplateList"
          >
            평가 템플릿 목록
          </button>

          <button
            class="tab tab-end"
            @click="goEvaluationList"
          >
            생성된 평가
          </button>
        </div>
      </div>

      <!-- 리스트 박스 -->
      <div class="list-box">
        <div class="table-wrapper">

          <!-- 테이블 헤더 -->
          <div class="table-header">
            <div class="col header-col">문서번호</div>
            <div class="col header-col">템플릿명</div>
            <div class="col header-col">기안부서</div>
            <div class="col header-col">기안자</div>
            <div class="col header-col">기안일시</div>
            <div
              v-if="authStore.hasAnyRole(['ROLE_SYSTEM_ADMIN','ROLE_HR_MANAGER','ROLE_DEPT_MANAGER'])"
              class="col header-col"
            >
              작업
            </div>
          </div>

          <!-- 테이블 바디 -->
          <div class="table-body">
            <div
              class="row"
              v-for="(item, index) in evaluationTemplates"
              :key="item.evaluationTemplateTemplateId"
              :class="{ alt: index % 2 !== 0 }"
            >
              <div class="col blue">{{ item.evaluationTemplateTemplateId }}</div>
              <div class="col">{{ item.evaluationTemplateName }}</div>
              <div class="col">{{ item.evaluationTemplateDepartmentName }}</div>
              <div class="col">{{ item.evaluationTemplateEmployeeName }}</div>
              <div class="col">{{ formatDate(item.evaluationTemplateCreatedAt) }}</div>

              <!-- 평가 생성 -->
              <div
                v-if="authStore.hasAnyRole(['ROLE_SYSTEM_ADMIN','ROLE_HR_MANAGER','ROLE_DEPT_MANAGER'])"
                class="col action"
              >
                <button
                  class="btn-create"
                  @click="goToCreate(item.evaluationTemplateTemplateId)"
                >
                  <img class="document-icon" src="/images/document.svg" />
                  평가 생성
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 페이지네이션 -->
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
import apiClient from '@/api/apiClient';
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import SlidingPagination from '@/components/common/SlidingPagination.vue';

//외부 로직
const router = useRouter();
const authStore = useAuthStore();

// 페이지네이션 타입
interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// 평가 기준 타입
interface CriteriaResponseDTO {
  criteriaCriteriaId: number;
  criteriaItemId: number | null;
  criteriaRank: string;
  criteriaDescription: string;
  criteriaMinScore: number;
  criteriaMaxScore: number;
}

// 평가 항목 타입
interface TemplateItemResponseDTO {
  templateItemItemId: number;
  templateItemTemplateId: number | null;
  templateItemItem: string;
  templateItemDescription: string;
  criterias: CriteriaResponseDTO[];
}

// 평가 템플릿 타입
interface EvaluationTemplateResponseDTO {
  evaluationTemplateTemplateId: number;
  evaluationTemplateName: string;
  evaluationTemplateCreatedAt: string;
  evaluationTemplateEmployeeId: number;
  evaluationTemplateEmployeeName: string;
  evaluationTemplateDepartmentId: number;
  evaluationTemplateDepartmentName: string;
  evaluationTemplateGradeId: number;
  evaluationTemplateGrade: string;
  evaluationTemplateType: number;
  evaluationPeriodEvaluationPeriodId: number;
  evaluationPeriodName: string;
  evaluationPeriodStart: string;
  evaluationPeriodEnd: string;
  templateItems: TemplateItemResponseDTO[];
}

// Reactive 데이터
const evaluationTemplates = ref<EvaluationTemplateResponseDTO[]>([]);
const loading = ref(false);
const errorMessage = ref("");

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
 * 설명: 평가 템플릿 목록 조회 메소드
 */
const selectEvaluationTemplateList = async () => {
  try {
    loading.value = true

    const res = await apiClient.get<PageResponse<EvaluationTemplateResponseDTO>>(
      "/evaluation/evaluation-template/all",
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
    errorMessage.value = "평가 템플릿 조회 실패"
    console.error(error)
  } finally {
    loading.value = false
  }
}

/**
 * 설명: 페이지번호로 이동하는 메소드
 * @param {number} page - 페이지 번호 
 */
const goPage = (page: number) => {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  selectEvaluationTemplateList()
}

/**
 * 설명: 페이지 번호 수를 계산하는 메소드 
 */
const pageNumbers = computed(() =>
  Array.from({ length: totalPages.value }, (_, i) => i)
)

/**
 * 설명: 날짜 타입 변환 메소드
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)

  const year = date.getFullYear()
  const month = date.getMonth() + 1   
  const day = date.getDate()

  return `${year}년 ${month}월 ${day}일`
}

/**
 * 설명: 평가 템플릿 목록으로 이동하는 메소드
 */
const goTemplateList = () => {
  router.push("/evaluation/list");
};

/**
 * 설명: 생성된 평가 목록으로 이동하는 메소드
 */
const goEvaluationList = () => {
  router.push("/evaluation/list2");
};

/**
 * 설명: 평가 생성 페이지로 이동하는 메소드
 * @param {number} templateId - 평가 템플릿 번호 
 */
const goToCreate = (templateId: number) => {
  router.push(`/evaluation/create/${templateId}`);
};

watch(currentPage, () => {
  selectEvaluationTemplateList();
});

/**
 * 설명: 마운트 시, 평가 템플릿 목록 조회하는 메소드
 */
onMounted(async () => {
  await selectEvaluationTemplateList();
});
</script>

<!--style-->
<style scoped>
.page {
  width: 100%;
  height: 100%;
  background: #f5f6fa;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  padding: 24px;
}

/* ========== Tabs ========== */
.tabs {
  display: flex;
}

.inbox-tabs {
  display: inline-flex;
  flex-direction: row;
}

/* 탭 공통 */
.tab {
  padding: 10px 18px;
  display: flex;
  align-items: center;
  justify-content: center;

  border-top: 1px solid #e2e8f0;
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;

  background-color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  white-space: nowrap;
}

/* 활성 탭 */
.tab.active {
  color: #ffffff;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

/* 탭 라운드 */
.tab-start {
  border-top-left-radius: 14px;
}

.tab-end {
  border-top-right-radius: 14px;
}

/* ========== List Box (표 전체) ========== */
.list-box {
  background: white;
  border: 2px solid #e2e8f0;
  border-top: none;
  border-radius: 0 14px 14px 14px;
  margin-top: 0;
  padding-bottom: 20px;
}

.table-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* ========== 테이블 헤더 ========== */
.table-header {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 1.2fr 1fr;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  padding: 11px 16px;
  font-size: 14px;
  font-weight: 700;
}

/* ========== 테이블 바디 ========== */
.table-body .row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 1.2fr 1fr;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
}

.table-body .row.alt {
  background: white;
}

.col {
  font-size: 14px;
  color: #000000;
}

.header-col {
  color: #ffffff;
}

.col.blue {
  color: #155dfc;
}

/* 버튼 포함하는 cell */
.action {
  display: flex;
  align-items: center;
}

/* 평가 생성 버튼 */
.btn-create {
  height: 20px;                 /* ✅ 정확한 버튼 높이 */
  padding: 0 8px;               /* ✅ 좌우만 유지, 상하는 제거 */

  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  border-radius: 6px;           /* 20px에 어울리게 살짝 축소 */
  color: white;

  font-size: 12px;
  line-height: 20px;            /* ✅ 텍스트 세로 중앙 */
  
  border: none;
  cursor: pointer;

  display: inline-flex;         /* ✅ 버튼 높이 안정 */
  align-items: center;
  gap: 4px;
}

.btn-create:hover {
  opacity: 0.9;
}

/* 아이콘 */
.document-icon {
  width: 14px;
  height: 14px;
}

/* ========== 페이지 네이션 (완전 동일하게 적용) ========== */
.paging {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 16px;
  background: white;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  border-top: 1px solid #e2e8f0;
}

.page-btn {
  padding: 5px 12px;
  border-radius: 4px;
  border: 1px solid #cad5e2;
  color: #62748e;
  font-size: 14px;
  cursor: pointer;
  background: white;
}

.page-btn.active {
  background: #155dfc;
  border: none;
  color: #fff;
}

.btn-create:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>