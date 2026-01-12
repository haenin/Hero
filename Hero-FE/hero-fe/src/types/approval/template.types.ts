/**
 * <pre>
 * TypeScript Name: template.types.ts
 * Description: template관련 객체 타입 정의
 *
 * 주요 타입:
 *
 * History
 * 2025/12/17 (민철) 최초 작성
 * 2025/12/24 (민철) 참조 DTO 수정
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

/**
 * 문서서식 목록 조회 응답 DTO
 * @description 백엔드 문서 서식 응답 DTO
 * @property {number} templateId
 * @property {string} templateName
 * @property {string} templateKey
 * @property {string} category
 * @property {string} description
 * @property {boolean} bookmarking
 * 
 */
export interface ApprovalTemplateResponseDTO {
    templateId: number;
    templateName: string;
    templateKey: string;
    category: string;
    description: string;
    bookmarking: boolean;
};

export interface ApprovalTemplateDetailResponseDTO {
    templateId: number;
    templateName: string;
    templateKey: string;
    category: string;
    lines: ApprovalDefaultLineDTO[];
    references: ApprovalDefaultReferenceDTO[];
};

// 해당 
export interface ApprovalDefaultLineDTO {
    approverId: number;
    approverName: string;
    departmentId: number;
    departmentName: string;
    gradeName: string;
    jobTitleName: string;
    seq: number;
};

export interface ApprovalDefaultReferenceDTO {
    referencerId: number;
    referencerName: string;
    departmentId: number;
    departmentName: string;
    gradeName: string;
    jobTitleName: string;
};