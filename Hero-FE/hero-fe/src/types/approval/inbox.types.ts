/**
 * <pre>
 * TypeScript Name: inbox.types.ts
 * Description: 결재 문서함 타입 정의
 *              문서함 조회 관련 타입 정의
 *
 * 주요 타입:
 * - InboxTab: 문서함 탭 구분 타입
 * - DocumentsResponseDTO: 문서함 목록 조회 응답 DTO
 * - InboxSearchParams: 문서함 조회 요청 파라미터
 *
 * History
 * 2025/12/17 (민철) 최초 작성
 * 2025/12/26 (민철) InboxTab 및 InboxSearchParams 타입 추가
 * 2025/12/29 (민철) 검색 파라미터 구조 개선
 * </pre>
 *
 * @author 민철
 * @version 3.0
 */

/**
 * 문서함 탭 타입
 * @description 문서함 탭 구분
 */
export type InboxTab = 'all' | 'que' | 'request' | 'reject' | 'ref' | 'end' | 'draft';


/**
 * 문서함 문서목록 조회 DTO
 * @description 백엔드 목록 조회 응답 DTO
 * @property {number} docId:        결재문서PK
 * @property {string} docNo:        문서번호
 * @property {string} docStatus:    결재상태
 * @property {string} category:     문서분류
 * @property {string} name:         문서서식
 * @property {string} title:        문서제목
 * @property {string} drafterDept:  부서(기안자부서)
 * @property {string} drafter:      상신자(=기안자)
 * @property {string} drafterAt:    상신일시
 */
export interface DocumentsResponseDTO {
  docId: number;
  docNo: string;
  docStatus: string;
  category: string;
  name: string;
  title: string;
  drafterDept: string;
  drafter: string;
  drafterAt: string;
};

/**
 * 문서함 조회 요청 파라미터
 * @description 문서함 목록 조회 시 사용하는 검색 조건
 * @property {number} page:         페이지 번호 (1부터 시작)
 * @property {number} size:         페이지 크기
 * @property {InboxTab} tab:        탭 구분 (all, que, request, reject, ref, end, draft)
 * @property {string} fromDate:     조회 시작일 (YYYY-MM-DD)
 * @property {string} toDate:       조회 종료일 (YYYY-MM-DD)
 * @property {string} sortBy:       검색 필드 (all, docNo, docType, name, title, dept, drafter)
 * @property {string} condition:    검색 키워드
 */
export interface InboxSearchParams {
  page?: number;
  size?: number;
  tab?: InboxTab;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  condition?: string;
};