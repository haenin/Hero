/**
 * <pre>
 * TypeScript Name : vacation-history.types.ts
 * Description     : 휴가 이력(VacationHistory) 도메인 타입 정의
 *                   - 개인 휴가 이력 DTO
 *                   - 휴가 이력 스토어 상태 타입
 *
 * History
 *   2026/01/01 (이지윤) 휴가 이력 타입 최초 작성
 * </pre>
 *
 * @author 이지윤
 * @version 1.0
 */

/**
 * 휴가 이력 한 건에 대한 DTO
 * - 백엔드 VacationHistoryDTO 와 필드명을 매칭
 */
export interface VacationHistoryDTO {
  /** 휴가 시작일 (yyyy-MM-dd) */
  startDate: string;

  /** 휴가 종료일 (yyyy-MM-dd) */
  endDate: string;

  /** 휴가 종류명 (연차 / 반차 / 병가 등) */
  vacationTypeName: string;

  /** 휴가 사유 */
  reason: string;

  /** 승인 상태 (예: APPROVED / REJECTED / PENDING 등) */
  approvalStatus: string;
}

/**
 * 휴가 이력(VacationHistory) 스토어 상태 타입
 * - 리스트 + 페이지네이션 + 기간/직원 필터 + 로딩 상태 관리
 */
export interface VacationHistoryState {
  /** 휴가 이력 목록 */
  vacationList: VacationHistoryDTO[];

  /** 현재 페이지 번호 (1 기반) */
  currentPage: number;

  /** 페이지당 조회 건수 */
  pageSize: number;

  /** 전체 페이지 수 */
  totalPages: number;

  /** 전체 데이터 건수 */
  totalCount: number;

  /** 검색 기간 시작일 (yyyy-MM-dd, 없으면 빈 문자열) */
  startDate: string;

  /** 검색 기간 종료일 (yyyy-MM-dd, 없으면 빈 문자열) */
  endDate: string;

  /** 조회 대상 직원 ID (로그인 연동 전 임시 필터용, 없으면 null) */
  employeeId: number | null;

  /** 조회 중 여부 */
  loading: boolean;
}
