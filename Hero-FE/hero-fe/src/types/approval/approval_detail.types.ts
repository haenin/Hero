/**
 * <pre>
 * TypeScript Name: approval_detail_types.ts
 * Description: 결재 문서 상세 조회 타입 정의
 *
 * 주요 타입:
 * - ApprovalDocumentDetailResponseDTO: 문서 상세 조회 응답 DTO
 * - ApprovalLineResponseDTO: 결재선 정보
 * - ApprovalReferenceResponseDTO: 참조자 정보
 *
 * History
 * 2025/12/26 (민철) 최초 작성
 * 2026/01/01 (민철) downloadUrl 필드 추가
 * </pre>
 *
 * @author 민철
 * @version 1.1
 */

/**
 * 결재선 응답 DTO
 * @description 문서의 결재선 정보
 */
export interface ApprovalLineResponseDTO {
    lineId: number;
    approverId: number;
    approverName: string;
    departmentName: string;
    gradeName: string;
    jobTitleName: string;
    seq: number;
    status: string;
    approvedAt: string | null;
    comment: string | null;
}

/**
 * 참조자 응답 DTO
 * @description 문서의 참조자 정보
 */
export interface ApprovalReferenceResponseDTO {
    referenceId: number;
    referencerId: number;
    referencerName: string;
    departmentName: string;
    gradeName: string;
    jobTitleName: string;
}

/**
 * 첨부파일 응답 DTO
 * @description 문서의 첨부파일 정보
 */
export interface ApprovalAttachmentResponseDTO {
    attachmentId: number;
    originalFilename: string;
    storedFilename: string;
    fileSize: number;
    fileUrl: string;
    uploadedAt: string;
    downloadUrl?: string;  // S3 Presigned URL (7일 유효)
}

/**
 * 문서 상세 조회 응답 DTO
 * @description 결재 문서의 전체 상세 정보
 */
export interface ApprovalDocumentDetailResponseDTO {
    docId: number;
    docNo: string;
    docStatus: string;
    templateId: number;
    templateName: string;
    templateKey: string;
    category: string;
    title: string;
    drafterId: number;
    drafter: string;
    drafterDept: string;
    drafterGrade: string;
    draftDate: string;
    submittedAt: string | null;
    completedAt: string | null;
    details: string;
    lines: ApprovalLineResponseDTO[];
    references: ApprovalReferenceResponseDTO[];
    attachments: ApprovalAttachmentResponseDTO[];
}