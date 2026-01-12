<template>
  <div class="plan-list-container">
    <div class="content-wrapper">
      <!-- 탭 메뉴 (main-card 밖으로 이동하여 배경색 노출) -->
      <div class="panel-header">
        <button
          @click="changeTab(false)"
          :class="['tab', 'tab-start', !filterIsFinished ? 'active' : '']"
        >
          진행중인 계획
        </button>
        <button
          @click="changeTab(true)"
          :class="['tab', 'tab-end', filterIsFinished ? 'active' : '']"
        >
          종료된 계획
        </button>
      </div>

      <div class="main-card">
        <div class="action-bar">
          <button class="register-btn" @click="goToCreate">
            + 새 계획 등록
          </button>
        </div>
        <!-- 컨텐츠 -->
        <div class="content">
          <table class="promotion-table">
            <thead>
              <tr>
                <th>No</th>
                <th>계획명</th>
                <th>추천 마감일</th>
                <th>임명일</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="no-data">로딩 중...</td>
              </tr>
              <tr v-else-if="!loading && plans.length === 0">
                <td colspan="6" class="no-data">표시할 데이터가 없습니다.</td>
              </tr>
              <tr v-for="plan in plans" :key="plan.promotionId" @click="goToDetail(plan.promotionId!)">
                <td>{{ plan.promotionId }}</td>
                <td>{{ plan.planName }}</td>
                <td>{{ formatDate(plan.nominationDeadlineAt) }}</td>
                <td>{{ formatDate(plan.appointmentAt) }}</td>
                <td>{{ formatDate(plan.createdAt) }}</td>
                <td>
                  <button class="btn-detail" @click.stop="goToDetail(plan.promotionId!)">
                    상세보기
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 페이지네이션 -->
        <div class="pagination">
          <button
            class="page-button"
            :disabled="currentPage === 1 || loading"
            @click="goToPage(currentPage - 1)"
          >
            이전
          </button>

          <button
            v-for="page in totalPages"
            :key="page"
            class="page-button"
            :class="{ 'page-active': page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>

          <button
            class="page-button"
            :disabled="currentPage >= totalPages || loading"
            @click="goToPage(currentPage + 1)"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { usePromotionStore } from '@/stores/personnel/promotion.store';

const router = useRouter();
const promotionStore = usePromotionStore();

const { plans, loading, filterIsFinished, currentPage, totalPages } = storeToRefs(promotionStore);

const changeTab = (isFinished: boolean) => {
  promotionStore.setFilter(isFinished);
};

const goToPage = (page: number) => {
  promotionStore.fetchPlans(page);
};

const goToCreate = () => {
  // 승진 계획은 전자결재를 통해 생성되므로 결재 양식함으로 이동합니다.
  router.push('/approval/create/promotionplan?templateId=2');
};

const goToDetail = (id: number) => {
  router.push(`/personnel/promotion/plan/${id}`);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  return dateString.split('T')[0];
};

onMounted(() => {
  // 페이지 진입 시, '진행중' 탭을 기본으로 설정하고 1페이지 데이터를 조회합니다.
  promotionStore.setFilter(false);
});
</script>

<style scoped>
/* 다른 페이지와의 일관성을 위해 기존 스타일들을 재사용합니다. */
.plan-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.register-btn {
  padding: 10px;
  display: flex;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  align-items: center;
  font-weight: 600;
}

.register-btn:hover {
  background: #162456;
}

.content-wrapper {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.panel-header {
  display: inline-flex;
  flex-direction: row;
  position: relative;
  z-index: 1;
}

.tab {
  padding: 10px 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.tab-start {
  border-top-left-radius: 14px;
}

.tab-end {
  border-top-right-radius: 14px;
  border-left: none;
}

.tab.active {
  color: #ffffff;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  border-color: #1c398e;
  border-bottom-color: transparent;
}

.main-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0 14px 14px 14px;
  display: flex;
  flex-direction: column;
  margin-top: -1px;
}

.action-bar {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.content {
  padding: 0;
  flex: 1;
  overflow: auto;
}

.promotion-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  table-layout: fixed;
}

.promotion-table th, .promotion-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.promotion-table th {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  font-weight: 700;
  position: sticky;
  top: 0;
  z-index: 1;
}

.promotion-table tbody tr {
  cursor: pointer;
  transition: background-color 0.2s;
}

.promotion-table tbody tr:hover {
  background-color: #f1f5f9;
}

.promotion-table tbody tr:last-child td {
  border-bottom: none;
}

.no-data {
  padding: 60px 0;
  color: #94a3b8;
  font-size: 16px;
  text-align: center;
}

.btn-detail {
  padding: 6px 12px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #475569;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-detail:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  gap: 10px;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
}

.page-button {
  padding: 5px 12px;
  border: 1px solid #cad5e2;
  background: white;
  border-radius: 4px;
  font-size: 14px;
  color: #62748e;
  cursor: pointer;
}

.page-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-button.page-active {
  background: #155dfc;
  border-color: #155dfc;
  color: white;
}
</style>