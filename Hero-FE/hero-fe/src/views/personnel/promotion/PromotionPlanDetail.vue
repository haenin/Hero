<!-- 
  File Name   : PromotionPlanDetail.vue
  Description : 승진 계획 상세 조회 페이지
  
  History
  2025/12/19 - [User] 최초 작성
-->
<template>
  <div class="detail-container">
    <!-- 헤더 -->
    <div class="page-header">
      <div class="header-inner">
        <div class="back-label-wrap">
          <button class="btn-back" @click="goBack">
            <img class="icon-arrow" src="/images/arrow.svg" alt="뒤로가기" />
          </button>
          <div class="back-label">승진 계획 상세</div>
        </div>
        <div class="action-group">
          <!-- <button class="btn-cancel" @click="goToEdit">수정</button> -->
          <!-- <button class="btn-delete" @click="deletePlan">삭제</button> -->
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <div class="main-card" v-if="planDetail">
        <!-- 1. 기본 정보 섹션 -->
        <div class="section">
          <h3 class="section-title">기본 정보</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">계획명</span>
              <span class="value">{{ planDetail.planName }}</span>
            </div>
            <div class="info-item">
              <span class="label">등록일</span>
              <span class="value">{{ formatDate(planDetail.createdAt) }}</span>
            </div>
            <div class="info-item">
              <span class="label">추천 마감일</span>
              <span class="value">{{ formatDate(planDetail.nominationDeadlineAt) }}</span>
            </div>
            <div class="info-item">
              <span class="label">발령일</span>
              <span class="value">{{ formatDate(planDetail.appointmentAt) }}</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- 2. 계획 내용 섹션 -->
        <div class="section">
          <h3 class="section-title">계획 내용</h3>
          <div class="content-box">
            {{ planDetail.planContent || '내용이 없습니다.' }}
          </div>
        </div>

        <div class="divider"></div>

        <!-- 3. 세부 계획(T/O) 섹션 -->
        <div class="section">
          <h3 class="section-title">승진 대상 및 T/O</h3>
          <div class="table-wrapper">
            <table class="detail-table">
              <thead>
                <tr>
                  <th>대상 부서</th>
                  <th>대상 직급</th>
                  <th>승진 T/O</th>
                  <th class="clickable-header" title="클릭하여 후보자 목록 보기">
                    후보자 수
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(detail, index) in planDetail.detailPlan" :key="index" class="clickable-row" @click="openCandidateModal(detail.candidateList)">
                  <td>{{ detail.department }}</td>
                  <td>{{ detail.grade }}</td>
                  <td>{{ detail.quotaCount }}명</td>
                  <td>
                    <span class="candidate-badge">{{ detail.candidateList?.length || 0 }}명</span>
                  </td>
                </tr>
                <tr v-if="!planDetail.detailPlan || planDetail.detailPlan.length === 0">
                  <td colspan="4" class="no-data">등록된 세부 계획이 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else-if="loading" class="loading-state">
        데이터를 불러오는 중입니다...
      </div>
      
      <div v-else class="error-state">
        정보를 찾을 수 없습니다.
      </div>
    </div>

    <CandidateListModal v-model:open="isModalOpen" :candidates="selectedCandidates" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { usePromotionStore } from '@/stores/personnel/promotion.store';
import CandidateListModal from './CandidateListModal.vue';
import type { PromotionCandidateDTO } from '@/types/personnel/promotion.types';

const route = useRoute();
const router = useRouter();
const promotionStore = usePromotionStore();
const { planDetail, loading } = storeToRefs(promotionStore);

const isModalOpen = ref(false);
const selectedCandidates = ref<PromotionCandidateDTO[] | undefined>([]);

const goBack = () => {
  router.back();
};

const openCandidateModal = (candidates: PromotionCandidateDTO[] | undefined) => {
  selectedCandidates.value = candidates;
  isModalOpen.value = true;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  return dateString.split('T')[0];
};

// const goToEdit = () => {
//   // TODO: 수정 페이지 구현 시 연결
// };

// const deletePlan = () => {
//   // TODO: 삭제 API 연결
// };

onMounted(() => {
  const id = Number(route.params.id);
  if (id) {
    promotionStore.getPlanDetail(id);
  }
});
</script>

<style scoped>
@import "@/assets/styles/approval/approval-detail.css";

.detail-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.btn-cancel {
  background-color: white;
  color: #62748e;
  padding: 6px 11px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
}

.content-wrapper {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.main-card {
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1c398e;
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 13px;
  color: #64748b;
}

.value {
  font-size: 15px;
  color: #0f172b;
  font-weight: 500;
}

.content-box {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  min-height: 100px;
  white-space: pre-wrap;
  line-height: 1.6;
  color: #334155;
  font-size: 14px;
}

.divider {
  height: 1px;
  background: #e2e8f0;
  margin: 10px 0;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.detail-table th {
  background: #f1f5f9;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.detail-table td {
  padding: 12px;
  font-size: 14px;
  color: #334155;
  border-bottom: 1px solid #e2e8f0;
}

.clickable-header {
  cursor: help;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f1f5f9;
}

.candidate-badge {
  display: inline-block;
  padding: 4px 12px;
  background-color: #e0e7ff;
  color: #1c398e;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
}

.no-data {
  padding: 20px;
  color: #94a3b8;
}

.loading-state, .error-state {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

/* 색상 유틸리티 클래스 */
.t-blue { color: #1C398E !important; }
.t-green { color: #0D542B !important; }
.t-red { color: #82181A !important; }
.t-orange { color: #7E2A0C !important; }
.t-brown { color: #733E0A !important; }
.t-dark { color: #0F172B !important; }
</style>
