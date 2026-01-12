/**
 * <pre>
 * TypeScript Name: inbox.store.ts
 * Description: 결재 문서함 스토어
 *
 * 주요 composable 객체:
 * - useInboxStore: 문서함 문서 목록 조회 및 탭 관리, 검색 기능
 * 
 * History
 * 2025/12/26 (민철) 최초 작성
 * 2025/12/29 (민철) 전체 검색 기능 개선
 * </pre>
 *
 * @author 민철
 * @version 2.0
 */

import { defineStore } from 'pinia';
import { getInboxDocuments } from '@/api/approval/inbox.api';
import type {
  DocumentsResponseDTO,
  InboxTab,
  InboxSearchParams
} from '@/types/approval/inbox.types';

export const useInboxStore = defineStore('inbox', {
  state: () => ({
    // 문서 목록
    documents: [] as DocumentsResponseDTO[],

    // 페이징 정보
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,

    // 현재 활성 탭
    activeTab: 'all' as InboxTab,

    // 검색 조건
    searchParams: {
      fromDate: '',
      toDate: '',
      sortBy: 'all',
      condition: '',
    } as Omit<InboxSearchParams, 'page' | 'size' | 'tab'>,

    // 로딩 상태
    loading: false,
  }),

  actions: {
    /**
     * 문서 목록 조회 (기본 최신순 정렬)
     */
    async fetchDocuments() {
      this.loading = true;

      try {
        const params: InboxSearchParams = {
          page: this.page + 1, // 백엔드는 1부터 시작
          size: this.size,
          tab: this.activeTab,
          ...this.searchParams,
        };

        const response = await getInboxDocuments(params);

        this.documents = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements ?? 0;
      } catch (error) {
        console.error('문서함 조회 실패:', error);
        this.documents = [];
        this.totalPages = 0;
        this.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 탭 변경
     * @param {InboxTab} tab - 변경할 탭
     */
    changeTab(tab: InboxTab) {
      this.activeTab = tab;
      this.page = 0;
      this.fetchDocuments();
    },

    /**
     * 페이지 변경
     * @param {number} page - 변경할 페이지 (0부터 시작)
     */
    changePage(page: number) {
      this.page = page;
      this.fetchDocuments();
    },

    /**
     * 검색 조건 업데이트
     * @param {Partial<InboxSearchParams>} params - 업데이트할 검색 조건
     */
    updateSearchParams(params: Partial<Omit<InboxSearchParams, 'page' | 'size' | 'tab'>>) {
      this.searchParams = { ...this.searchParams, ...params };
      this.page = 0;
      this.fetchDocuments();
    },

    /**
     * 스토어 초기화
     */
    resetStore() {
      this.documents = [];
      this.page = 0;
      this.totalPages = 0;
      this.totalElements = 0;
      this.activeTab = 'all';
      this.searchParams = {
        fromDate: '',
        toDate: '',
        sortBy: 'all',
        condition: '',
      };
    },
  },
});