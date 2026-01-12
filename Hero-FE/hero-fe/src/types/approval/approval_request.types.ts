/**
 * <pre>
 * TypeScript Name: approval_request.types.ts
 * Description: 결재 문서 작성/상신 관련 타입 정의
 *
 * 주요 타입:
 *   - ApprovalDocumentRequestDTO: 문서 작성/상신 요청 DTO
 *   - ApprovalLineRequestDTO: 결재선 요청 DTO
 *   - ApprovalReferenceRequestDTO: 참조자 요청 DTO
 *   - ApprovalDocumentResponseDTO: 문서 응답 DTO
 *
 * History
 *   2025/12/26 - 민철 최초 작성
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

/**
 * 결재 문서 작성/상신 요청 DTO
 */
export interface ApprovalDocumentRequestDTO {
    formType: string;              // 서식 타입 ('vacation', 'overtime' 등)
    documentType: string;          // 문서 분류 ('인사', '근태' 등)
    title: string;                 // 문서 제목
    drafter: string;               // 기안자명
    department: string;            // 기안 부서
    grade: string;                 // 기안자 직급
    draftDate: string;             // 기안일 (yyyy-MM-dd)
    status: 'draft' | 'submitted'; // 문서 상태
    submittedAt: string | null;    // 상신일시 (ISO 8601)
    lines: ApprovalLineRequestDTO[];
    references: ApprovalReferenceRequestDTO[];
    details: string;               // 서식별 상세 데이터 (JSON 문자열)
}

/**
 * 결재선 요청 DTO
 */
export interface ApprovalLineRequestDTO {
    approverId: number;
    approverName: string;
    departmentId: number;
    departmentName: string;
    gradeName: string;
    jobTitleName: string;
    seq: number;
}

/**
 * 참조자 요청 DTO
 */
export interface ApprovalReferenceRequestDTO {
    referencerId: number;
    referencerName: string;
    departmentId: number;
    departmentName: string;
    gradeName: string;
    jobTitleName: string;
}

/**
 * 결재 문서 응답 DTO
 */
export interface ApprovalDocumentResponseDTO {
    documentId: number;
    documentNumber: string;
    title: string;
    status: string;
    createdAt: string;
    submittedAt: string | null;
    message?: string;
}