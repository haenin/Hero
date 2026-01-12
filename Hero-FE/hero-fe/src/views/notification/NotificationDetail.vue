<!-- 
  Vue Name: NotificationDetail
  Description: 알림 상세 페이지 - 이메일함 스타일의 간단한 알림 뷰어
  
  History
  2024/12/15 (혜원) 최초 작성
  2025/01/04 (혜원) 이메일함 스타일로 간소화
  
  Author: 혜원
  Version: 2.0
-->

<template>
  <div class="notification-detail-page">
    <!-- 헤더영역 -->
    <div class="header">
      <div class="header-content">
        <!-- 뒤로가기 버튼 -->
        <button class="back-button" @click="goBack">
          <img src="/images/arrow.svg" alt="뒤로가기 아이콘" />
          <span>알림 목록</span>
        </button>

        <!-- 액션 버튼들 -->
        <div class="header-actions">
          <button class="icon-button" @click="toggleReadStatus" :title="notification?.isRead ? '읽지 않음으로 표시' : '읽음으로 표시'">
            <svg v-if="notification?.isRead" viewBox="0 0 24 24" fill="none">
              <path d="M21.99 8C22 8 22 8 21.99 8L18 12L22 16C22 16 22 16 21.99 16H2C2 16 2 16 2.01 16L6 12L2 8C2 8 2 8 2.01 8H21.99ZM21.99 6H2.01C1.45 6 1 6.45 1 7.01V16.99C1 17.55 1.45 18 2.01 18H21.99C22.55 18 23 17.55 23 16.99V7.01C23 6.45 22.55 6 21.99 6Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none">
              <path d="M21.99 8C22 8 22 8 21.99 8L18 12L22 16C22 16 22 16 21.99 16H2C2 16 2 16 2.01 16L6 12L2 8C2 8 2 8 2.01 8H21.99ZM21.99 6H2.01C1.45 6 1 6.45 1 7.01V16.99C1 17.55 1.45 18 2.01 18H21.99C22.55 18 23 17.55 23 16.99V7.01C23 6.45 22.55 6 21.99 6Z" fill="currentColor"/>
            </svg>
          </button>
          
          <button class="icon-button" @click="deleteNotification" title="삭제">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>알림을 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button class="retry-button" @click="loadNotificationDetail">다시 시도</button>
    </div>

    <!-- 컨텐츠 영역 -->
    <div v-else-if="notification" class="content-wrapper">
      <div class="content-container">
        <!-- 알림 헤더 -->
        <div class="notification-header">
          <!-- 알림 타입 배지 -->
          <div class="header-top">
            <span :class="['type-badge', `badge-${getTypeClass(notification.type)}`]">
              {{ getTypeLabel(notification.type) }}
            </span>
            <span class="notification-date">{{ formatDateTime(notification.createdAt) }}</span>
          </div>

          <!-- 제목 -->
          <h1 class="notification-title">{{ notification.title }}</h1>
        </div>

        <!-- 알림 내용 -->
        <div class="notification-body">
          <div class="message-content">
            <p>{{ notification.message }}</p>
          </div>

          <!-- 관련 링크 (있는 경우만) -->
          <div class="related-link-section" v-if="notification.link">
            <button class="link-button" @click="goToRelatedPage">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.46997L11.75 5.17997M14 11C13.5705 10.4258 13.0226 9.95078 12.3934 9.60703C11.7642 9.26327 11.0685 9.05885 10.3533 9.00763C9.63819 8.95641 8.92037 9.0596 8.24861 9.31018C7.57685 9.56077 6.96684 9.9529 6.45996 10.46L3.45996 13.46C2.54917 14.403 2.04519 15.666 2.05659 16.977C2.06798 18.288 2.59382 19.5421 3.52086 20.4691C4.4479 21.3961 5.70197 21.922 7.01295 21.9334C8.32393 21.9448 9.58694 21.4408 10.53 20.53L12.24 18.82" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>관련 페이지로 이동</span>
              <svg class="arrow-icon" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

// 상태 관리
const notification = ref(null);
const loading = ref(true);
const error = ref(null);

// 컴포넌트 마운트 시 알림 데이터 로드
onMounted(() => {
  loadNotificationDetail();
});

// 알림 상세 데이터 로드
const loadNotificationDetail = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const notificationId = route.params.id;
    const response = await axios.get(`/api/notifications/${notificationId}`);
    
    notification.value = response.data;
    
    // 알림 읽음 처리
    if (!notification.value.isRead) {
      await markAsRead(notificationId);
    }
    
  } catch (err) {
    console.error('알림 상세 정보 로드 실패:', err);
    error.value = '알림 정보를 불러오는데 실패했습니다.';
  } finally {
    loading.value = false;
  }
};

// 알림 읽음 처리
const markAsRead = async (notificationId) => {
  try {
    await axios.put(`/api/notifications/${notificationId}/read`);
    notification.value.isRead = true;
  } catch (err) {
    console.error('읽음 처리 실패:', err);
  }
};

// 읽음/읽지않음 토글
const toggleReadStatus = async () => {
  try {
    const newStatus = !notification.value.isRead;
    await axios.put(`/api/notifications/${notification.value.notificationId}/read`, {
      isRead: newStatus
    });
    notification.value.isRead = newStatus;
  } catch (err) {
    console.error('읽음 상태 변경 실패:', err);
    alert('상태 변경에 실패했습니다.');
  }
};

// 알림 삭제
const deleteNotification = async () => {
  if (!confirm('이 알림을 삭제하시겠습니까?')) return;
  
  try {
    await axios.delete(`/api/notifications/${notification.value.notificationId}`);
    alert('알림이 삭제되었습니다.');
    router.push('/notifications');
  } catch (err) {
    console.error('알림 삭제 실패:', err);
    alert('알림 삭제에 실패했습니다.');
  }
};

// 날짜 포맷팅
const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
};

// 알림 타입에 따른 라벨 반환
const getTypeLabel = (type) => {
  const typeLabels = {
    'APPROVAL_REQUEST': '결재',
    'APPROVAL_APPROVED': '결재',
    'APPROVAL_REJECTED': '결재',
    'LEAVE_REQUEST': '휴가',
    'LEAVE_APPROVED': '휴가',
    'LEAVE_REJECTED': '휴가',
    'EVALUATION': '평가',
    'ATTENDANCE_ALERT': '근태',
    'OVERTIME_ALERT': '근태',
    'PAYROLL': '급여',
    'SYSTEM': '시스템'
  };
  return typeLabels[type] || '알림';
};

// 알림 타입에 따른 CSS 클래스 반환
const getTypeClass = (type) => {
  if (type?.includes('APPROVAL')) return 'approval';
  if (type?.includes('LEAVE')) return 'leave';
  if (type?.includes('EVALUATION')) return 'evaluation';
  if (type?.includes('ATTENDANCE') || type?.includes('OVERTIME')) return 'attendance';
  if (type?.includes('PAYROLL')) return 'payroll';
  return 'system';
};

// 뒤로가기
const goBack = () => {
  router.back();
};

// 관련 페이지로 이동
const goToRelatedPage = () => {
  if (notification.value?.link) {
    router.push(notification.value.link);
  }
};
</script>

<style scoped>
/* 전역 스타일 초기화 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 페이지 컨테이너 */
.notification-detail-page {
  width: 100%;
  min-height: 100vh;
  background: #F8FAFC;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

/* ========== 헤더 스타일 ========== */
.header {
  background: white;
  border-bottom: 1px solid #E2E8F0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 900px;
  height: 64px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* 뒤로가기 버튼 */
.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: #64748B;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 6px;
}

.back-button:hover {
  background: #F1F5F9;
  color: #1E40AF;
}

.back-button img {
  width: 18px;
  height: 18px;
}

/* 아이콘 버튼 */
.icon-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-button:hover {
  background: #F1F5F9;
  border-color: #CBD5E1;
  color: #475569;
}

.icon-button svg {
  width: 18px;
  height: 18px;
}

/* ========== 로딩 스타일 ========== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E2E8F0;
  border-top-color: #1E40AF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  color: #64748B;
  font-size: 14px;
}

/* ========== 에러 스타일 ========== */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  gap: 16px;
  padding: 24px;
}

.error-icon {
  font-size: 48px;
}

.error-container p {
  color: #64748B;
  font-size: 14px;
  text-align: center;
}

.retry-button {
  padding: 10px 20px;
  background: #1E40AF;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button:hover {
  background: #1E3A8A;
}

/* ========== 컨텐츠 영역 ========== */
.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.content-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
}

/* 알림 헤더 */
.notification-header {
  padding: 32px;
  border-bottom: 1px solid #E2E8F0;
  background: #FAFBFC;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

/* 타입 뱃지 */
.type-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.badge-approval {
  background: #8B5CF6;
}

.badge-leave {
  background: #10B981;
}

.badge-evaluation {
  background: #F59E0B;
}

.badge-attendance {
  background: #3B82F6;
}

.badge-payroll {
  background: #06B6D4;
}

.badge-system {
  background: #6B7280;
}

.notification-date {
  font-size: 13px;
  color: #94A3B8;
}

/* 알림 제목 */
.notification-title {
  font-size: 24px;
  font-weight: 700;
  color: #0F172A;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

/* ========== 알림 본문 ========== */
.notification-body {
  padding: 32px;
}

.message-content {
  margin-bottom: 24px;
}

.message-content p {
  font-size: 15px;
  line-height: 1.8;
  color: #475569;
  white-space: pre-wrap;
}

/* 관련 링크 섹션 */
.related-link-section {
  padding-top: 24px;
  border-top: 1px solid #F1F5F9;
}

.link-button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px 20px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.link-button:hover {
  background: #EFF6FF;
  border-color: #BFDBFE;
  color: #1E40AF;
}

.link-button svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.link-button span {
  flex: 1;
  text-align: left;
}

.arrow-icon {
  width: 18px;
  height: 18px;
  color: #94A3B8;
}

/* ========== 반응형 디자인 ========== */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 16px;
  }

  .notification-header {
    padding: 24px 20px;
  }

  .notification-title {
    font-size: 20px;
  }

  .notification-body {
    padding: 24px 20px;
  }

  .header-content {
    padding: 0 16px;
  }

  .back-button span {
    display: none;
  }
}
</style>