/**
 * TypeScript Name : payrollAdjustment.store.ts
 * Description     : 급여 조정(관리자) 결재 문서함 조회 및 상태 관리를 위한 Store
 *                   전자결재 문서 목록을 급여 조정 도메인 데이터로 변환/보강(hydrate)한다.
 *
 * History
 *  2025/12/31 - 동근 최초 작성
 *
 * @module payroll-adjustment-store
 * @author 동근
 * @version 1.0
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { getInboxDocuments } from '@/api/approval/inbox.api';
import { getDocumentDetail } from '@/api/approval/approval_detail.api';
import type { DocumentsResponseDTO, InboxSearchParams } from '@/types/approval/inbox.types';
import type {
    AdjustmentStatus,
    ApprovalAdjustmentRow,
    ApprovalAdjustmentQuery,
    ModifyPayrollDetails,
} from '@/types/payroll/payroll-adjustment.types';
import { ADJUST_FORM_NAME } from '@/types/payroll/payroll-adjustment.types';

type StoreError = { message: string; code?: string };

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null;
}

/**
/**
 * API/런타임 에러 객체에서 메시지를 안전하게 추출
 *
 * @param e 에러 객체
 * @param fallback 기본 메시지
 */
function extractError(e: unknown, fallback: string): StoreError {
    if (!isRecord(e)) return { message: fallback };
    const msg = typeof e.message === 'string' ? e.message : fallback;
    return { message: msg };
}

/**
 * JSON 문자열을 안전하게 파싱
 *
 * @param s JSON 문자열
 * @returns 파싱된 객체 또는 null
 */
const safeJson = <T,>(s?: string): T | null => {
    if (!s) return null;
    try {
        return JSON.parse(s) as T;
    } catch {
        return null;
    }
};

/**
 * 전자결재 문서 상태 문자열을
 * 급여 조정 도메인 상태로 매핑
 */
const mapDocStatus = (s?: string): AdjustmentStatus => {
    if (!s) return 'PENDING';
    if (s === 'INPROGRESS' || s === 'PENDING') return 'PENDING';
    if (s === 'APPROVED' || s === 'COMPLETED') return 'APPROVED';
    if (s === 'REJECTED') return 'REJECTED';
    if (s === 'CANCELED' || s === 'CANCELLED') return 'CANCELED';
    if (s.includes('진행')) return 'PENDING';
    if (s.includes('승인') || s.includes('완료')) return 'APPROVED';
    if (s.includes('반려')) return 'REJECTED';
    if (s.includes('취소') || s.includes('회수')) return 'CANCELED';
    return 'PENDING';
};

const mapDocToRow = (doc: DocumentsResponseDTO): ApprovalAdjustmentRow | null => {
    const d = doc as unknown as Record<string, unknown>;
    if (d['name'] !== ADJUST_FORM_NAME) return null;

    const docId = (d['docId'] as number) ?? (d['id'] as number) ?? (d['documentId'] as number);
    if (!docId) return null;

    return {
        docId,
        employeeName: (d['drafter'] as string) ?? '-',
        jobTitle: '-',
        departmentName: (d['drafterDept'] as string) ?? '-',
        reason: (d['title'] as string) ?? '-',
        sign: '+',
        amount: 0,
        status: mapDocStatus(d['docStatus'] as string | undefined),
        createdAt: (d['drafterAt'] as string) ?? '',
        _hydrated: false,
    };
};

export const usePayrollAdjustmentStore = defineStore('payrollAdjustmentAdmin', () => {
    const loading = ref(false);
    const error = ref<StoreError | null>(null);

    const rows = ref<ApprovalAdjustmentRow[]>([]);

    const query = ref<InboxSearchParams & ApprovalAdjustmentQuery>({
        page: 1,
        size: 10,
    });

    const clearError = () => {
        error.value = null;
    };

    const fetchList = async () => {
        loading.value = true;
        error.value = null;
        try {
            const res = await getInboxDocuments(query.value);

            const r = res as unknown as Record<string, unknown>;
            const docs =
                (r['content'] as DocumentsResponseDTO[]) ??
                (r['list'] as DocumentsResponseDTO[]) ??
                (r['items'] as DocumentsResponseDTO[]) ??
                [];

            rows.value = docs.map(mapDocToRow).filter(Boolean) as ApprovalAdjustmentRow[];
            await hydrateRows(rows.value.map((x) => x.docId));
        } catch (e: unknown) {
            error.value = extractError(e, '조정 요청 목록 조회 중 오류가 발생했습니다.');
            rows.value = [];
        } finally {
            loading.value = false;
        }
    };

    /**
 * 문서 상세 정보를 조회하여
 * Row 데이터(jobTitle, 금액, 상태 등) 보강
 */
    const hydrateRows = async (docIds: number[]) => {
        const targets = rows.value.filter((r) => docIds.includes(r.docId) && !r._hydrated);
        if (targets.length === 0) return;
        await Promise.all(
            targets.map(async (r) => {
                try {
                    const detail = await getDocumentDetail(r.docId);
                    const d = detail as unknown as Record<string, unknown>;

                    r.jobTitle = (d['drafterGrade'] as string) ?? '-';

                    const parsed = safeJson<ModifyPayrollDetails>(d['details'] as string | undefined);
                    if (parsed) {
                        const cur = Number(parsed.currentAmount ?? 0);
                        const adj = Number(parsed.adjustmentAmount ?? 0);

                        r.amount = adj;
                        r.sign = adj >= cur ? '+' : '-';

                        const reason = (parsed.reason ?? '').trim();
                        if (reason) r.reason = reason;
                    }

                    // 상태
                    r.status = mapDocStatus(d['docStatus'] as string | undefined);

                    // 날짜(정규화된 값 있으면 덮기)
                    r.createdAt = (d['draftDate'] as string) ?? r.createdAt;

                    r._hydrated = true;
                } catch {
                    r._hydrated = true;
                }
            })
        );
    };

    const statusLabel = (s: AdjustmentStatus) => {
        switch (s) {
            case 'PENDING':
                return '승인대기';
            case 'APPROVED':
                return '승인완료';
            case 'REJECTED':
                return '반려';
            case 'CANCELED':
                return '취소';
        }
    };

    const badgeClass = (s: AdjustmentStatus) => {
        switch (s) {
            case 'PENDING':
                return 'badge-yellow';
            case 'APPROVED':
                return 'badge-green';
            case 'REJECTED':
                return 'badge-red';
            case 'CANCELED':
                return 'badge-gray';
        }
    };

    return {
        loading,
        error,
        rows,
        query,
        clearError,
        fetchList,
        hydrateRows,
        statusLabel,
        badgeClass,
    };
});