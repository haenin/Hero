/**
 * <pre>
 * TypeScript Name: settings-approval.store.ts
 * Description: 결재 관리 스토어 모음
 *
 * 주요 composable 객체:
 * - useTemplateStore:  1. templateList에서 문서서식/문서분류를 저장하고 작성화면에 넘겨줌.
 *                      2. 설정을 저장하는 action  
 * 
 * History
 * 2025/12/14 (민철) 최초 작성
 * 2025/12/17 (민철) store 파일명 정정 및 스토어 추가
 * 2025/12/22 (민철) 설정값 저장 action 추가
 * </pre>
 *
 * @author 민철
 * @version 2.1
 */

import { defineStore } from 'pinia';
import { settingsApprovalApi } from '@/api/settings/settings-approval.api';
import type {
    SettingsApprovalResponseDTO,
    SettingsDefaultLineDTO,
    SettingsDefaultRefDTO,
    SettingsDocumentTemplateResponseDTO,
    DepartmentResponseDTO,
    SettingsApprovalRequestDTO,
} from '@/types/settings/settings-approval.types';

export const useTemplateStore = defineStore('settings-approval', {
    state: () => ({
        templateList: [] as SettingsDocumentTemplateResponseDTO[],
        departmentList: [] as DepartmentResponseDTO[],

    }),
    actions: {
        /**
         * 서식 목록 조회 Action
         */
        async fetchTemplateList() {
            try {
                const data = await settingsApprovalApi.getList();
                this.templateList = data;
            } catch (error) {
                console.error('서식 목록 조회 실패:', error);
            }
        },

        /**
         * 부서 목록 조회 Action
         */
        async fetchDepartmentList() {

            try {
                const data = await settingsApprovalApi.getDepartmentList();
                this.departmentList = data;
            } catch (error) {
                console.error('부서 목록 조회 실패:', error);
            }
        },

        /**
         * 서식별 기본 설정 조회
         */
        async fetchDefaultSettings(templateId: number) {
            try {
                const data = await settingsApprovalApi.getDefaultSettings(templateId);
                console.log('기본 설정 조회 성공:', data);
                return data;
            } catch (error) {
                console.error('기본 설정 조회 실패:', error);

            }
        },

        setDefaultSettings(templateId: number, data: SettingsApprovalRequestDTO) {
            try {
                const response = settingsApprovalApi.saveSettings(templateId, data);
                console.log('기본 설정 저장 성공:', response);
                return response;
            } catch (error) {
                console.error('기본 설정 저장 실패:', error);

            }
        }

    }
});