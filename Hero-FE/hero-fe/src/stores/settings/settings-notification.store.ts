/**
 * <pre>
 * TypeScript Name   : settings-notification.store
 * Description : 관리자 알림 발송 및 이력 관리 Store
 * 
 * History
 * 2025/12/23 (혜원) 최초 작성
 * </pre>
 * 
 * @author 혜원
 * @version 1.0
 */

import { defineStore } from 'pinia';
import { ref, computed, type Ref, type ComputedRef } from 'vue';
import { settingsNotificationApi } from '@/api/settings/settings-notification.api';
import type {
  BroadcastNotificationRequestDTO,
  GroupNotificationRequestDTO,
  IndividualNotificationRequestDTO,
  NotificationHistoryDTO,
  NotificationStatisticsDTO,
  WebSocketHealthDTO,
} from '@/types/settings/settings-notification.types';

interface SettingsNotificationStore {
  // State
  historyList: Ref<NotificationHistoryDTO[]>;
  statistics: Ref<NotificationStatisticsDTO | null>;
  health: Ref<WebSocketHealthDTO | null>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  
  // Getters
  totalHistoryCount: ComputedRef<number>;
  totalCount: ComputedRef<number>;
  
  // Actions - Command
  sendBroadcast: (request: BroadcastNotificationRequestDTO) => Promise<void>;
  sendGroup: (request: GroupNotificationRequestDTO) => Promise<void>;
  sendIndividual: (request: IndividualNotificationRequestDTO) => Promise<void>;
  
  // Actions - Query
  fetchHistory: (page: number, size: number, startDate?: string, endDate?: string, type?: string) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  fetchHealth: () => Promise<void>;
}

export const useSettingsNotificationStore = defineStore('settingsNotification', (): SettingsNotificationStore => {
  // ========== State ==========
  const historyList: Ref<NotificationHistoryDTO[]> = ref([]);
  const statistics: Ref<NotificationStatisticsDTO | null> = ref(null);
  const health: Ref<WebSocketHealthDTO | null> = ref(null);
  const isLoading: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);
  const totalElements: Ref<number> = ref(0);

  // ========== Getters ==========
  const totalHistoryCount: ComputedRef<number> = computed(() => historyList.value.length);
  const totalCount: ComputedRef<number> = computed(() => totalElements.value);

  // ========== Actions - Command (발송) ==========

  /**
   * 전체 직원 대상 알림 발송
   * 
   * @param request 발송 요청 데이터
   */
  const sendBroadcast = async (request: BroadcastNotificationRequestDTO): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      await settingsNotificationApi.sendBroadcast(request);
      
      // 발송 후 통계 갱신
      await fetchStatistics();
    } catch (err: any) {
      error.value = err.response?.data?.message || '전체 발송에 실패했습니다.';
      console.error('Broadcast notification failed:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 그룹 대상 알림 발송
   * 
   * @param request 그룹 발송 요청 데이터
   */
  const sendGroup = async (request: GroupNotificationRequestDTO): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      await settingsNotificationApi.sendGroup(request);
      
      // 발송 후 통계 갱신
      await fetchStatistics();
    } catch (err: any) {
      error.value = err.response?.data?.message || '그룹 발송에 실패했습니다.';
      console.error('Group notification failed:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 개별 직원 대상 알림 발송
   * 
   * @param request 개별 발송 요청 데이터
   */
  const sendIndividual = async (request: IndividualNotificationRequestDTO): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      await settingsNotificationApi.sendIndividual(request);
      
      // 발송 후 통계 갱신
      await fetchStatistics();
    } catch (err: any) {
      error.value = err.response?.data?.message || '개별 발송에 실패했습니다.';
      console.error('Individual notification failed:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // ========== Actions - Query (조회) ==========

  /**
   * 발송 이력 조회
   * 
   * @param page 페이지 번호
   * @param size 페이지 크기
   * @param startDate 조회 시작일
   * @param endDate 조회 종료일
   * @param type 알림 타입
   */
  const fetchHistory = async (
    page: number,
    size: number,
    startDate?: string,
    endDate?: string,
    type?: string
  ): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await settingsNotificationApi.getHistory(page, size, startDate, endDate, type);
      historyList.value = response.content || [];
      totalElements.value = response.totalElements;
    } catch (err: any) {
      error.value = err.response?.data?.message || '이력 조회에 실패했습니다.';
      console.error('Fetch history failed:', err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 발송 통계 조회
   */
  const fetchStatistics = async (): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      statistics.value = await settingsNotificationApi.getStatistics();
    } catch (err: any) {
      error.value = err.response?.data?.message || '통계 조회에 실패했습니다.';
      console.error('Fetch statistics failed:', err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * WebSocket Health Check
   */
  const fetchHealth = async (): Promise<void> => {
    try {
      error.value = null;

      health.value = await settingsNotificationApi.getHealth();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Health 조회에 실패했습니다.';
      console.error('Fetch health failed:', err);
    }
  };

  return {
    // State
    historyList,
    statistics,
    health,
    isLoading,
    error,

    // Getters
    totalHistoryCount,
    totalCount,

    // Actions
    sendBroadcast,
    sendGroup,
    sendIndividual,
    fetchHistory,
    fetchStatistics,
    fetchHealth,
  };
});