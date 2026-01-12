/**
 * <pre>
 * TypeScript Name : payrollBatchStore.ts
 * Description     : 급여(Payroll) 관리자용 월별 급여 배치 Pinia Store - 배치 관리
 *
 * History
 *   2025/12/09 - 동근 최초 작성 (급여 관련 API 연동 + Pinia 상태 관리 구성)
 *   2025/12/15 - 동근 배치 화면 연동 스토어 추가
 *   2025/12/23 - payrollAdminStore에서 payrollBatchStore로 이름 변경
 * </pre>
 *
 * @module payroll-store
 * @author 동근
 * @version 1.2
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { payrollAdminApi } from '@/api/payroll/payroll.admin';
import type {
    PayrollBatchDetailResponse,
    PayrollBatchListResponse,
    PayrollEmployeeResultResponse,
    PayrollBatchStatus,
    PayrollBatchTargetEmployee,
} from '@/types/payroll/payroll.batch';

export const usePayrollAdminStore = defineStore('payrollAdminStore', () => {
    const loading = ref(false);
    const errorMessage = ref<string | null>(null);

    const batches = ref<PayrollBatchListResponse[]>([]);
    const selectedBatchId = ref<number | null>(null);

    const batchDetail = ref<PayrollBatchDetailResponse | null>(null);
    const employees = ref<PayrollEmployeeResultResponse[]>([]);
    const targets = ref<PayrollBatchTargetEmployee[]>([]);

    const employeeCountByBatchId = ref<Record<number, number>>({});
    const selectedBatch = computed(() =>
        selectedBatchId.value == null
            ? null
            : batches.value.find(batch => batch.batchId === selectedBatchId.value) ?? null
    );

    const resetError = () => (errorMessage.value = null);

    const extractErrorMessage = (e: unknown, fallback: string) => {
        if (e && typeof e === 'object') {
            const err = e as any;
            return err?.response?.data?.message ?? err?.message ?? fallback;
        }
        return fallback;
    };

    /* =========================
     * 조회
     * ========================= */
    async function loadBatches(filter?: { month?: string; status?: PayrollBatchStatus | '' }) {
        loading.value = true;
        resetError();
        try {
            batches.value = await payrollAdminApi.listBatches(filter);
            const pairs = await Promise.all(
                batches.value.map(async (b) => {
                    try {
                        const detail = await payrollAdminApi.getBatchDetail(b.batchId);
                        return [b.batchId, detail.totalEmployeeCount] as const;
                    } catch {
                        return [b.batchId, undefined] as const;
                    }
                })
            );
            const nextMap: Record<number, number> = {};
            for (const [batchId, cnt] of pairs) {
                if (typeof cnt === 'number') nextMap[batchId] = cnt;
            }
            employeeCountByBatchId.value = nextMap;
        } catch (e: unknown) {
            errorMessage.value = extractErrorMessage(e, '배치 목록 조회 실패');
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function selectBatch(batchId: number) {
        selectedBatchId.value = batchId;
        loading.value = true;
        resetError();

        try {
            const [detail, emps] = await Promise.all([
                payrollAdminApi.getBatchDetail(batchId),
                payrollAdminApi.getBatchEmployees(batchId),
            ]);
            batchDetail.value = detail;
            employees.value = emps;
            employeeCountByBatchId.value = {
                ...employeeCountByBatchId.value,
                [batchId]: detail.totalEmployeeCount,
            };
        } catch (e: unknown) {
            errorMessage.value = extractErrorMessage(e, '배치 선택 실패');
            throw e;
        } finally {
            loading.value = false;
        }
    }


    async function loadBatchDetail(batchId: number) {
        loading.value = true;
        resetError();
        try {
            batchDetail.value = await payrollAdminApi.getBatchDetail(batchId);
        } catch (e: unknown) {
            errorMessage.value = extractErrorMessage(e, '배치 상세 조회 실패');
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function loadBatchEmployees(batchId: number) {
        loading.value = true;
        resetError();
        try {
            employees.value = await payrollAdminApi.getBatchEmployees(batchId);
        } catch (e: unknown) {
            errorMessage.value = extractErrorMessage(e, '배치 사원 결과 조회 실패');
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /* =========================
     * 대상 사원 조회
     * ========================= */
    async function loadTargets() {
        loading.value = true;
        resetError();
        try {
            targets.value = await payrollAdminApi.listBatchTargets();
        } catch (e: unknown) {
            errorMessage.value = extractErrorMessage(e, '대상 사원 조회 실패');
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /* =========================
     * 배치 생성
     * ========================= */
    async function createBatch(month: string) {
        loading.value = true;
        resetError();
        try {
            const batchId = await payrollAdminApi.createBatch(month);
            await loadBatches();
            await selectBatch(batchId);
            return batchId;
        } catch (e: unknown) {
            errorMessage.value = extractErrorMessage(e, '배치 생성 실패');
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /* =========================
     * 급여 계산
     * ========================= */

    /**
     * 전체 계산
     * @returns 
     */
    async function calculateAllBatch() {
        if (!selectedBatchId.value) return;

        loading.value = true;
        resetError();
        try {
            await payrollAdminApi.calculateBatchAll(selectedBatchId.value);
            await selectBatch(selectedBatchId.value); // 재조회 타이밍 고정
            await loadBatches(); // 목록 상태 뱃지/정렬 갱신용(선택)
        } catch (e: unknown) {
            errorMessage.value = extractErrorMessage(e, '급여 전체 계산 실패');
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /**
     * 선택 계산
     */
    async function calculateSelectedBatch(employeeIds?: number[]) {
        if (!selectedBatchId.value) return;

        loading.value = true;
        resetError();
        try {
            let ids = employeeIds ?? [];

            // 호출자가 ids를 안 넘기면, 화면에 보이는 목록 기준으로 선택 계산
            if (ids.length === 0 && employees.value.length > 0) {
                ids = employees.value.map(e => e.employeeId);
            }

            if (ids.length === 0) {
                // 서버가 INVALID_INPUT 던지게 둘 수도 있지만, UX상 프론트에서 1차 차단
                throw new Error('계산 대상 사원이 없습니다.');
            }

            await payrollAdminApi.calculateBatchSelected(selectedBatchId.value, ids);
            await selectBatch(selectedBatchId.value); // 재조회 타이밍 고정
            await loadBatches(); // 목록 상태 뱃지/정렬 갱신용(선택)
        } catch (e: unknown) {
            errorMessage.value = extractErrorMessage(e, '급여 선택 계산 실패');
            throw e;
        } finally {
            loading.value = false;
        }
    }
    async function confirmSelectedBatch() {
        if (!selectedBatchId.value) return;
        loading.value = true;
        resetError();
        try {
            await payrollAdminApi.confirmBatch(selectedBatchId.value);
            await selectBatch(selectedBatchId.value);
            await loadBatches();
        } catch (e: unknown) {
            errorMessage.value = extractErrorMessage(e, '배치 확정 실패');
            throw e;
        } finally {
            loading.value = false;
        }
    }
    async function paySelectedBatch() {
        if (!selectedBatchId.value) return;

        loading.value = true;
        resetError();
        try {
            await payrollAdminApi.payBatch(selectedBatchId.value);
            await selectBatch(selectedBatchId.value);
            await loadBatches();
        } catch (e: unknown) {
            errorMessage.value = extractErrorMessage(e, '지급 처리 실패');
            throw e;
        } finally {
            loading.value = false;
        }
    }



    /* =========================
     * 
     * ========================= */
    return {
        loading,
        errorMessage,

        batches,
        selectedBatchId,
        selectedBatch,

        batchDetail,
        employees,
        targets,
        employeeCountByBatchId,

        loadBatches,
        selectBatch,
        loadBatchDetail,
        loadBatchEmployees,
        loadTargets,
        createBatch,
        calculateAllBatch,
        calculateSelectedBatch,
        confirmSelectedBatch,
        paySelectedBatch
    };

});
