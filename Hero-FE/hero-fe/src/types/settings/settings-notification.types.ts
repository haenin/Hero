/*
  <pre>
  TypeScript Name    : settings-notification.types
  Description : 알림 시스템 관련 데이터 전송 객체 (DTO) 정의
  
  History
  2025/12/22 (혜원) 최초 작성
  </pre>
 
  @author 혜원
  @version 1.1
*/

/**
 * 전체 알림 브로드캐스트 요청 DTO
 * 
 * @description 전체 직원 대상 알림 발송 요청 데이터
 * @property {string} title - 알림 제목
 * @property {string} message - 알림 내용
 * @property {string} type - 알림 유형 (SYSTEM, ATTENDANCE 등)
 * @property {string} [link] - 알림 클릭 시 이동할 링크 (optional)
 */
export interface BroadcastNotificationRequestDTO {
  title: string;
  message: string;
  type: string;
  link?: string;
}

/**
 * 그룹별 알림 전송 요청 DTO
 * 
 * @description 특정 부서, 직급, 직책 그룹 대상 알림 발송 요청 데이터
 * @property {string} title - 알림 제목
 * @property {string} message - 알림 내용
 * @property {string} type - 알림 유형
 * @property {string} [link] - 알림 클릭 시 이동할 링크 (optional)
 * @property {number[]} departmentIds - 대상 부서 ID 목록
 * @property {number[]} gradeIds - 대상 직급 ID 목록
 * @property {number[]} jobTitleIds - 대상 직책 ID 목록
 */
export interface GroupNotificationRequestDTO {
  title: string;
  message: string;
  type: string;
  link?: string;
  departmentIds: number[];
  gradeIds: number[];
  jobTitleIds: number[];
}

/**
 * 개별 알림 전송 요청 DTO
 * 
 * @description 특정 직원 개인 대상 알림 발송 요청 데이터
 * @property {string} title - 알림 제목
 * @property {string} message - 알림 내용
 * @property {string} type - 알림 유형
 * @property {string} [link] - 알림 클릭 시 이동할 링크 (optional)
 * @property {number[]} employeeIds - 대상 직원 ID 목록
 */
export interface IndividualNotificationRequestDTO {
  title: string;
  message: string;
  type: string;
  link?: string;
  employeeIds: number[];
}

/**
 * 알림 전송 이력 DTO
 * 
 * @description 알림 발송 이력 조회 결과 데이터
 * @property {number} historyId - 알림 이력 고유 ID
 * @property {string} title - 알림 제목
 * @property {string} message - 알림 내용
 * @property {string} type - 알림 유형
 * @property {string} scope - 전송 범위 (BROADCAST, GROUP, INDIVIDUAL)
 * @property {number} targetCount - 전송 대상 인원 수
 * @property {number} successCount - 전송 성공 건수
 * @property {number} failureCount - 전송 실패 건수
 * @property {string | null} senderName - 발신자 이름 (시스템 알림의 경우 null)
 * @property {string} sentAt - 발송 일시 (ISO 8601 형식)
 */
export interface NotificationHistoryDTO {
  historyId: number;
  title: string;
  message: string;
  type: string;
  scope: string;
  targetCount: number;
  successCount: number;
  failureCount: number;
  senderName: string | null;
  sentAt: string;
}

/**
 * 알림 시스템 통계 DTO
 * 
 * @description 알림 발송 통계 데이터
 * @property {number} todayCount - 오늘 발송된 알림 수
 * @property {number} weekCount - 이번 주 발송된 알림 수
 * @property {number} monthCount - 이번 달 발송된 알림 수
 * @property {number} totalCount - 전체 발송된 알림 수
 * @property {number} averageSuccessRate - 평균 전송 성공률 (0-100)
 * @property {number} activeConnections - 현재 활성 WebSocket 연결 수
 * @property {string} [mostSentType] - 가장 많이 발송된 알림 유형 (optional)
 */
export interface NotificationStatisticsDTO {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  totalCount: number;
  averageSuccessRate: number;
  activeConnections: number;
  mostSentType?: string;
}

/**
 * WebSocket 서버 상태 정보 DTO
 * 
 * @description WebSocket 서버 상태 및 연결 정보
 * @property {string} status - 서버 상태 (HEALTHY, DEGRADED, DOWN)
 * @property {number} activeConnections - 현재 활성 연결 수
 * @property {number} maxConnections - 최대 허용 연결 수
 * @property {number} averageResponseTime - 평균 응답 시간 (ms)
 * @property {string} lastCheckTime - 마지막 체크 시각 (ISO 8601 형식)
 */
export interface WebSocketHealthDTO {
  status: string;
  activeConnections: number;
  maxConnections: number;
  averageResponseTime: number;
  lastCheckTime: string;
}

/**
 * 페이지네이션 응답 DTO
 * 
 * @description 페이징 처리된 목록 응답 래퍼
 * @template T 페이지 컨텐츠의 데이터 타입
 * @property {T[]} content - 현재 페이지의 데이터 배열
 * @property {number} pageNumber - 현재 페이지 번호 (0부터 시작)
 * @property {number} pageSize - 페이지당 데이터 수
 * @property {number} totalElements - 전체 데이터 개수
 * @property {number} totalPages - 전체 페이지 수
 * @property {boolean} last - 마지막 페이지 여부
 */
export interface PageResponseDTO<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
