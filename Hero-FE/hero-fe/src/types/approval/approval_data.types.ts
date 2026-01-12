/**
 * <pre>
 * API Name        : approval_data.types.ts
 * Description     : 결재 문서 작성 시 UI 상에서 필요한 데이터
 *
 * 주요 타입
 * - 휴가 타입(휴가신청서)
 * - 변경할 근무제(근무변경신청서)
 * - 급여 조정 항목(급여조정신청서)
 * - 기존 기본급(급여인상신청서)
 * - 퇴직 사유(사직서)
 * - 소속부서/직급/직책/근무상태(인사발령품의서)
 *
 * History
 *   2025/12/26 - 민철 최초 작성
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

export interface VacationTypeResponseDTO {
    vacationTypeId: number;
    vacationTypeName: string;
};

export interface WorkSystemTypeResponseDTO {
    workSystemTypeId: number;
    workSystemTypeName: string;
};

export interface ResignTypeResponseDTO {
    resignTypeId: number;
    resignTypeName: string;
};

export interface BeforePayrollResponseDTO {
    beforePayroll: number;
}

export interface PersonnelTypesResponseDTO {
    departments: Department[],
    grades: Grade[],
    jobTitles: JobTitle[]
}

export interface Department {
    departmentId: number;
    departmentName: string;
}

export interface Grade {
    gradeId: number;
    grade: string;
}

export interface JobTitle {
    jobTitleId: number;
    jobTitle: string;
}
