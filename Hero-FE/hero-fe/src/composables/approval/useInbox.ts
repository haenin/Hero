/**
 * <pre>
 * Composable Name : useInbox.ts
 * Description     : 결재 문서함 비즈니스 로직 composable
 *
 * 주요 함수:
 * - useInbox: 문서함 관련 상태 및 액션 제공
 *
 * History
 * 2025/12/26 (민철) 최초 작성
 * 2025/12/29 (민철) 검색 기능 개선
 * 2026/01/06 (민철) 주석제거
 * </pre>
 *
 * @author 민철
 * @version 2.1
 */

import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useInboxStore } from '@/stores/approval/inbox.store';
import type { InboxTab } from '@/types/approval/inbox.types';

/**
 * 문서함 composable
 * @description 문서함 관련 상태 및 액션을 제공함
 */
export const useInbox = () => {
    const inboxStore = useInboxStore();

    const {
        documents,
        page,
        size,
        totalPages,
        totalElements,
        activeTab,
        searchParams,
        loading,
    } = storeToRefs(inboxStore);

    const {
        fetchDocuments,
        changeTab,
        changePage,
        updateSearchParams,
        resetStore
    } = inboxStore;

    const handlePageChange = (newPage: number) => {
        if (newPage < 0 || newPage >= totalPages.value) {
            return;
        }
        changePage(newPage);
    };

    const handleTabClick = (tab: InboxTab) => {
        changeTab(tab);
    };

    const handleSearch = (params: {
        fromDate?: string;
        toDate?: string;
        sortBy?: string;
        condition?: string;
    }) => {
        updateSearchParams(params);
    };

    onMounted(() => {
        fetchDocuments();
    });

    return {
        documents,
        page,
        size,
        totalPages,
        totalElements,
        activeTab,
        searchParams,
        loading,

        fetchDocuments,
        handleTabClick,
        handlePageChange,
        handleSearch,
        resetStore,
    };
};