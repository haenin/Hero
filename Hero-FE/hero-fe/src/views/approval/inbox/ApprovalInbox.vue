<!--
  * <pre>
  * Vue Name        : ApprovalInbox.vue
  * Description     : 결재문서함
  *
  * 컴포넌트 연계
  * - 문서 상세 조회
  * - ApprovalTemplates.vue: 새 결재 작성 버튼 클릭 시 결재문서서식페이지로 라우팅
  *
  * History
  *   2025/12/17 (민철) 최초 작성
  *   2025/12/23 (민철) 파일명 변경
  *   2025/12/26 (민철) 탭별 문서 조회 기능 구현
  *   2025/12/26 (민철) 문서 클릭 시 상세 화면 이동 기능 추가
  *   2025/12/29 (민철) 결재 상태별 뱃지 색상 구분 및 고정 크기 적용
  *   2025/12/29 (민철) 테이블 열 너비 조정 및 좌우 균형 배치
  *   2025/12/29 (민철) 전체 검색 기능 개선 (모든 필드에서 검색)
  *   2026/01/01 (민철) 페이징 버튼 3개씩 표시하도록 개선
  * </pre>
  *
  * @module approval
  * @author 민철
  * @version 3.5
-->
<template>
  <div class="inbox-container">
    <div class="inbox-wrapper">
      <div class="inbox-header">
        <div class="inbox-tabs">
          <button class="tab tab-start" :class="{ active: activeTab === 'all' }"
            @click="handleTabClick('all')">전체</button>
          <button class="tab" :class="{ active: activeTab === 'que' }" @click="handleTabClick('que')">대기</button>
          <button class="tab" :class="{ active: activeTab === 'request' }"
            @click="handleTabClick('request')">요청</button>
          <button class="tab" :class="{ active: activeTab === 'reject' }" @click="handleTabClick('reject')">반려</button>
          <button class="tab" :class="{ active: activeTab === 'ref' }" @click="handleTabClick('ref')">참조</button>
          <button class="tab" :class="{ active: activeTab === 'end' }" @click="handleTabClick('end')">승인</button>
          <button class="tab tab-end" :class="{ active: activeTab === 'draft' }"
            @click="handleTabClick('draft')">임시저장</button>
        </div>
      </div>
      <div class="inbox-body">
        <div class="inbox-body-header">
          <div class="top-left">
            <button class="top-first-button" @click="toTemplateList()">
              <img src="/images/plus.svg" alt="plus" />
              <span class="newdoc-button">새 결재 작성</span>
            </button>
          </div>
          <div class="top-right">
            <div class="top-second">
              <div class="from-cal">조회기간</div>
              <input class="input-box calendar" type="date" v-model="fromDate" @change="onSearchChange">
              <div class="stream-icon">~</div>
              <input class="input-box calendar" type="date" v-model="toDate" @change="onSearchChange">
            </div>
            <div class="top-third">
              <select class="input-box filter" v-model="sortBy" @change="onSearchChange">
                <option value="all">전체</option>
                <option value="docNo">문서번호</option>
                <option value="docType">문서분류</option>
                <option value="name">문서서식</option>
                <option value="title">제목</option>
                <option value="dept">부서</option>
                <option value="drafter">작성자</option>
              </select>
              <input type="text" placeholder="검색어를 입력하세요" class="input-box" v-model="searchKeyword"
                @keyup.enter="onSearchChange">
              <button class="search-button" @click="onSearchChange">검색</button>
            </div>
          </div>
        </div>
        <div class="inbox-body-table">
          <table>
            <thead>
              <tr>
                <th class="cell docNo">문서번호</th>
                <th class="cell docStatus">결재상태</th>
                <th class="cell docCategory">문서분류</th>
                <th class="cell docName">문서서식</th>
                <th class="cell docTitle">문서제목</th>
                <th class="cell drafterDept">부서</th>
                <th class="cell drafter">작성자</th>
                <th class="cell drafterDate">작성일시</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="!loading && documents.length > 0">
                <tr v-for="doc in documents" :key="doc.docId" class="clickable-row"
                  @click="toDocumentDetail(doc.docId)">
                  <td v-if="['임시저장', '진행중'].includes(doc.docStatus)" class="cell docNo doc-rejected">생성중</td>
                  <td v-else-if="doc.docNo === null" class="cell docNo doc-rejected">-</td>
                  <td v-else class="cell docNo">{{ doc.docNo }}</td>
                  <td class="cell docStatus">
                    <div class="status-badge" :class="getStatusClass(doc.docStatus)">
                      {{ getStatusText(doc.docStatus) }}
                    </div>
                  </td>
                  <td class="cell docCategory">{{ doc.category }}</td>
                  <td class="cell docName">{{ doc.name }}</td>
                  <td class="cell docTitle">{{ doc.title }}</td>
                  <td class="cell drafterDept">{{ doc.drafterDept }}</td>
                  <td class="cell drafter">{{ doc.drafter }}</td>
                  <td class="cell drafterDate">{{ doc.drafterAt }}</td>
                </tr>
              </template>

              <tr v-else-if="!loading && documents.length === 0">
                <td colspan="8" style="text-align: center; padding: 20px;">
                  조회된 문서가 없습니다.
                </td>
              </tr>

              <tr v-if="loading">
                <td colspan="8" style="text-align: center; padding: 20px;">
                  로딩 중...
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="inbox-body-bottom">
          <div class="inbox-body-buttons">
            <button class="inbox-button" @click="handlePageChange(page - 1)" :disabled="page === 0">이전</button>

            <button v-for="pageNum in visiblePages" :key="pageNum" class="inbox-button button-page"
              :class="{ active: page === pageNum }" @click="handlePageChange(pageNum)">
              {{ pageNum + 1 }}
            </button>

            <button class="inbox-button" @click="handlePageChange(page + 1)"
              :disabled="page >= totalPages - 1">다음</button>
          </div>
        </div>
      </div>
    </div>

  </div>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useInbox } from '@/composables/approval/useInbox';

const router = useRouter();

const {
  documents,
  page,
  totalPages,
  activeTab,
  loading,
  handleTabClick,
  handlePageChange,
  handleSearch,
} = useInbox();

const fromDate = ref('');
const toDate = ref('');
const sortBy = ref('all');
const searchKeyword = ref('');

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = page.value;
  const pages: number[] = [];

  if (total === 0) return pages;

  if (total <= 3) {
    for (let i = 0; i < total; i++) {
      pages.push(i);
    }
    return pages;
  }

  let start = Math.max(0, current - 1);
  let end = Math.min(total - 1, current + 1);

  if (start === 0) {
    end = Math.min(total - 1, 2);
  }
  else if (end === total - 1) {
    start = Math.max(0, total - 3);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const onSearchChange = () => {
  handleSearch({
    fromDate: fromDate.value,
    toDate: toDate.value,
    sortBy: sortBy.value,
    condition: searchKeyword.value,
  });
};

const toTemplateList = () => {
  router.push('/approval/document-templates');
};

const toDocumentDetail = (docId: number) => {
  router.push({
    name: 'ApprovalDetail',
    params: { docId: docId.toString() }
  });
};

const getStatusClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    '진행중': 'status-inprogress',
    '승인완료': 'status-approved',
    '반려': 'status-rejected'
  };
  return statusMap[status] || 'status-inprogress';
};

const getStatusText = (status: string): string => {
  return status;
};

</script>

<style scoped>
@import '@/assets/styles/approval/approval-inbox.css';
</style>