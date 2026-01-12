<!-- 
  <pre>
  Component Name : RecentActivity
  Description : 최근 활동 알림 컴포넌트
                - 최근 알림 3개 표시
                - 알림 클릭 시 상세 페이지 이동
                - 알림 타입별 아이콘 표시
 
  History
  2025/12/26 (혜원) 최초 작성
  2026/01/06 (혜원) 디자인 수정
  </pre>
 
  @author 혜원
  @version 1.0
-->
<template>
  <section class="card activity-card-container">
    <div class="activity-header">
      <h3>최근 활동</h3>
      <!-- 전체 알림 페이지로 이동 -->
      <button 
        class="more-btn" 
        @click="emit('viewAll')"
      >
        더보기 <i class="pi pi-angle-right"></i>
      </button>
    </div>
    
    <div class="activity-body-list">
      <!-- 로딩 중 -->
      <div 
        v-if="isLoading" 
        class="loading-msg"
      >
        알림을 불러오는 중...
      </div>
      
      <!-- 알림 목록 (최대 3개) -->
      <template v-else-if="notifications.length > 0">
        <div 
          v-for="item in notifications" 
          :key="item.notificationId" 
          class="activity-row-item" 
          @click="emit('clickNotification', item)"
        >
          <!-- 알림 타입별 아이콘 -->
          <div class="activity-icon-box">
            <img 
              :src="getNotificationIcon(item.type)" 
              class="custom-noti-icon" 
              alt="알림 아이콘"
            />
          </div>
          <!-- 알림 메시지 & 시간 -->
          <div class="activity-text-wrap">
            <p class="activity-msg">{{ item.message }} • {{ item.timeAgo }}</p>
          </div>
        </div>
      </template>
      
      <!-- 알림 없음 -->
      <div 
        v-else 
        class="empty-msg"
      >
        최근 활동 내역이 없습니다.
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Notification } from '@/types/notification/notification.types';

// Props
interface Props {
  notifications: Notification[];  // 알림 목록 (최대 3개)
  isLoading: boolean;              // 로딩 상태
}

defineProps<Props>();

// Emits
const emit = defineEmits<{
  viewAll: [];                                    // 더보기 버튼 클릭
  clickNotification: [notification: Notification]; // 알림 클릭
}>();

/**
 * 알림 타입별 아이콘 경로 반환
 * @param type - 알림 타입 (attendance, payroll, approval, evaluation, system)
 * @returns 아이콘 이미지 경로
 */
const getNotificationIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'attendance': '/images/alarm/alarm-check.svg',   // 근태
    'payroll': '/images/alarm/alarm-money.svg',       // 급여
    'approval': '/images/alarm/alarm-paper.svg',      // 결재
    'evaluation': '/images/alarm/alarm-paper.svg',    // 평가
    'system': '/images/alarm/alarmsetting.svg'        // 시스템
  };
  return iconMap[type] || '/images/alarm/alarmsetting.svg';
};
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 11.25px;
  border: 2px solid #E2E8F0;
  padding: 29px;
  box-shadow: 0px 1px 2px -1px rgba(0, 0, 0, 0.10);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.activity-header h3 {
  color: #1C398E;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.more-btn {
  background: none;
  border: none;
  color: #62748E;
  font-size: 16px;
  cursor: pointer;
}

.activity-row-item {
  height: 72px;
  padding: 18px;
  background: #EFF6FF;
  border-radius: 11.25px;
  outline: 2px #DBEAFE solid;
  outline-offset: -2px;
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 13.5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.activity-row-item:hover {
  background: #DBEAFE;
}

.activity-icon-box {
  width: 40.5px;
  height: 40.5px;
  background: #1E3A8A;
  border-radius: 11.25px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-noti-icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
}

.loading-msg, .empty-msg {
  text-align: center;
  padding: 40px;
  color: #90A1B9;
}
</style>