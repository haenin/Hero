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
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

import { defineStore } from 'pinia';
import { getDocumentDetail } from '@/api/approval/approval_detail.api';
import type { ApprovalDocumentDetailResponseDTO } from '@/types/approval/approval_detail.types';

export const useApprovalDetailStore = defineStore('approvalDetail', {
    state: () => ({
        document: null as ApprovalDocumentDetailResponseDTO | null,

        loading: false,

        error: null as string | null,
    }),

    actions: {
        /**
         * 문서 상세 정보 조회
         * @param {number} docId - 문서 ID
         */
        async fetchDocument(docId: number) {
            this.loading = true;
            this.error = null;

            try {
                const data = await getDocumentDetail(docId);
                this.document = data;
            } catch (error) {
                console.error('문서 상세 조회 실패:', error);
                this.error = '문서를 불러오는데 실패했습니다.';
                this.document = null;
            } finally {
                this.loading = false;
            }
        },

        resetStore() {
            this.document = null;
            this.loading = false;
            this.error = null;
        },
    },
});