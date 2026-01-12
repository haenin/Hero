/**
 * <pre>
 * TypeScript Name : attendance.types.ts
 * Description     : 근태(Attendance) 도메인 타입 정의 모음
 *                   - 개인 근태 이력 DTO
 *                   - 선택된 근태 행 DTO
 *                   - 근태 스토어 상태 타입
 *
 * History
 *   2026/01/01 (이지윤) 근태 도메인 타입 최초 작성
 * </pre>
 *
 * @author 이지윤
 * @version 1.0
 */

/**
 * 개인 근태 이력 DTO
 * - 개인 근태 조회(AttendancePersonal) 테이블 한 행에 매핑
 */
export interface PersonalDTO {
  /** 근태 ID (PK) */
  attendanceId: number;
  /** 근무 일자 (yyyy-MM-dd 문자열) */
  workDate: string;
  /** 근태 상태(정상/지각/결근/조퇴 등) */
  state: string;
  /** 출근 시각 (HH:mm:ss) */
  startTime: string;
  /** 퇴근 시각 (HH:mm:ss) */
  endTime: string;
  /** 총 근무 시간 (예: 시간 단위 숫자) */
  workDuration: number;
  /** 근무제 이름 (예: 기본 근무제 / 시차 출퇴근제 등) */
  workSystemName: string;
}

/**
 * 개인 근태 화면에서 선택된 행 정보
 * - 근태 정정/초과 근무 신청 등 다음 단계 화면으로 넘길 최소 정보
 */
export interface SelectedAttendanceRow {
  /** 근태 ID (PK) */
  attendanceId: number;
  /** 근무 일자 (yyyy-MM-dd) */
  workDate: string;
  /** 출근 시각 (HH:mm:ss) */
  startTime: string;
  /** 퇴근 시각 (HH:mm:ss) */
  endTime: string;
}

/**
 * 근태(Attendance) 스토어 상태 타입
 * - 개인 근태 이력 + 기간 필터 + 상단 요약 카드 + 선택 행 상태 관리
 */
export interface AttendanceState {
  /* =========================
     리스트 / 페이징
     ========================= */

  /** 개인 근태 이력 목록 */
  personalList: PersonalDTO[];
  /** 현재 페이지 번호 (1 기반) */
  currentPage: number;
  /** 페이지당 조회 건수 */
  pageSize: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 전체 데이터 개수 */
  totalCount: number;
  /** API 호출 로딩 상태 */
  loading: boolean;

  /* =========================
     기간 필터
     ========================= */

  /** 조회 시작일 (yyyy-MM-dd, 없으면 빈 문자열) */
  startDate: string;
  /** 조회 종료일 (yyyy-MM-dd, 없으면 빈 문자열) */
  endDate: string;

  /* =========================
     상단 요약 카드
     ========================= */

  /** 이번 달 근무일 수 */
  workDays: number;
  /** 오늘 근무제 이름 */
  todayWorkSystemName: string;
  /** 이번 달 지각 횟수 */
  lateCount: number;
  /** 이번 달 결근 횟수 */
  absentCount: number;
  /** 이번 달 조퇴 횟수 */
  earlyCount: number;

  /* =========================
     선택된 행
     ========================= */

  /** 테이블에서 선택한 근태 행 정보 (없으면 null) */
  selectedRow: SelectedAttendanceRow | null;
}