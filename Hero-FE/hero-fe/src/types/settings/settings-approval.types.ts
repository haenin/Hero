/**
 * TypeScript Name : settings.types.ts
 * Description : 설정 기능 관련 데이터 타입 정의 (인터페이스)
 *               
 *
 * History
 * 2025/12/20 (민철) 기본결재선/참조목록 저장/수정 요청 데이터 타입 정의
 * 2025/12/22 (민철)
 *
 * @module settings
 * @author 민철
 * @version 1.1
 */

/**
 * 결재 관리 페이지 서식목록 DTO
 * @description 결재 관리 탭에서 조회될 서식목록
 * @property {Integer} templateId   서식ID
 * @property {string} templateName  서식이름
 * @property {string} templateKey   서식키
 * @property {string} category      서식분류
 * @property {string} description   서식설명
 * @property {Integer} steps        서식결재단계
 * 
 */
export interface SettingsDocumentTemplateResponseDTO {
    templateId: number;
    templateName: string;
    templateKey: string;
    category: string;
    description: string;
    steps: number;
}

/**
 * 부서 목록 응답 DTO
 * @description 결재단계 상에서 드롭다운 옵션 부서목록
 * @property {Integer} departmentId     부서ID
 * @property {string} departmentName    부서명
 * 
 */
export interface DepartmentResponseDTO {
    departmentId: number;
    departmentName: string;
}


/**
 * 기본 결재 설정 DTO
 * @description 각 단계에 해당하는 설정값
 * @property {number} seq           결재단계
 * @property {string} targetType    결재자기준
 * @property {number} departmentId  결재자부서(0일경우 기안자직속부서장/아닐경우 특정부서장)
 * @property {number} approverId    결재자지정(추후 확장)
 * 
 */
export interface SettingsDefaultLineDTO {
    seq: number;
    targetType: string;
    departmentId: number | null;
    approverId: number | null;
}

/**
 * 기본 참조 설정 DTO
 * @description 각 참조에 해당하는 설정값
 * @property {string} targetType    참조자기준
 * @property {number} departmentId  참조자부서(0일경우 기안자직속부서장/아닐경우 특정부서장)
 * @property {number} referenceId   참조자지정(추후 확장)
 * 
 */
export interface SettingsDefaultRefDTO {
    targetType: string;
    departmentId: number | null;
    // referenceId: number | null;
}

/**
 * 서식별 기본 결재선/참조목록 응답 DTO
 * @description 각 서식에 대응하는 기본 설정값
 * @property {SettingsDefaultLineDTO} lines     기본결재선
 * @property {SettingsDefaultRefDTO} references 기본참조목록
 */
export interface SettingsApprovalResponseDTO {
    lines: SettingsDefaultLineDTO[];
    references: SettingsDefaultRefDTO[];
}

/**
 * 서식별 설정값 저장 데이터
 */
export interface SettingsApprovalRequestDTO {
    lines: SettingsDefaultLineDTO[];
    references: SettingsDefaultRefDTO[];
}