/**
 * <pre>
 * Composable Name : useApprovalDetail.ts
 * Description     : 결재 문서 상세 조회 비즈니스 로직 composable
 *
 * 주요 함수:
 * - useApprovalDetail: 문서 상세 조회 관련 상태 및 액션 제공
 *
 * History
 * 2025/12/26 (민철) 최초 작성
 * 2026/01/06 (민철) 주석제거
 * </pre>
 *
 * @author 민철
 * @version 1.1
 */

import { computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useApprovalDetailStore } from '@/stores/approval/approval_detail.store';

/**
 * 문서 상세 조회 composable
 * @description 문서 상세 조회 관련 상태 및 액션을 제공함
 * @param {number} docId - 조회할 문서 ID
 */
export const useApprovalDetail = (docId: number) => {
    const detailStore = useApprovalDetailStore();

    const { document, loading, error } = storeToRefs(detailStore);

    const { fetchDocument, resetStore } = detailStore;

    const documentDetail = computed(() => document.value);

    const parsedDetails = computed(() => {
        if (!document.value?.details) return null;
        try {
            return JSON.parse(document.value.details);
        } catch (e) {
            console.error('details 파싱 실패:', e);
            return null;
        }
    });

    onMounted(() => {
        fetchDocument(docId);
    });

    onUnmounted(() => {
        resetStore();
    });

    return {
        document: documentDetail,
        parsedDetails,
        loading,
        error,

        fetchDocument,
        resetStore,
    };
};