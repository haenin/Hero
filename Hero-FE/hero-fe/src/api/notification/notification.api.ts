/**
 * <pre>
 * TypeScript Name: notificationApi
 * Description: 알림 API 클라이언트
 *              백엔드 알림 API와 통신하는 모든 요청을 정의
 *
 * 주요 기능:
 * - 알림 목록 조회 (일반/삭제됨)
 * - 알림 읽음 처리 (개별/전체)
 * - 알림 삭제 (소프트/하드)
 * - 알림 복구
 * - 알림 설정 조회 및 수정
 *
 * History
 * 2025/12/12 (혜원) 최초 작성
 * 2025/12/16 (혜원) 삭제 관련 API 추가, 경로 수정
 * 2025/12/17 (혜원) 설정 관련 API 추가
 * 2025/12/21 (혜원) JWT 토큰 기반 인증으로 변경, employeeId 파라미터 제거
 * </pre>
 *
 * @author 혜원
 * @version 3.0
 */

import apiClient from '@/api/apiClient';
import type { NotificationDTO } from '@/types/notification/notification.types';
import type { NotificationSettingsDTO } from '@/types/notification/notification.types';

/**
 * 알림 관련 API 요청 모음
 */
export const notificationApi = {
  
  /**
   * 일반 알림 목록 조회 (삭제되지 않은 알림)
   * @returns {Promise<NotificationDTO[]>} 알림 목록
   */
  findNotifications: async (): Promise<NotificationDTO[]> => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  /**
   * 삭제된 알림 목록 조회 (휴지통)
   * @returns {Promise<NotificationDTO[]>} 삭제된 알림 목록
   */
  findDeletedNotifications: async (): Promise<NotificationDTO[]> => {
    const response = await apiClient.get('/notifications/deleted');
    return response.data;
  },

  /**
   * 미읽은 알림 개수 조회
   * @returns {Promise<number>} 미읽은 알림 개수
   */
  findUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  /**
   * 알림 읽음 처리 (개별)
   * @param {number} notificationId - 읽음 처리할 알림 ID
   * @returns {Promise<void>}
   */
  modifyIsRead: async (notificationId: number): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  /**
   * 모든 알림 읽음 처리
   * @returns {Promise<void>}
   */
  modifyAllIsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },

  /**
   * 알림 소프트 삭제 (30일 후 자동 영구 삭제)
   * @param {number} notificationId - 삭제할 알림 ID
   * @returns {Promise<void>}
   */
  softRemove: async (notificationId: number): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}`);
  },

  /**
   * 삭제된 알림 복구
   * @param {number} notificationId - 복구할 알림 ID
   * @returns {Promise<void>}
   */
  modifyRestore: async (notificationId: number): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/restore`);
  },

  /**
   * 알림 영구 삭제 (복구 불가능)
   * @param {number} notificationId - 영구 삭제할 알림 ID
   * @returns {Promise<void>}
   */
  removeNotification: async (notificationId: number): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}/permanent`);
  },

  /**
   * 알림 설정 조회
   * @returns {Promise<NotificationSettingsDTO>} 알림 설정
   */
  findSettings: async (): Promise<NotificationSettingsDTO> => {
    const response = await apiClient.get('/notifications/settings');
    return response.data;
  },

  /**
   * 알림 설정 수정
   * @param {NotificationSettingsDTO} settings - 수정할 설정
   * @returns {Promise<NotificationSettingsDTO>} 수정된 설정
   */
  modifySettings: async (settings: NotificationSettingsDTO): Promise<NotificationSettingsDTO> => {
    const response = await apiClient.put('/notifications/settings', settings);
    return response.data;
  },
};