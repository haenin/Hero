<template>
  <div class="promotion-recommend-container">
    <!-- 헤더 영역 -->
    <div class="page-header">
      <div class="header-inner">
        <div class="back-label-wrap">
          <button v-if="step > 1" class="btn-back" @click="handleBack">
            <img class="icon-arrow" src="/images/arrow.svg" alt="뒤로가기" />
          </button>
          <div class="back-label">승진 추천</div>
        </div>
        
        <!-- 단계 표시 (Breadcrumbs) -->
        <div class="breadcrumbs">
          <span class="crumb" :class="{ active: step === 1 }" @click="step = 1">계획 선택</span>
          <span class="separator">›</span>
          <span class="crumb" :class="{ active: step === 2 }" @click="step > 2 ? step = 2 : null">대상 그룹</span>
          <span class="separator">›</span>
          <span class="crumb" :class="{ active: step === 3 }">후보자 추천</span>
        </div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>데이터를 불러오는 중입니다...</p>
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <div v-else class="content-area">
      
      <!-- STEP 1: 승진 계획 목록 -->
      <div v-if="step === 1" class="step-wrapper fade-in">
        <div class="section-header">
          <h2>진행 중인 승진 계획</h2>
          <p class="sub-desc">승진 추천을 진행할 계획을 선택해주세요.</p>
        </div>

        <div v-if="recommendPlans.length === 0" class="no-data">
          <p>현재 추천 가능한 승진 계획이 없습니다.</p>
        </div>

        <div class="card-grid">
          <div 
            v-for="plan in recommendPlans" 
            :key="plan.promotionId" 
            class="plan-card"
            @click="handleSelectPlan(plan)"
          >
            <div class="card-top">
              <span class="status-badge">진행중</span>
              <span class="date-label">{{ formatDate(plan.createdAt) }} 등록</span>
            </div>
            <h3 class="card-title">{{ plan.planName }}</h3>
            <div class="card-info">
              <div class="info-row">
                <span class="label">추천 마감</span>
                <span class="value">{{ formatDate(plan.nominationDeadlineAt) }}</span>
              </div>
              <div class="info-row">
                <span class="label">발령 예정</span>
                <span class="value">{{ formatDate(plan.appointmentAt) }}</span>
              </div>
            </div>
            <div class="card-action">
              <span>선택하기</span>
              <span class="arrow">→</span>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 2: 상세 계획 (대상 그룹) 선택 -->
      <div v-if="step === 2 && recommendPlanDetail" class="step-wrapper fade-in">
        <div class="section-header">
          <div>
            <h2>{{ recommendPlanDetail.planName }}</h2>
            <p class="sub-desc">추천을 진행할 대상 그룹(부서/직급)을 선택해주세요.</p>
          </div>
        </div>

        <!-- <div class="plan-content-box">
          {{ recommendPlanDetail.planContent || '상세 내용이 없습니다.' }}
        </div> -->

        <div class="card-grid detail-grid">
          <div 
            v-for="(detail, index) in recommendPlanDetail.detailPlan" 
            :key="index"
            class="detail-card"
            @click="handleSelectDetail(detail)"
          >
            <div class="detail-icon">
              <!-- 아이콘 대체 텍스트 -->
              <span>T/O</span>
            </div>
            <div class="detail-info">
              <h3 class="dept-name">{{ detail.department }}</h3>
              <p class="grade-target">{{ detail.grade }} 승진 대상</p>
              <div class="stats">
                <span class="stat-item">배정 T/O <strong>{{ detail.quotaCount }}명</strong></span>
                <span class="divider">|</span>
                <span class="stat-item">후보자 {{ detail.candidateList?.length || 0 }}명</span>
              </div>
            </div>
            <div class="hover-arrow">→</div>
          </div>
        </div>
      </div>

      <!-- STEP 3: 부서원(후보자) 추천 -->
      <div v-if="step === 3 && selectedDetail" class="step-wrapper fade-in">
        <div class="section-header">
          <div>
            <h2>{{ selectedDetail.department }} - {{ selectedDetail.grade }} 승진 후보자</h2>
            <p class="sub-desc">승진 적격자를 선택하여 추천해주세요.</p>
          </div>
        </div>

        <div v-if="!selectedDetail.candidateList?.length" class="no-data">
          <p>해당 그룹에 추천 가능한 후보자가 없습니다.</p>
        </div>

        <div class="member-list-grid">
          <div 
            v-for="candidate in selectedDetail.candidateList" 
            :key="candidate.candidateId"
            class="member-card"
            :class="{ 'nominated': candidate.isNominated }"
          >
            <div class="member-header">
              <div class="member-id">
                <span class="name">{{ candidate.employeeName || '이름 없음' }}</span>
                <span class="pos">{{ candidate.grade }}</span>
              </div>
            </div>
            
            <div class="member-stats">
              <div class="stat-row">
                <span class="label">부서</span>
                <span class="val">{{ candidate.department }}</span>
              </div>
              <div class="stat-row">
                <span class="label">직급</span>
                <span class="val">{{ candidate.grade }}</span>
              </div>
              <div class="stat-row">
                <span class="label">사번</span>
                <span class="val">{{ candidate.employeeNumber }}</span>
              </div>
              <div class="stat-row" v-if="candidate.evaluationPoint !== undefined">
                <span class="label">평가점수</span>
                <span class="val">{{ candidate.evaluationPoint }}점</span>
              </div>
              <div class="stat-row" v-if="candidate.nominatorName">
                <span class="label">추천자</span>
                <span class="val">{{ candidate.nominatorName }}</span>
              </div>
              <div class="stat-row" v-if="candidate.nominationReason">
                <span class="label">추천사유</span>
                <span class="val">{{ candidate.nominationReason }}</span>
              </div>
              <div class="stat-row" v-if="candidate.rejectionReason">
                <span class="label">반려사유</span>
                <span class="val">{{ candidate.rejectionReason }}</span>
              </div>
            </div>

            <div class="member-action">
              <button 
                v-if="!candidate.nominatorName && !candidate.nominationReason"
                class="btn-recommend"
                @click.stop="startNomination(candidate)"
              >
                추천하기
              </button>
              <button 
                v-else
                class="btn-cancel"
                @click.stop="cancelCandidateNomination(candidate)"
              >
                추천 취소
              </button>
            </div>

            <!-- 추천 사유 입력 폼 (인라인) -->
            <div v-if="activeNominationCandidateId === candidate.candidateId" class="nomination-form fade-in">
              <textarea
                v-model="nominationReasonInput"
                class="reason-textarea"
                placeholder="추천 사유를 작성해주세요."
                @click.stop
              ></textarea>
              <div class="form-actions">
                <button class="btn-form-cancel" @click.stop="cancelActiveNomination">취소</button>
                <button class="btn-form-confirm" @click.stop="confirmNomination(candidate)">추천 완료</button>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { usePromotionRecommendStore } from '@/stores/personnel/promotionRecommend.store';
import type { PromotionPlanResponseDTO } from '@/types/personnel/promotion.types';

const store = usePromotionRecommendStore();
const { recommendPlans, recommendPlanDetail, loading } = storeToRefs(store);

const router = useRouter();
// --- State ---
const step = ref(1);
const selectedPlan = ref<PromotionPlanResponseDTO | null>(null);
const selectedDetail = ref<any | null>(null); // 상세 그룹 정보

// --- Inline Form State ---
const activeNominationCandidateId = ref<number | null>(null);
const nominationReasonInput = ref('');

// --- Methods ---

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  return dateStr.split('T')[0];
};

const handleBack = () => {
  if (step.value > 1) {
    step.value--;
  } else {
    router.back();
  }
};

// Step 1 -> Step 2
const handleSelectPlan = async (plan: PromotionPlanResponseDTO) => {
  selectedPlan.value = plan;
  if (plan.promotionId) {
    await store.getRecommendDetail(plan.promotionId);
    step.value = 2;
  }
};

// Step 2 -> Step 3
const handleSelectDetail = (detail: any) => {
  console.group('상세 그룹 및 후보자 데이터 확인');
  console.log('선택된 상세 그룹:', detail);
  if (detail.candidateList && detail.candidateList.length > 0) {
    console.log('첫 번째 후보자 데이터:', detail.candidateList[0]);
    console.log('첫 번째 후보자의 추천 사유(nominationReason):', detail.candidateList[0].nominationReason);
  }
  console.groupEnd();
  selectedDetail.value = detail;
  step.value = 3;
};

// 추천 사유 입력 폼 열기
const startNomination = (candidate: any) => {
  activeNominationCandidateId.value = candidate.candidateId;
  nominationReasonInput.value = '';
};

// 추천 사유 입력 폼 닫기
const cancelActiveNomination = () => {
  activeNominationCandidateId.value = null;
  nominationReasonInput.value = '';
};

// 추천 확정 (인라인 폼에서 확인 버튼 클릭 시)
const confirmNomination = async (candidate: any) => {
  if (!selectedPlan.value || !selectedPlan.value.promotionId) return;

  if (!nominationReasonInput.value.trim()) {
    alert('추천 사유를 입력해주세요.');
    return;
  }

  const success = await store.requestNomination({
    promotionId: selectedPlan.value.promotionId,
    candidateId: candidate.candidateId,
    nominationReason: nominationReasonInput.value
  });
  
  if (success) {
    // API가 추천자 이름과 사유를 바로 반환하지 않는 경우를 대비하여 프론트에서 채워줌
    candidate.nominationReason = nominationReasonInput.value;
    // 추천자 이름은 현재 로그인한 사용자 정보로 채워야 하지만, 해당 정보가 없으므로 임시 처리
    candidate.nominatorName = '나(임시)'; 
    alert(`${candidate.employeeName || '후보자'} 님을 추천하였습니다.`);
    cancelActiveNomination(); // 입력 폼 닫기
  } else {
    alert('추천 처리에 실패했습니다.');
  }
};

// 추천 취소
const cancelCandidateNomination = async (candidate: any) => {
  if (!selectedPlan.value || !selectedPlan.value.promotionId) return;

  if (!confirm(`${candidate.employeeName || '후보자'} 님의 추천을 취소하시겠습니까?`)) return;
  
  const success = await store.requestCancelNomination(candidate.candidateId);
  if (success) {
    // 추천 취소 시 관련 정보 초기화
    candidate.nominationReason = null;
    candidate.nominatorName = null;
  } else {
    alert('추천 취소에 실패했습니다.');
  }
};

onMounted(() => {
  store.getRecommendPlans();
});
</script>

<style scoped>
@import "@/assets/styles/approval/approval-detail.css";

.header-inner {
  padding: 0 5px;
}

.back-label-wrap {
  min-height: 40px; /* 뒤로가기 버튼이 없을 때도 높이 유지 */
}

/* Inline Nomination Form Styles */
.nomination-form {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.reason-textarea {
  width: 100%;
  height: 80px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  resize: none;
  font-size: 14px;
  margin-bottom: 12px;
}

.reason-textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-form-cancel, .btn-form-confirm {
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-form-cancel {
  background: #f1f5f9;
  color: #475569;
  border-color: #e2e8f0;
}

.btn-form-confirm {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
}

.promotion-recommend-container {
  width: 100%;
  min-height: 100vh;
  /* background-color: #f8fafc; */
}

.content-area {
  margin: 20px;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #94a3b8;
}

.crumb {
  cursor: pointer;
}

.crumb.active {
  color: #3b82f6;
  font-weight: 600;
}

.separator {
  color: #cbd5e1;
  font-size: 12px;
}

/* Section Header */
.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 4px;
}

.sub-desc {
  color: #64748b;
  font-size: 14px;
}

/* Card Grid System */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* Plan Card (Step 1) */
.plan-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.plan-card:hover {
  /* transform: translateY(-4px); */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-badge {
  background: #dbeafe;
  color: #2563eb;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.date-label {
  font-size: 12px;
  color: #94a3b8;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
  line-height: 1.4;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.info-row .label {
  color: #64748b;
}

.info-row .value {
  color: #334155;
  font-weight: 500;
}

.card-action {
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #3b82f6;
  font-weight: 600;
  font-size: 14px;
}

/* Detail Card (Step 2) */
.plan-content-box {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 30px;
  border: 1px solid #e2e8f0;
}

.detail-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.detail-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.detail-icon {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-weight: 700;
  font-size: 14px;
}

.detail-info {
  flex: 1;
}

.dept-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.grade-target {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.stats {
  font-size: 13px;
  color: #475569;
}

.stats strong {
  color: #1C398E;
}

.divider {
  margin: 0 8px;
  color: #cbd5e1;
}

.hover-arrow {
  color: #cbd5e1;
  font-weight: bold;
  transition: transform 0.2s;
}

.detail-card:hover .hover-arrow {
  color: #1C398E;
  transform: translateX(4px);
}

/* Member Card (Step 3) */
.member-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.member-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.2s;
}

.member-card.nominated {
  border-color: #1c398e;
  background: #eff6ff;
}

.member-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #64748b;
}

.member-card.nominated .avatar {
  background: #1c398e;
  color: white;
}

.member-id {
  display: flex;
  flex-direction: column;
}

.member-id .name {
  font-weight: 600;
  color: #1e293b;
}

.member-id .pos {
  font-size: 12px;
  color: #64748b;
}

.member-stats {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member-card.nominated .member-stats {
  background: white;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 14px;
  gap: 8px;
}

.stat-row .label {
  color: #94a3b8;
  flex-shrink: 0;
  white-space: nowrap;
}

.stat-row .val {
  color: #475569;
  font-weight: 500;
  text-align: right;
  word-break: break-word;
  white-space: pre-wrap;
}

.member-action button {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-recommend {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
}

.btn-cancel {
  background: white;
  border: 1px solid #ef4444 !important;
  color: #ef4444;
}

.btn-cancel:hover {
  background: #fef2f2;
}

/* Extra Actions */
.extra-actions {
  display: flex;
  gap: 8px;
}

.btn-extra {
  flex: 1;
  padding: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-extra:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* Common */
.no-data {
  text-align: center;
  padding: 60px;
  color: #94a3b8;
  background: #f8fafc;
  border-radius: 12px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #64748b;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* .fade-in {
  animation: fadeIn 0.3s ease-in-out;
} */

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
