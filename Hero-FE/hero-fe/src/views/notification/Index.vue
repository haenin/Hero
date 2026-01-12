<!--
  <pre>
  File Name   : NotificationPage.vue
  Description : 알림 목록 페이지 - 컴포넌트 통합 버전
                - NotificationHeader: 헤더 (뒤로가기, 제목, 설정)
                - NotificationFilter: 필터 탭 및 삭제된 알림 버튼
                - NotificationItem: 개별 알림 아이템
                - NotificationEmpty: 알림 없는 상태 UI
  
  History
  2025/12/09 (혜원) 최초작성
  2025/12/09 (혜원) 컴포넌트 분리 및 통합
  2025/12/12 (혜원) TypeScript 변환 및 Store 연동
  2025/12/16 (혜원) 삭제/복구 기능 추가
  2026/01/04 (혜원) 스타일 수정 및 클릭 동작 변경
  2026/01/06 (혜원) 페이지네이션 UI 추가 및 전체 필터링 목록 페이징 적용
  2026/01/06 (혜원) NotificationEmpty props로 삭제된 알림 Empty 상태 통합
  </pre>

  @author 혜원
  @version 3.3
-->

<template>
  <div class="notification-page">
    <NotificationHeader
      :unreadCount="unreadCount"
      @back="goBack"
      @settings="toggleSettings"
    />

    <NotificationFilter
      :tabs="tabs"
      v-model:activeTab="activeTab"
    />

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>알림을 불러오는 중...</p>
    </div>

    <div v-else class="notification-list">
      <!-- 일반 알림 목록 -->
      <transition-group v-if="activeTab !== 'deleted'" name="notification" tag="div">
        <NotificationItem
          v-for="notification in pagedItems"
          :key="notification.notificationId"
          :notification="notification"
          @view="handleViewDetail"
          @delete="handleDelete"
        />
      </transition-group>
      <!-- 삭제된 알림 목록 -->
      <transition-group v-else name="notification" tag="div">
        <div
          v-for="notification in pagedItems"
          :key="notification.notificationId"
          class="notification-item deleted"
        >
          <div class="notification-icon">
            <img
              :src="getIcon(notification.type)"
              :alt="`${notification.type} 아이콘`"
            />
          </div>

          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">
              숨김 처리됨: {{ notification.deletedAt ? getTimeAgo(notification.deletedAt) : '' }}
            </div>
          </div>

          <div class="action-buttons">
            <button
              class="restore-btn"
              type="button"
              @click="handleRestore(notification.notificationId)"
              title="복구"
            >
              <img
                src="/images/eye.svg"
                alt=""
                class="btn-icon"
              />
              숨기기 해제
            </button>

            <button
              class="hard-delete-btn"
              type="button"
              @click="handleHardDelete(notification.notificationId)"
              title="삭제"
            >
              삭제
            </button>
          </div>
        </div>
      </transition-group>


      <!-- Empty 상태 처리 -->
      <NotificationEmpty 
        v-if="filteredNotifications.length === 0 && activeTab !== 'deleted'" 
      />
      
      <!-- 삭제된 알림 Empty 상태 -->
      <NotificationEmpty 
        v-if="deletedNotifications.length === 0 && activeTab === 'deleted'"
        icon="/images/trashcan.svg"
        title="삭제된 알림이 없습니다"
        description="삭제한 알림이 여기에 표시됩니다."
      />

      <!-- 페이지네이션 컴포넌트 사용 -->
      <Paging
        v-if="currentItems.length > 0"
        v-model="currentPageIndex"
        :totalPages="totalPages"
        :windowSize="3"
      />
    </div>
  </div>
</template>

<script setup lang="ts">import { ref, computed, onMounted, onUnmounted, Ref, ComputedRef, watch } from 'vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { getRelativeTime } from '@/utils/timeUtils';
import { useNotificationStore } from '@/stores/notification/notification.store';
import NotificationHeader from '@/components/notification/NotificationHeader.vue';
import NotificationFilter from '@/components/notification/NotificationFilter.vue';
import NotificationItem from '@/components/notification/NotificationItem.vue';
import NotificationEmpty from '@/components/notification/NotificationEmpty.vue';
import Paging from '@/components/common/SlidingPagination.vue';
import type { Notification, Tab, NotificationCategory } from '@/types/notification/notification.types';

const router = useRouter();
const notificationStore = useNotificationStore();

/**
 * 현재 활성화된 탭 ID
 * @type {Ref<string>}
 */
const activeTab: Ref<string> = ref('all');

// ===== 페이징 설정 =====
/**
 * 페이지당 표시할 알림 개수
 * @type {number}
 */
const pageSize = 5;

/**
 * 현재 페이지 인덱스 (0-based)
 * @type {Ref<number>}
 */
const currentPageIndex = ref(0);

/**
 * 탭이 변경되면 0페이지로 초기화
 */
watch(activeTab, () => {
  currentPageIndex.value = 0;
});

/**
 * 현재 탭 기준 전체 아이템 (삭제된 알림 포함)
 * @returns {Array<Notification>} 현재 탭의 모든 알림 배열
 */
const currentItems = computed(() => {
  return activeTab.value === 'deleted'
    ? deletedNotifications.value
    : filteredNotifications.value;
});

/**
 * 전체 페이지 수 계산
 * @returns {number} 총 페이지 수
 */
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(currentItems.value.length / pageSize));
});

/**
 * 현재 페이지에 표시할 알림 목록
 * @returns {Array<Notification>} 페이징 처리된 알림 배열
 */
const pagedItems = computed(() => {
  const start = currentPageIndex.value * pageSize;
  return currentItems.value.slice(start, start + pageSize);
});

/**
 * 탭 목록 데이터
 * @type {Ref<Array<Tab>>}
 */
const tabs: Ref<Tab[]> = ref([
  { id: 'all', label: '전체', count: 0 },
  { id: 'unread', label: '읽지 않음', count: 0 },
  { id: 'attendance', label: '근태', count: 0 },
  { id: 'payroll', label: '급여', count: 0 },
  { id: 'approval', label: '결재', count: 0 },
  { id: 'evaluation', label: '평가', count: 0 },
  { id: 'system', label: '시스템', count: 0 },
  { id: 'deleted', label: '삭제된 알림', count: 0 }
]);

/**
 * 알림 목록 데이터 (Store에서 관리)
 * @type {ComputedRef<Array<Notification>>}
 */
const notifications: ComputedRef<Notification[]> = computed(
  () => notificationStore.notifications
);

/**
 * 삭제된 알림 목록 데이터 (Store에서 관리)
 * @type {ComputedRef<Array<Notification>>}
 */
const deletedNotifications: ComputedRef<Notification[]> = computed(
  () => notificationStore.deletedNotifications
);

/**
 * 읽지 않은 알림 개수 계산 (Store에서 관리)
 * @returns {number} 읽지 않은 알림 개수
 */
const unreadCount: ComputedRef<number> = computed(() => notificationStore.unreadCount);

/**
 * 로딩 상태 (Store에서 관리)
 * @returns {boolean} 로딩 중 여부
 */
const isLoading: ComputedRef<boolean> = computed(() => notificationStore.isLoading);

/**
 * 선택된 탭에 따른 필터링된 알림 목록
 * @returns {Array<Notification>} 필터링된 알림 배열
 */
const filteredNotifications: ComputedRef<Notification[]> = computed(() => {
  if (activeTab.value === 'all') {
    return notifications.value;
  }
  if (activeTab.value === 'unread') {
    return notifications.value.filter((n) => !n.isRead);
  }
  if (activeTab.value === 'deleted') {
    return deletedNotifications.value;
  }
  return notifications.value.filter(
    (n) => n.type === (activeTab.value as NotificationCategory)
  );
});

/**
 * 상세 보기 버튼 클릭 이벤트 핸들러
 * @param {Notification} notification - 클릭된 알림 객체
 */
const handleViewDetail = async (notification: Notification): Promise<void> => {
  try {
    // 읽음 처리
    if (!notification.isRead) {
      await notificationStore.markAsRead(notification.notificationId);
      updateTabCounts();
    }

    // 관련 페이지로 이동
    if (notification.link) {
      router.push(notification.link);
    }
  } catch (error) {
    console.error('페이지 이동 실패:', error);
  }
};

/**
 * 알림 소프트 삭제
 * @param {number} notificationId - 삭제할 알림 ID
 */
const handleDelete = async (notificationId: number): Promise<void> => {
    await notificationStore.softDeleteNotification(notificationId);
    updateTabCounts();
};

/**
 * 알림 복구
 * @param {number} notificationId - 복구할 알림 ID
 */
const handleRestore = async (notificationId: number): Promise<void> => {
  try {
    await notificationStore.restoreNotification(notificationId);
    updateTabCounts();
    alert('알림이 복구되었습니다');
  } catch (error) {
    console.error('알림 복구 실패:', error);
    alert('알림 복구에 실패했습니다');
  }
};

/**
 * 알림 영구 삭제
 * @param {number} notificationId - 영구 삭제할 알림 ID
 */
const handleHardDelete = async (notificationId: number): Promise<void> => {
  if (confirm('알림을 삭제하시겠습니까?')) {
    try {
      await notificationStore.hardDeleteNotification(notificationId);
      updateTabCounts();
      alert('알림이 삭제되었습니다');
    } catch (error) {
      console.error('알림 영구 삭제 실패:', error);
      alert('알림 삭제에 실패했습니다');
    }
  }
};

/**
 * 설정 버튼 클릭 이벤트 핸들러
 */
const toggleSettings = (): void => {
  router.push({ name: 'NotificationMySettings' });
};

/**
 * 탭별 알림 개수 업데이트
 */
const updateTabCounts = (): void => {
  tabs.value.forEach((tab) => {
    if (tab.id === 'all') {
      tab.count = 0;
    } else if (tab.id === 'unread') {
      tab.count = notifications.value.filter((n) => !n.isRead).length;
    } else if (tab.id === 'deleted') {
      tab.count = deletedNotifications.value.length;
    } else {
      tab.count = notifications.value.filter(
        (n) => n.type === (tab.id as NotificationCategory)
      ).length;
    }
  });
};

/**
 * 뒤로가기
 */
const goBack = (): void => {
  router.back();
};

/**
 * 알림 타입에 따른 아이콘 경로 반환
 * @param {NotificationCategory} type - 알림 타입
 * @returns {string} 아이콘 경로
 */
const getIcon = (type: NotificationCategory): string => {
  const iconMap: Record<NotificationCategory, string> = {
    'attendance': '/images/alarm/alarm-check.svg',
    'payroll': '/images/alarm/alarm-money.svg',
    'approval': '/images/alarm/alarm-paper.svg',
    'evaluation': '/images/alarm/alarm-paper.svg',
    'system': '/images/alarm/alarmsetting.svg'
  };
  return iconMap[type] || '/images/alarm/alarmsetting.svg';
};

/**
 * 상대 시간 포맷 함수 (유틸리티 함수 재사용)
 */
const getTimeAgo = getRelativeTime;

/**
 * 모든 알림을 읽음 처리하는 함수
 */
const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await notificationStore.markAllAsRead();
    await notificationStore.fetchNotifications();
    updateTabCounts();
  } catch (error) {
    console.error('읽음 처리 실패:', error);
  }
};

/**
 * 컴포넌트 마운트 시 실행
 * - 알림 목록 로드
 * - 삭제된 알림 로드
 * - 탭 카운트 갱신
 * (읽음 처리는 하지 않음 - 페이지 떠날 때 처리)
 */
onMounted(async () => {
  try {
    await notificationStore.fetchNotifications();
    await notificationStore.fetchDeletedNotifications();
    updateTabCounts();
  } catch (error) {
    console.error('초기화 실패:', error);
  }
});

/**
 * 페이지를 떠나기 전 모든 알림 읽음 처리
 */
onBeforeRouteLeave(async (to, from, next) => {
  await markAllNotificationsAsRead();
  next();
});

/**
 * 컴포넌트 언마운트 시 읽음 처리
 */
onUnmounted(() => {
  markAllNotificationsAsRead();
});
</script>


<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.notification-page {
  width: 100%;
  min-height: 100vh;
  background: #F8FAFC;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  overflow-y: auto;
}

.notification-list {
  margin: 0 auto;
  padding: 0 32px 40px;
  overflow-y: visible;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.notification-item.deleted {
  background: #F9FAFB;
  border-left: 3px solid #9CA3AF;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-icon img {
  width: 20px;
  height: 20px;
  margin-bottom: 25px;     
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #94a3b8;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.restore-btn,
.hard-delete-btn {
  padding: 8px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #62748e;
  transition: all 0.2s;
}

.restore-btn,
.hard-delete-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}


.restore-btn {
   background-color: white;
  border-color: #e2e8f0;

}

.restore-btn:hover {
  background-color: #f8fafc;
}

.hard-delete-btn {
  background: #FEE2E2;
   background-color: white;
}

.hard-delete-btn:hover {
    background-color: #f8fafc;
}

/* 트랜지션 효과 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .notification-list {
    padding-left: 24px;
    padding-right: 24px;
  }
}

@media (max-width: 768px) {
  .notification-list {
    padding: 0 20px 32px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .restore-btn,
  .hard-delete-btn {
    width: 100%;
  }
}
</style>