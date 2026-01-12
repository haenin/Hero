/**
 * <pre>
 * TypeScript Name: useNotificationSocket
 * Description: WebSocket 알림 연결 Composable
 *              STOMP 프로토콜을 사용한 실시간 알림 수신
 *              - WebSocket 서버 연결 및 해제
 *              - JWT 토큰 기반 인증
 *              - 알림 토픽 구독 관리
 *              - 자동 재연결 (5초 간격)
 *              - Heartbeat를 통한 연결 유지
 *
 * History
 * 2025/12/14 (혜원) 최초 작성
 * 2025/12/25 (혜원) JWT 토큰 인증 추가
 * 2026/01/02 (혜원) 환경 변수 기반 WebSocket URL 설정 (VITE_API_URL 재사용)
 * </pre>
*/

import { ref, Ref } from 'vue';
import SockJS from 'sockjs-client';
import { Client, StompSubscription } from '@stomp/stompjs';
import { useAuthStore } from '@/stores/auth';  // 추가
import type { NotificationDTO, WebSocketMessage } from '@/types/notification/notification.types';

interface UseNotificationSocket {
  isConnected: Ref<boolean>;
  connect: (employeeId: number, onMessage: (notification: NotificationDTO) => void) => void;
  disconnect: () => void;
}

/**
 * WebSocket 알림 연결 Composable
 * 
 * @description STOMP 프로토콜을 사용한 WebSocket 연결 관리
 * @returns {UseNotificationSocket} WebSocket 연결 상태 및 메서드
 */
export function useNotificationSocket(): UseNotificationSocket {
  const isConnected: Ref<boolean> = ref(false);
  let stompClient: Client | null = null;
  let subscription: StompSubscription | null = null;

  /**
   * WebSocket 서버에 연결하고 알림 토픽 구독
   * 
   * @param employeeId - 구독할 직원 ID
   * @param onMessage - 알림 수신 시 실행할 콜백 함수
   */
  const connect = (
    employeeId: number,
    onMessage: (notification: NotificationDTO) => void
  ): void => {
    // authStore에서 토큰 가져오기
    const authStore = useAuthStore();
    const token = authStore.accessToken;
    
    if (!token) {
      console.error('[WebSocket] JWT 토큰이 없습니다. 로그인이 필요합니다.');
      return;
    }

    console.log('[WebSocket] 토큰 확인:', token ? '토큰 존재' : '토큰 없음');

    // SockJS 소켓 생성
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.endsWith('/api') 
                ? apiUrl.slice(0, -4) 
                : apiUrl;
    const socket = new SockJS(`${baseUrl}/ws/notifications`);
    
    // STOMP 클라이언트 설정
    stompClient = new Client({
      webSocketFactory: () => socket as WebSocket,
      
      // STOMP 연결 시 JWT 토큰을 헤더에 포함
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      
      debug: (str: string) => {
        // 프로덕션에서는 주석 처리
        // console.log(str);
      },
      reconnectDelay: 5000,      // 재연결 대기 시간 (ms)
      heartbeatIncoming: 4000,   // 서버로부터 heartbeat 수신 간격
      heartbeatOutgoing: 4000,   // 서버로 heartbeat 전송 간격
    });

    // 연결 성공 시 콜백
    stompClient.onConnect = (frame) => {
      console.log('[WebSocket] 연결 성공');
      console.log('[WebSocket] 연결 프레임:', frame);
      isConnected.value = true;

      if (stompClient) {
        // 알림 토픽 구독
        subscription = stompClient.subscribe(
          `/topic/notifications/${employeeId}`,
          (message: WebSocketMessage) => {
            try {
              const notification: NotificationDTO = JSON.parse(message.body);
              console.log('[WebSocket] 알림 수신:', notification);
              onMessage(notification);
            } catch (error) {
              console.error('[WebSocket] 메시지 파싱 실패:', error);
            }
          }
        );
        console.log(`[WebSocket] 토픽 구독 완료: /topic/notifications/${employeeId}`);
      }
    };

    // STOMP 에러 처리
    stompClient.onStompError = (frame) => {
      console.error('[WebSocket] STOMP 에러 발생:', frame.headers['message']);
      console.error('[WebSocket] 에러 상세:', frame.body);
      isConnected.value = false;
    };

    // WebSocket 연결 종료 처리
    stompClient.onWebSocketClose = () => {
      console.log('[WebSocket] 연결 종료됨');
      isConnected.value = false;
    };

    // WebSocket 연결 시작
    console.log('[WebSocket] 연결 시작...');
    stompClient.activate();
  };

  /**
   * WebSocket 연결 해제 및 리소스 정리
   */
  const disconnect = (): void => {
    // 구독 해제
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
      console.log('[WebSocket] 토픽 구독 해제됨');
    }

    // 클라이언트 비활성화
    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
      console.log('[WebSocket] 연결 해제 완료');
      isConnected.value = false;
    }
  };

  return {
    isConnected,
    connect,
    disconnect,
  };
}