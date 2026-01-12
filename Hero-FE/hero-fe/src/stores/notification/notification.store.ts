/**
 * <pre>
 * TypeScript Name: notification.store
 * Description: 알림 전역 상태 관리 (Pinia Store)
 *
 * History
 * 2025/12/14 (혜원) 최초 작성
 * 2025/12/16 (혜원) 삭제 관련 상태 및 액션 추가, WebSocket 연동
 * 2025/12/21 (혜원) JWT 토큰 기반으로 변경, employeeId 파라미터 제거
 * </pre>
 *
 * @author 혜원
 * @version 3.0
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { notificationApi } from '@/api/notification/notification.api';
import { useAuthStore } from '@/stores/auth';
import { useNotificationSocket } from '@/composables/notification/useNotificationSocket';
import type { 
  Notification, 
  NotificationDTO, 
  NotificationCategory 
} from '@/types/notification/notification.types';
import { useNotificationSettingsStore } from './notificationSettings.store';

export const useNotificationStore = defineStore('notification', () => {
  const authStore = useAuthStore();
  const { isConnected, connect, disconnect } = useNotificationSocket();
  
  // State 
  const notifications = ref<Notification[]>([]);
  const deletedNotifications = ref<Notification[]>([]);
  const unreadCount = ref<number>(0);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Computed 
  const employeeId = computed(() => authStore.employeeId);

  // Actions - Query (조회) 

  /**
   * 알림 목록 조회
   */
  const fetchNotifications = async (): Promise<void> => {
    if (!employeeId.value) return;

    try {
      isLoading.value = true;
      error.value = null;
      
      const data = await notificationApi.findNotifications();
      notifications.value = data.map(mapDTOToNotification);
        
    } catch (err) {
      error.value = '알림을 불러오는데 실패했습니다';
      console.error('알림 조회 실패:', err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 미읽은 알림 개수 조회
   */
  const fetchUnreadCount = async (): Promise<void> => {
    if (!employeeId.value) return;

    try {
      unreadCount.value = await notificationApi.findUnreadCount();
    } catch (err) {
      console.error('미읽은 알림 개수 조회 실패:', err);
    }
  };

  /**
   * 삭제된 알림 목록 조회
   */
  const fetchDeletedNotifications = async (): Promise<void> => {
    if (!employeeId.value) return;

    try {
      isLoading.value = true;
      error.value = null;
      
      const data = await notificationApi.findDeletedNotifications();
      deletedNotifications.value = data.map(mapDTOToNotification);
      
    } catch (err) {
      error.value = '삭제된 알림을 불러오는데 실패했습니다';
      console.error('삭제된 알림 조회 실패:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Actions - Command (변경)

  /**
   * 알림 읽음 처리
   */
  const markAsRead = async (notificationId: number): Promise<void> => {
    try {
      await notificationApi.modifyIsRead(notificationId);
      
      // 로컬 상태 업데이트
      const notification = notifications.value.find(n => n.notificationId === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err);
      throw err;
    }
  };

  /**
   * 모든 알림 읽음 처리
   */
  const markAllAsRead = async (): Promise<void> => {
    if (!employeeId.value) return;

    try {
      await notificationApi.modifyAllIsRead();
      
      // 로컬 상태 업데이트
      const now = new Date().toISOString();
      notifications.value.forEach(notification => {
        if (!notification.isRead) {
          notification.isRead = true;
          notification.readAt = now;
        }
      });
      unreadCount.value = 0;
      
    } catch (err) {
      console.error('전체 읽음 처리 실패:', err);
      throw err;
    }
  };

  /**
   * 알림 소프트 삭제
   */
  const softDeleteNotification = async (notificationId: number): Promise<void> => {
    try {
      await notificationApi.softRemove(notificationId);
      
      // 일반 목록에서 제거
      const index = notifications.value.findIndex(n => n.notificationId === notificationId);
      if (index !== -1) {
        const notification = notifications.value[index];
        
        // 삭제 상태 업데이트
        notification.isDeleted = true;
        notification.deletedAt = new Date().toISOString();
        
        // 삭제된 목록으로 이동
        deletedNotifications.value.unshift(notification);
        notifications.value.splice(index, 1);
        
        // 미읽은 알림이었다면 카운트 감소
        if (!notification.isRead) {
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
      }
    } catch (err) {
      error.value = '알림 삭제에 실패했습니다';
      console.error('알림 삭제 실패:', err);
      throw err;
    }
  };

  /**
   * 알림 복구
   */
  const restoreNotification = async (notificationId: number): Promise<void> => {
    try {
      await notificationApi.modifyRestore(notificationId);
      
      // 삭제된 목록에서 제거
      const index = deletedNotifications.value.findIndex(n => n.notificationId === notificationId);
      if (index !== -1) {
        const notification = deletedNotifications.value[index];
        
        // 복구 상태 업데이트
        notification.isDeleted = false;
        notification.deletedAt = null;
        
        // 일반 목록으로 복구
        notifications.value.unshift(notification);
        deletedNotifications.value.splice(index, 1);
        
        // 미읽은 알림이면 카운트 증가
        if (!notification.isRead) {
          unreadCount.value += 1;
        }
      }
    } catch (err) {
      error.value = '알림 복구에 실패했습니다';
      console.error('알림 복구 실패:', err);
      throw err;
    }
  };

  /**
   * 알림 영구 삭제
   */
  const hardDeleteNotification = async (notificationId: number): Promise<void> => {
    try {
      await notificationApi.removeNotification(notificationId);
      
      // 삭제된 목록에서 완전히 제거
      const index = deletedNotifications.value.findIndex(n => n.notificationId === notificationId);
      if (index !== -1) {
        deletedNotifications.value.splice(index, 1);
      }
    } catch (err) {
      error.value = '알림 영구 삭제에 실패했습니다';
      console.error('알림 영구 삭제 실패:', err);
      throw err;
    }
  };

  /**
   * 브라우저 알림 표시
   * DB 설정과 브라우저 권한 모두 확인
   */
  const showBrowserNotification = async (notification: Notification): Promise<void> => {
    // 1. DB 설정 확인
    const settingsStore = useNotificationSettingsStore();
    await settingsStore.loadSettings();
    
    if (!settingsStore.settings.browserNotification) {
      console.log('사용자가 브라우저 알림을 OFF로 설정함. 알림 표시 안 함');
      return;
    }
    
    // 2. 브라우저 권한 확인
    if (!('Notification' in window)) {
      console.log('브라우저가 알림을 지원하지 않음');
      return;
    }
    
    if (Notification.permission !== 'granted') {
      console.log('브라우저 알림 권한이 없음. 알림 표시 안 함');
      return;
    }

    // 3. 둘 다 OK면 알림 표시
    new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      tag: `notification-${notification.notificationId}`,
    });
  };

  /**
   * 새 알림 추가 (WebSocket 수신 시)
   */
  const addNotification = (notification: Notification): void => {
    notifications.value.unshift(notification);
    if (!notification.isRead) {
      unreadCount.value += 1;
    }
  };

  // Helper Functions

  /**
   * DTO → UI 모델 변환
   */
  const mapDTOToNotification = (dto: NotificationDTO): Notification => {
    return {
      notificationId: dto.notificationId,
      employeeId: dto.employeeId,
      type: dto.type as NotificationCategory, // 백엔드에서 이미 category로 전송됨
      title: dto.title,
      message: dto.message,
      link: dto.link,
      isRead: dto.isRead,
      isDeleted: dto.isDeleted,
      createdAt: dto.createdAt,
      readAt: dto.readAt,
      deletedAt: dto.deletedAt,
      attendanceId: dto.attendanceId,
      payrollId: dto.payrollId,
      documentId: dto.documentId,
      evaluationId: dto.evaluationId,
      timeAgo: getTimeAgo(dto.createdAt),
    };
  };

  /**
   * 상대 시간 계산
   */
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  // WebSocket 관련

  /**
   * WebSocket 연결
   */
  const connectWebSocket = (): void => {
    if (!employeeId.value) {
      console.warn('[WebSocket] employeeId가 없어서 연결할 수 없습니다');
      return;
    }

    console.log('[WebSocket] 연결 시작:', employeeId.value);
    
    connect(employeeId.value, (newNotification: NotificationDTO) => {
      console.log('[WebSocket] 새 알림 수신:', newNotification);
      
      const formattedNotification = mapDTOToNotification(newNotification);
      formattedNotification.timeAgo = '방금 전';

      // 알림 목록에 추가
      notifications.value.unshift(formattedNotification);
      unreadCount.value++;

      // 브라우저 알림 표시
      showBrowserNotification(formattedNotification);
    });
  };

  /**
   * WebSocket 연결 해제
   */
  const disconnectWebSocket = (): void => {
    console.log('[WebSocket] 연결 해제');
    disconnect();
  };

  return {
    // State
    notifications,
    deletedNotifications,
    unreadCount,
    isLoading,
    error,
    isConnected,
    
    // Actions - Query
    fetchNotifications,
    fetchUnreadCount,
    fetchDeletedNotifications,
    
    // Actions - Command
    markAsRead,
    markAllAsRead,
    softDeleteNotification,
    restoreNotification,
    hardDeleteNotification,
    addNotification,
    
    // WebSocket
    connectWebSocket,
    disconnectWebSocket,
  };
});