/**
 * <pre>
 * Composable Name : useApprovalDocument.ts
 * Description     : 결재 문서 작성/상신 로직 (실제 필드명 반영)
 *
 * 주요 기능
 *   - 문서 유효성 검사 (각 서식별 실제 필드 반영)
 *   - 임시저장
 *   - 상신
 *
 * History
 * 2025/12/26 (민철) 최초 작성
 * 2025/12/27 (민철) 실제 필드명 반영 및 유효성 검사 강화
 * 2025/12/31 (민철) 임시저장 수정
 * 2026/01/06 (민철) 주석제거
 *
 * </pre>
 *
 * @author 민철
 * @version 2.2
 */

import {
    saveDraft as apiSaveDraft,
    submitDocument as apiSubmitDocument,
    updateDraft as apiUpdateDraft,
    submitDraftDocument as apiSubmitDraftDocument,
    cancelDocument as apiCancelDocument,
    deleteDocument as apiDeleteDocument

} from '@/api/approval/approval_request.api';
import {
    ApprovalDocumentRequestDTO,
    ApprovalDocumentResponseDTO
} from '@/types/approval/approval_request.types';

export function useApprovalDocument() {


    const validateCommon = (data: ApprovalDocumentRequestDTO): boolean => {
        if (!data.title || data.title.trim() === '') {
            alert('제목을 입력하세요.');
            return false;
        }

        if (!data.lines || data.lines.length === 0) {
            alert('결재선을 지정하세요.');
            return false;
        }

        return true;
    };

    const validateVacation = (details: any): boolean => {
        if (!details.vacationType) {
            alert('휴가 종류를 선택하세요.');
            return false;
        }
        if (!details.startDate || !details.endDate) {
            alert('휴가 기간을 선택하세요.');
            return false;
        }
        return true;
    };

    const validateOvertime = (details: any): boolean => {
        if (!details.workDate) {
            alert('근무 날짜를 선택하세요.');
            return false;
        }
        if (!details.startTime || !details.endTime) {
            alert('근무 시간을 입력하세요.');
            return false;
        }
        if (!details.reason) {
            alert('사유를 입력하세요.');
            return false;
        }
        return true;
    };

    const validateWorkChange = (details: any): boolean => {
        if (!details.workSystemTemplate) {
            alert('근무제 템플릿을 선택하세요.');
            return false;
        }
        if (!details.applyDate) {
            alert('적용 날짜를 선택하세요.');
            return false;
        }
        if (!details.startTime || !details.endTime) {
            alert('근무 시간을 입력하세요.');
            return false;
        }
        if (!details.reason) {
            alert('변경 사유를 입력하세요.');
            return false;
        }
        return true;
    };

    const validateAttendanceFix = (details: any): boolean => {
        if (!details.targetDate) {
            alert('수정 대상 날짜를 선택하세요.');
            return false;
        }
        if (!details.correctedStart || !details.correctedEnd) {
            alert('수정 시간을 입력하세요.');
            return false;
        }
        if (!details.reason || details.reason.trim() === '') {
            alert('수정 사유를 입력하세요.');
            return false;
        }
        return true;
    };

    const validateAppointment = (details: any): boolean => {
        if (!details.changeType) {
            alert('발령 유형을 선택하세요.');
            return false;
        }
        if (!details.effectiveDate) {
            alert('발령 효력 발생일을 선택하세요.');
            return false;
        }
        if (!details.employeeNumber) {
            alert('대상 사원을 선택하세요.');
            return false;
        }
        return true;
    };

    const validateResign = (details: any): boolean => {
        if (!details.hireDate) {
            alert('입사일을 선택하세요.');
            return false;
        }
        if (!details.terminationDate) {
            alert('퇴직일을 선택하세요.');
            return false;
        }
        if (!details.terminateReason) {
            alert('퇴직 사유를 선택하세요.');
            return false;
        }
        return true;
    };

    const validatePayrollRaise = (details: any): boolean => {
        if (!details.afterSalary || details.afterSalary <= 0) {
            alert('인상 후 급여를 입력하세요.');
            return false;
        }
        if (details.afterSalary <= details.beforeSalary) {
            alert('인상 후 급여는 현재 급여보다 커야 합니다.');
            return false;
        }
        return true;
    };

    const validatePayrollAdjust = (details: any): boolean => {
        if (!details.adjustmentAmount || details.adjustmentAmount <= 0) {
            alert('조정 후 금액을 입력하세요.');
            return false;
        }
        if (!details.reason) {
            alert('조정 사유를 입력하세요.');
            return false;
        }
        return true;
    };

    const validatePromotion = (details: any): boolean => {
        if (!details.nominationDeadlineAt) {
            alert("추천 마감일을 선택해주세요.");
            return false;
        }
        if (!details.appointmentAt) {
            alert("발령 예정일을 선택해주세요.");
            return false;
        }
        if (!details.planContent || !details.planContent.trim()) {
            alert("계획 상세 내용을 입력해주세요.");
            return false;
        }

        if (details.nominationDeadlineAt >= details.appointmentAt) {
            alert("추천 마감일은 발령 예정일보다 이전이어야 합니다.");
            return false;
        }

        if (!details.detailPlan || !Array.isArray(details.detailPlan) || details.detailPlan.length === 0) {
            alert("최소 1개 이상의 승진 계획(행)을 추가해주세요.");
            return false;
        }

        for (let i = 0; i < details.detailPlan.length; i++) {
            const row = details.detailPlan[i];
            const rowNum = i + 1;

            if (!row.departmentId) {
                alert(`${rowNum}번째 행의 '대상 부서'를 선택해주세요.`);
                return false;
            }

            if (!row.gradeId) {
                alert(`${rowNum}번째 행의 '승진 후 직급'을 선택해주세요.`);
                return false;
            }

            if (!row.quotaCount || row.quotaCount <= 0) {
                alert(`${rowNum}번째 행의 '대상 수'를 1명 이상 입력해주세요.`);
                return false;
            }
        }

        return true;
    };

    const validateByFormType = (formType: string, details: any): boolean => {
        switch (formType) {
            case 'vacation':
                return validateVacation(details);

            case 'overtime':
                return validateOvertime(details);

            case 'changework':
                return validateWorkChange(details);

            case 'modifyworkrecord':
                return validateAttendanceFix(details);

            case 'personnelappointment':
                return validateAppointment(details);

            case 'promotionplan':

                return validatePromotion(details);

            case 'resign':
                return validateResign(details);

            case 'raisepayroll':
                return validatePayrollRaise(details);

            case 'modifypayroll':
                return validatePayrollAdjust(details);

            default:
                console.warn('알 수 없는 서식 타입:', formType);
                return true;
        }
    };

    const validateDocument = (
        data: ApprovalDocumentRequestDTO,
        formType: string
    ): boolean => {
        if (!validateCommon(data)) {
            return false;
        }

        try {
            const details = JSON.parse(data.details);
            return validateByFormType(formType, details);
        } catch (error) {
            console.error('details JSON 파싱 실패:', error);
            alert('문서 데이터가 올바르지 않습니다.');
            return false;
        }
    };

    const saveDraft = async (
        data: ApprovalDocumentRequestDTO,
        files?: File[]
    ): Promise<ApprovalDocumentResponseDTO | null> => {
        try {
            const response = await apiSaveDraft(data, files);
            alert('임시저장되었습니다.');
            return response;
        } catch (error) {
            console.error('임시저장 실패:', error);
            alert('임시저장에 실패했습니다.');
            throw error;
        }
    };

    const updateDraft = async (
        docId: number,
        data: ApprovalDocumentRequestDTO,
        files?: File[]
    ): Promise<ApprovalDocumentResponseDTO | null> => {
        try {
            const response = await apiUpdateDraft(docId, data, files);
            alert('저장되었습니다.');
            return response;
        } catch (error) {
            console.error('저장 실패:', error);
            alert('저장에 실패했습니다.');
            throw error;
        }
    };

    /**
     * 임시저장 문서를 상신으로 변경
     */
    const submitDraft = async (
        docId: number,
        data: ApprovalDocumentRequestDTO,
        files: File[] | undefined,
        formType: string
    ): Promise<ApprovalDocumentResponseDTO | null> => {
        // 유효성 검사
        if (!validateDocument(data, formType)) {
            return null;
        }

        try {
            const response = await apiSubmitDraftDocument(docId, data, files);
            alert('상신되었습니다.');
            return response;
        } catch (error) {
            console.error('상신 실패:', error);
            alert('상신에 실패했습니다.');
            throw error;
        }
    };

    /* ========================================== */
    /* 상신 */
    /* ========================================== */

    /**
     * 상신
     */
    const submit = async (
        data: ApprovalDocumentRequestDTO,
        files: File[] | undefined,
        formType: string
    ): Promise<ApprovalDocumentResponseDTO | null> => {
        // 유효성 검사
        if (!validateDocument(data, formType)) {
            return null;
        }

        try {
            const response = await apiSubmitDocument(data, files);
            alert('상신되었습니다.');
            return response;
        } catch (error) {
            console.error('상신 실패:', error);
            alert('상신에 실패했습니다.');
            throw error;
        }
    };

    const cancelDocument = async (docId: number) => {
        try {
            const response = await apiCancelDocument(docId);
            alert(`${response}`);
            return response;
        } catch (error) {
            console.error('회수 실패:', error);
            alert('회수에 실패했습니다.');
            throw error;
        }
    };

    const deleteDocument = async (docId: number) => {
        try {
            const response = await apiDeleteDocument(docId);
            alert(`${response}`);
            return response;
        } catch (error) {
            console.error('삭제 실패:', error);
            alert('삭제에 실패했습니다.');
            throw error;
        }
    };
    /* ========================================== */
    /* Return */
    /* ========================================== */

    return {
        validateDocument,
        saveDraft,
        updateDraft,
        submitDraft,
        submit,
        cancelDocument,
        deleteDocument,
    };
};