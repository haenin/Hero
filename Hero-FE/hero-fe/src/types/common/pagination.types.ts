/**
 * <pre>
 * File Name: pagination.types.ts
 * Description: 페이지 응답 객체
 *
 * 주요 타입:
 * - PageResponse<T>
 *
 * History
 * 2025/12/17 (민철) 최초 작성
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalPages: number;
    totalElements?: number;
}

export interface SearchCondition {
    condition?: string;
    sortBy?: string;
    fromDate?: string;
    toDate?: string;
}