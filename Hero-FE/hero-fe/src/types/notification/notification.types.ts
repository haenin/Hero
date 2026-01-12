/**
 * <pre>
 * TypeScript Name: notification.types
 * Description: 알림 시스템 타입 정의
 *              백엔드 DTO, 프론트엔드 모델, WebSocket 관련 타입 정의
 *
 * 주요 타입:
 * - NotificationDTO: 백엔드 응답 데이터 구조
 * - Notification: 프론트엔드 UI용 데이터 구조
 * - NotificationType: 백엔드 알림 타입 (11종)
 * - NotificationCategory: 프론트엔드 카테고리 (6종)
 * - NotificationSettingsDTO: 백엔드 알림 설정 응답 데이터 구조
 * - NotificationSettingItem: 설정 페이지 UI용 타입
 *
 * History
 * 2025/12/14 (혜원) 최초 작성
 * 2025/12/16 (혜원) 필드 추가, 설정 타입 추가
 * 2025/12/17 (혜원) NotificationSettings 제거, DTO로 통일
 * </pre>
 *
 * @author 혜원
 * @version 2.1
 */

/**
 * 백엔드 알림 DTO
 * 
 * @description 백엔드 API 응답 및 WebSocket 메시지 형식
 * @property {number} notificationId - 알림 ID
 * @property {NotificationType} type - 알림 타입
 * @property {string} title - 알림 제목
 * @property {string} message - 알림 내용
 * @property {string | null} link - 연결된 페이지 경로
 * @property {boolean} isRead - 읽음 여부
 * @property {boolean} isDeleted - 소프트 삭제 여부
 * @property {string} createdAt - 생성 일시 
 * @property {string | null} readAt - 읽은 일시
 * @property {string | null} deletedAt - 소프트 삭제 일시
 * @property {number} employeeId - 수신자 직원 ID
 * @property {number | null} attendanceId - 연관된 근태 ID
 * @property {number | null} payrollId - 연관된 급여 ID
 * @property {number | null} documentId - 연관된 결재 문서 ID
 * @property {number | null} evaluationId - 연관된 평가 ID
 */
export interface NotificationDTO {
  notificationId: number;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  isDeleted: boolean; 
  createdAt: string;
  readAt: string | null;
  deletedAt: string | null;      
  employeeId: number;
  attendanceId: number | null;
  payrollId: number | null;
  documentId: number | null;
  evaluationId: number | null;
}

/**
 * 프론트엔드 알림 객체
 * 
 * @description UI 렌더링용 알림 데이터 구조 (백엔드 NotificationDTO 기반)
 * @property {number} notificationId - 알림 고유 ID
 * @property {number} employeeId - 알림 수신자 직원 ID
 * @property {NotificationCategory} type - 알림 카테고리
 * @property {string} title - 알림 제목
 * @property {string} message - 알림 내용
 * @property {string | null} link - 이동할 페이지 경로 (없으면 null)
 * @property {boolean} isRead - 읽음 여부
 * @property {boolean} isDeleted - 삭제 여부
 * @property {string} createdAt - 생성 일시 
 * @property {string | null} readAt - 읽은 일시 (읽지 않았으면 null)
 * @property {string | null} deletedAt - 삭제 일시 (삭제 안 했으면 null)
 * @property {number | null} attendanceId - 관련 근태 ID
 * @property {number | null} payrollId - 관련 급여 ID
 * @property {number | null} documentId - 관련 문서 ID
 * @property {number | null} evaluationId - 관련 평가 ID
 * @property {string} timeAgo - UI 표시용 상대 시간 (방금 전, 1시간 전 등)
 */
export interface Notification {
  notificationId: number;
  employeeId: number;
  type: NotificationCategory;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  readAt: string | null;
  deletedAt: string | null;
  attendanceId: number | null;
  payrollId: number | null;
  documentId: number | null;
  evaluationId: number | null;
  timeAgo: string;
}

/**
 * 백엔드 알림 타입
 * 
 * @description 시스템에서 발생 가능한 모든 알림 타입 정의 (총 11종)
 * 
 * 근태 관련 (1종):
 * - ATTENDANCE_CHECK_IN: 출근 체크 알림
 * 
 * 결재 관련 (3종):
 * - DOCUMENT_APPROVED: 결재 승인
 * - DOCUMENT_PENDING: 결재 대기
 * - DOCUMENT_REJECTED: 결재 반려
 * 
 * 급여 관련 (2종):
 * - PAYROLL_PAID: 급여 지급
 * - PAYSLIP_GENERATED: 급여 명세서 생성
 * 
 * 평가 관련 (2종):
 * - EVALUATION_COMPLETED: 평가 완료
 * - EVALUATION_STARTED: 평가 시작
 * 
 * 기타 (3종):
 * - LEAVE_APPROVED: 휴가 승인
 * - TRAINING_NOTICE: 교육 안내
 * - SYSTEM_NOTICE: 시스템 공지
 */
export type NotificationType =
  | 'ATTENDANCE_CHECK_IN'
  | 'DOCUMENT_APPROVED'
  | 'DOCUMENT_PENDING'
  | 'DOCUMENT_REJECTED'
  | 'PAYROLL_PAID'
  | 'PAYSLIP_GENERATED'
  | 'EVALUATION_COMPLETED'
  | 'EVALUATION_STARTED'
  | 'LEAVE_APPROVED'
  | 'TRAINING_NOTICE'
  | 'SYSTEM_NOTICE';

/**
 * 프론트엔드 알림 카테고리
 * 
 * @description UI 필터링 및 그룹핑을 위한 카테고리 (총 6종)
 * 
 * - attendance: 근태 관련 알림
 * - payroll: 급여 관련 알림
 * - approval: 결재 관련 알림
 * - evaluation: 평가 관련 알림
 * - system: 시스템 공지 및 기타 알림
 */
export type NotificationCategory =
  | 'attendance'
  | 'payroll'
  | 'approval'
  | 'evaluation'
  | 'system';

/**
 * 탭 데이터
 * 
 * @description 알림 필터 탭 UI 데이터 구조
 * @property {string} id - 탭 식별자
 * @property {string} label - 탭 라벨 (화면 표시 텍스트)
 * @property {number} count - 해당 탭의 알림 개수
 */
export interface Tab {
  id: string;
  label: string;
  count: number;
}

/**
 * WebSocket 메시지
 * 
 * @description STOMP 메시지 기본 구조
 * @property {string} body - 메시지 본문 (JSON 문자열)
 */
export interface WebSocketMessage {
  body: string;
}

/**
 * STOMP 프레임
 * 
 * @description STOMP 프로토콜 프레임 구조
 * @property {string} command - STOMP 명령어 (CONNECT, SEND, SUBSCRIBE 등)
 * @property {Record<string, string>} headers - 헤더 정보
 * @property {string} body - 메시지 본문
 */
export interface StompFrame {
  command: string;
  headers: Record<string, string>;
  body: string;
}

/**
 * 알림 설정 DTO (백엔드 응답)
 * 
 * @description 백엔드 API 응답 형식 및 프론트엔드 상태 관리용 타입
 * @property {number} settingId - 설정 ID 
 * @property {number} employeeId - 직원 ID
 * @property {boolean} attendanceEnabled - 근태 알림 활성화 여부
 * @property {boolean} payrollEnabled - 급여 알림 활성화 여부
 * @property {boolean} approvalEnabled - 결재 알림 활성화 여부
 * @property {boolean} leaveEnabled - 휴가 알림 활성화 여부
 * @property {boolean} evaluationEnabled - 평가 알림 활성화 여부
 * @property {boolean} systemEnabled - 시스템 알림 활성화 여부
 * @property {boolean} browserNotification - 브라우저 푸시 알림 활성화 여부
 * @property {boolean} emailNotification - 이메일 알림 활성화 여부
 * @property {boolean} smsNotification - SMS 문자 알림 활성화 여부
 * @property {string} createdAt - 설정 생성 일시 
 * @property {string} updatedAt - 설정 수정 일시 
 */
export interface NotificationSettingsDTO {
  settingId?: number;
  employeeId: number;
  attendanceEnabled: boolean;
  payrollEnabled: boolean;
  approvalEnabled: boolean;
  leaveEnabled: boolean;
  evaluationEnabled: boolean;
  systemEnabled: boolean;
  browserNotification: boolean;
  emailNotification: boolean;
  smsNotification: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 알림 설정 항목 (UI용)
 * 
 * @description 설정 페이지에서 표시할 개별 설정 항목 정보
 * @property {keyof NotificationSettingsDTO} id - 설정 키 (NotificationSettingsDTO의 속성명)
 * @property {string} label - 설정 항목 라벨 
 * @property {string} description - 설정 항목 설명 
 * @property {string} icon - 아이콘 이미지 경로
 */
export interface NotificationSettingItem {
  id: keyof NotificationSettingsDTO;
  label: string;
  description: string;
  icon: string;
}