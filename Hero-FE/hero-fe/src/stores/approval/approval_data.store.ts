/**
 * <pre>
 * TypeScript Name: approval_detail_store.ts
 * Description: 결재 문서 상세 조회 스토어
 *
 * 주요 composable 객체:
 * - useApprovalDetailStore: 문서 상세 정보 조회 및 관리
 * 
 * History
 * 2025/12/26 (민철) 최초 작성
 * 2025/12/31 (민철) 부서/직급/직책 목록 조회 스토어함수 작성
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */
import { defineStore } from 'pinia';
import {
    getVacationType,
    getWorkSystemType,
    getResignType,
    getPayroll,
    getPersonnelTypes,
} from '@/api/approval/approval_data.api';
import type {
    VacationTypeResponseDTO,
    WorkSystemTypeResponseDTO,
    ResignTypeResponseDTO,
    BeforePayrollResponseDTO,
    PersonnelTypesResponseDTO,

} from '@/types/approval/approval_data.types';

export const useApprovalDataStore = defineStore('approvalData', {
    state: () => ({
        vacationTypes: [] as VacationTypeResponseDTO[],
        workSystemTypes: [] as WorkSystemTypeResponseDTO[],
        resignTypes: [] as ResignTypeResponseDTO[],
        payroll: {} as BeforePayrollResponseDTO,
        personnelTypes: {} as PersonnelTypesResponseDTO,

    }),

    actions: {
        async fetchVacationTypes() {
            try {
                const data = await getVacationType();
                this.vacationTypes = data;
            } catch (error) {
                console.error('휴가 타입 조회 실패:', error);
            }
        },

        async fetchWorkSystemTypes() {
            try {
                const data = await getWorkSystemType();
                this.workSystemTypes = data;
            } catch (error) {
                console.error('근무제 템플릿 조회 실패:', error);
            }
        },

        async fetchResignTypes() {
            try {
                const data = await getResignType();
                this.resignTypes = data;
            } catch (error) {
                console.error('퇴직 사유 조회 실패:', error);
            }
        },

        async fetchPayroll() {
            try {
                const data = await getPayroll();
                this.payroll = data;
            } catch (error) {
                console.error('기존 기본급 조회 실패:', error);
            }
        },

        async fetchPersonnelTypes() {
            try {
                const data = await getPersonnelTypes();
                this.personnelTypes = data;
            } catch (error) {
                console.error('소속부서/직급/직책/근무상태 조회 실패:', error);
            }
        },

    },

});