/**
 * <pre>
 * TypeScript Name: approval.store.ts
 * Description: 결재관련 스토어 모음
 *
 * 주요 composable 객체:
 * - useTemplateStore: templateList에서 문서서식/문서분류를 저장하고 작성화면에 넘겨줌.
 * - useApprovalDocumentsStore: 문서함 내 조회될 데이터를 저장하고 fetch하여 promise객체를 통해 상태를 저장할 스토어
 * 
 * History
 * 2025/12/14 (민철) 최초 작성
 * 2025/12/17 (민철) store 파일명 정정 및 스토어 추가
 * </pre>
 *
 * @author 민철
 * @version 2.0
 */

import { defineStore } from 'pinia';
import {
    approvalDocumentApi,
    approvalTemplateApi,
} from '@/api/approval/approval.api';
import type { DocumentsResponseDTO } from '@/types/approval/inbox.types';
import type { SearchCondition } from '@/types/common/pagination.types';
import {
    ApprovalDefaultReferenceDTO,
    ApprovalDefaultLineDTO,
    ApprovalTemplateResponseDTO,
    ApprovalTemplateDetailResponseDTO,
} from '@/types/approval/template.types';


export const useApprovalTemplateStore = defineStore('approvalTemplate', {
    state: () => ({
        templates: [] as ApprovalTemplateResponseDTO[],
        template: {} as ApprovalTemplateDetailResponseDTO,
        isBookmarked: false,
    }),

    actions: {
        async fetchTemplates() {
            try {
                const data = await approvalTemplateApi.getTemplates();
                this.templates = data;
                return data;
            } catch (error) {
                console.error('서식 목록 조회 실패:', error);
            }
        },

        async fetchTemplate(templateId: number) {
            try {
                const data = await approvalTemplateApi.getTemplate(templateId);
                this.template = data;
            } catch (error) {
                console.error('서식 상세 조회 실패:', error);
            }
        },

        async toggleBookmark(templateId: number) {
            try {
                const data = await approvalTemplateApi.toggleBookmark(templateId);
                this.isBookmarked = data;
            } catch (error) {
                console.error('즐겨찾기 변경 실패:', error);
                alert('즐겨찾기 변경 실패');
            }
        },
    }
});


export const useApprovalDocumentsStore = defineStore('approvalDocuments', {
    state: () => ({
        documents: [] as DocumentsResponseDTO[],
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0,

        search: {
            condition: '',
            sortBy: '',
            fromDate: '',
            toDate: '',
        } as SearchCondition,

        loading: false,
    }),

    actions: {
        async fetchDocuments() {
            this.loading = true;

            try {
                const { data } = await approvalDocumentApi.getList({
                    page: this.page,
                    size: this.size,
                    ...this.search,
                });

                this.documents = data.content;
                this.totalPages = data.totalPages;
                this.totalElements = data.totalElements ?? 0;
            } finally {
                this.loading = false;
            }
        },

        changePage(page: number) {
            this.page = page;
            this.fetchDocuments();
        },

        updateSearch(search: SearchCondition) {
            this.search = { ...this.search, ...search };
            this.page = 0;
            this.fetchDocuments();
        },
    },
});

