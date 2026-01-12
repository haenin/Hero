/**
 * <pre>
 * TypeScript Name   : settings-notification.api
 * Description : 관리자 알림 관련 API 클라이언트
 * 
 * History
 * 2025/12/23 (혜원) 최초 작성
 * </pre>
 * 
 * @author 혜원
 * @version 1.0
 */

import apiClient from '@/api/apiClient';
import type {
  BroadcastNotificationRequestDTO,
  GroupNotificationRequestDTO,
  IndividualNotificationRequestDTO,
  NotificationHistoryDTO,
  NotificationStatisticsDTO,
  WebSocketHealthDTO,
  PageResponseDTO
} from '@/types/settings/settings-notification.types';

const BASE_URL = '/settings/notifications';

/**
 * 관리자 알림 API
 */
export const settingsNotificationApi = {
  /**
   * 전체 직원 대상 알림 발송
   * 
   * @param request 발송 요청 데이터
   * @returns 성공 메시지
   */
  sendBroadcast: async (request: BroadcastNotificationRequestDTO): Promise<string> => {
    const response = await apiClient.post(`${BASE_URL}/broadcast`, request);
    return response.data.data;
  },

  /**
   * 그룹 대상 알림 발송
   * 
   * @param request 그룹 발송 요청 데이터
   * @returns 성공 메시지
   */
  sendGroup: async (request: GroupNotificationRequestDTO): Promise<string> => {
    const response = await apiClient.post(`${BASE_URL}/group`, request);
    return response.data.data;
  },

  /**
   * 개별 직원 대상 알림 발송
   * 
   * @param request 개별 발송 요청 데이터
   * @returns 성공 메시지
   */
  sendIndividual: async (request: IndividualNotificationRequestDTO): Promise<string> => {
    const response = await apiClient.post(`${BASE_URL}/individual`, request);
    return response.data.data;
  },

  /**
   * 발송 이력 조회 (페이징)
   * 
   * @param page 페이지 번호 (0부터 시작)
   * @param size 페이지 크기
   * @param startDate 조회 시작일 (optional)
   * @param endDate 조회 종료일 (optional)
   * @param type 알림 타입 (optional)
   * @returns 발송 이력 페이지 응답
   */
  getHistory: async (
    page: number,
    size: number,
    startDate?: string,
    endDate?: string,
    type?: string
  ): Promise<PageResponseDTO<NotificationHistoryDTO>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (startDate) params.append('startDate', startDate.trim());
    if (endDate) params.append('endDate', endDate.trim());
    if (type && type !== 'ALL') params.append('type', type);

    const response = await apiClient.get(`${BASE_URL}/history?${params.toString()}`);
    return response.data.data;
  },

  /**
   * 발송 통계 조회
   * 
   * @returns 통계 정보
   */
  getStatistics: async (): Promise<NotificationStatisticsDTO> => {
    const response = await apiClient.get(`${BASE_URL}/statistics`);
    return response.data.data;
  },

  /**
   * WebSocket 연결 상태 Health Check
   * 
   * @returns WebSocket 상태 정보
   */
  getHealth: async (): Promise<WebSocketHealthDTO> => {
    const response = await apiClient.get(`${BASE_URL}/health`);
    return response.data.data;
  },
};