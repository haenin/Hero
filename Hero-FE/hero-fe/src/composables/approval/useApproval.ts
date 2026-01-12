/**
 * <pre>
 * TypeScript Name: useApproval.ts
 * Description: 결재 관련 Composables
 *
 * History
 * 2025/12/14 (민철) 최초 작성
 * 2025/12/17 (민철) useInboxList 구현
 * 2026/01/06 (민철) 주석제거
 * 
 * </pre>
 * * @author 민철
 * @version 1.1
*/
import { storeToRefs } from 'pinia';
import { useApprovalDocumentsStore } from "@/stores/approval/approval.store";
import { onMounted } from 'vue';

export const useInboxList = () => {

    const store = useApprovalDocumentsStore();

    const {
        documents,
        page,
        size,
        totalPages,
        totalElements,
        loading
    } = storeToRefs(store);

    const fetchList = async () => {
        await store.fetchDocuments();
    };

    const handlePageChange = (newPage: number) => {
        store.changePage(newPage);
    };

    const handleSearch = (condition: any) => {
        store.updateSearch(condition);
    };

    onMounted(() => {
        fetchList();
    });

    return {
        documents,
        page,
        size,
        totalPages,
        totalElements,
        loading,
        fetchList,
        handlePageChange,
        handleSearch,
    };
};