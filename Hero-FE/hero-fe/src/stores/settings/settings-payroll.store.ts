/**
 * <pre>
 * TypeScript Name : settings-payroll.store.ts
 * Description     : 급여 정책 & 설정 관리(Payroll Policy) Pinia Store
 *
 * History
 *  2025/12/26 - 동근 최초 작성
 * </pre>
 *
 * @module settings-payroll-store
 * @author 동근
 * @version 1.0
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { settingsPayrollApi } from '@/api/settings/settings-payroll.api';
import type {
    PolicyResponse,
    PolicyCreateRequest,
    PolicyActivateRequest,
    PolicyDetailResponse,
    PolicyUpdateRequest,
    PolicyCopyRequest,
    PolicyConfigUpsertRequest,
    ItemPolicyUpsertRequest,
    ItemType,
    AllowanceMaster,
    DeductionMaster,
    Yn,
} from '@/types/settings/settings-payroll.types';

type ApiErr = unknown & { response?: { data?: { message?: string } }; message?: string };

const errMsg = (e: ApiErr, fallback: string) =>
    e?.response?.data?.message || e?.message || fallback;

export const useSettingsPayrollStore = defineStore('settings-payroll', () => {
    const loading = ref(false);
    const saving = ref(false);
    const error = ref<string | null>(null);
    const policies = ref<PolicyResponse[]>([]);
    const activePolicy = ref<PolicyResponse | null>(null);
    const detail = ref<PolicyDetailResponse | null>(null);
    const selectedPolicyId = ref<number | null>(null);
    const allowanceMasters = ref<AllowanceMaster[]>([]);
    const deductionMasters = ref<DeductionMaster[]>([]);
    const hasDetail = computed(() => !!detail.value?.policy?.policyId);
    const canActivate = computed(() => {
        const cfgs = detail.value?.configs ?? [];
        const has = (key: string) =>
            cfgs.some(c => (c.configKey ?? '').trim() === key && String(c.configValue ?? '').trim() !== '');
        return has('PAYDAY_DAY') && has('CLOSE_DAY');
    });

    const setError = (msg: string | null) => (error.value = msg);

    function clearDetail() {
        detail.value = null;
        selectedPolicyId.value = null;
    }

    function setSelectedPolicyId(policyId: number | null) {
        selectedPolicyId.value = policyId;
    }

    async function fetchPolicies() {
        loading.value = true;
        setError(null);
        try {
            policies.value = await settingsPayrollApi.listPolicies();
            return policies.value;
        } catch (e) {
            setError(errMsg(e as ApiErr, '정책 목록 조회 실패'));
            return [];
        } finally {
            loading.value = false;
        }
    }

    async function fetchActivePolicy() {
        loading.value = true;
        setError(null);
        try {
            activePolicy.value = await settingsPayrollApi.getActivePolicy();
            return activePolicy.value;
        } catch (e) {
            activePolicy.value = null;
            setError(null);
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function fetchPolicyDetail(policyId: number) {
        loading.value = true;
        setError(null);
        try {
            selectedPolicyId.value = policyId;
            const d = await settingsPayrollApi.getPolicyDetail(policyId);
            if (!d || !d.policy) throw new Error('PolicyDetail 응답에 policy가 없습니다.');

            const normalizedItems: any = {
                ALLOWANCE: (d as any).items?.ALLOWANCE ?? [],
                DEDUCTION: (d as any).items?.DEDUCTION ?? [],
            };

            detail.value = { ...(d as any), items: normalizedItems } as PolicyDetailResponse;
            return detail.value;
        } catch (e) {
            detail.value = null;
            setError(errMsg(e as ApiErr, '정책 상세 조회 실패'));
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function reloadDetail() {
        if (!selectedPolicyId.value) return null;
        return fetchPolicyDetail(selectedPolicyId.value);
    }

    async function createPolicy(body: PolicyCreateRequest) {
        saving.value = true;
        setError(null);
        try {
            const created = await settingsPayrollApi.createPolicy(body);
            await fetchPolicies();
            return created;
        } catch (e) {
            setError(errMsg(e as ApiErr, '정책 생성 실패'));
            throw e;
        } finally {
            saving.value = false;
        }
    }

    async function updatePolicy(policyId: number, body: PolicyUpdateRequest) {
        saving.value = true;
        setError(null);
        try {
            const updated = await settingsPayrollApi.updatePolicy(policyId, body);
            await fetchPolicies();
            if (selectedPolicyId.value === policyId) await reloadDetail();
            return updated as PolicyResponse;
        } catch (e) {
            setError(errMsg(e as ApiErr, '정책 수정 실패'));
            throw e;
        } finally {
            saving.value = false;
        }
    }

    async function deletePolicy(policyId: number) {
        saving.value = true;
        setError(null);
        try {
            await settingsPayrollApi.deleteDraftPolicy(policyId);
            await fetchPolicies();
            if (selectedPolicyId.value === policyId) clearDetail();
        } catch (e) {
            setError(errMsg(e as ApiErr, '정책 삭제 실패'));
            throw e;
        } finally {
            saving.value = false;
        }
    }

    async function copyPolicy(policyId: number, body?: PolicyCopyRequest | null) {
        saving.value = true;
        setError(null);
        try {
            const copied = await settingsPayrollApi.copyPolicy(policyId, body ?? null);
            await fetchPolicies();
            return copied as PolicyResponse;
        } catch (e) {
            setError(errMsg(e as ApiErr, '정책 복제 실패'));
            throw e;
        } finally {
            saving.value = false;
        }
    }

    async function expirePolicy(policyId: number) {
        saving.value = true;
        setError(null);
        try {
            const expired = await settingsPayrollApi.expirePolicy(policyId);
            await fetchPolicies();
            await fetchActivePolicy();
            if (selectedPolicyId.value === policyId) await reloadDetail();
            return expired as PolicyResponse;
        } catch (e) {
            setError(errMsg(e as ApiErr, '정책 만료 실패'));
            throw e;
        } finally {
            saving.value = false;
        }
    }

    async function activatePolicy(policyId: number, body: PolicyActivateRequest) {
        saving.value = true;
        setError(null);
        try {
            const activated = await settingsPayrollApi.activatePolicy(policyId, body);
            await fetchPolicies();
            await fetchActivePolicy();
            if (selectedPolicyId.value === policyId) await reloadDetail();
            return activated;
        } catch (e) {
            setError(errMsg(e as ApiErr, '정책 활성화 실패'));
            throw e;
        } finally {
            saving.value = false;
        }
    }

    async function upsertConfigs(policyId: number, rows: PolicyConfigUpsertRequest[]) {
        saving.value = true;
        setError(null);
        try {
            await settingsPayrollApi.upsertConfigs(policyId, rows);
            if (selectedPolicyId.value === policyId) await reloadDetail();
        } catch (e) {
            setError(errMsg(e as ApiErr, '공통 설정 저장 실패'));
            throw e;
        } finally {
            saving.value = false;
        }
    }

    async function upsertItemPolicies(policyId: number, type: ItemType, rows: ItemPolicyUpsertRequest[]) {
        saving.value = true;
        setError(null);
        try {
            await settingsPayrollApi.upsertItemPolicies(policyId, type, rows);
            if (selectedPolicyId.value === policyId) await reloadDetail();
        } catch (e) {
            setError(errMsg(e as ApiErr, '항목 정책 저장 실패'));
            throw e;
        } finally {
            saving.value = false;
        }
    }

    async function deleteItemPolicy(policyId: number, itemPolicyId: number) {
        saving.value = true;
        setError(null);
        try {
            await settingsPayrollApi.deleteItemPolicy(policyId, itemPolicyId);
            if (selectedPolicyId.value === policyId) await reloadDetail();
        } catch (e) {
            setError(errMsg(e as ApiErr, '항목 정책 삭제 실패'));
            throw e;
        } finally {
            saving.value = false;
        }
    }

    async function fetchMasters(activeYn: Yn = 'Y') {
        loading.value = true;
        setError(null);
        try {
            const [a, d] = await Promise.all([
                settingsPayrollApi.listAllowances(activeYn),
                settingsPayrollApi.listDeductions(activeYn),
            ]);
            allowanceMasters.value = a;
            deductionMasters.value = d;
            return { allowances: a, deductions: d };
        } catch (e) {
            allowanceMasters.value = [];
            deductionMasters.value = [];
            setError(errMsg(e as ApiErr, '마스터 조회 실패'));
            return { allowances: [], deductions: [] };
        } finally {
            loading.value = false;
        }
    }

    return {
        loading,
        saving,
        error,
        policies,
        activePolicy,
        detail,
        selectedPolicyId,
        allowanceMasters,
        deductionMasters,

        hasDetail,
        canActivate,

        setSelectedPolicyId,
        clearDetail,
        fetchPolicies,
        fetchActivePolicy,
        fetchPolicyDetail,
        reloadDetail,

        createPolicy,
        updatePolicy,
        deletePolicy,
        copyPolicy,
        expirePolicy,
        activatePolicy,

        upsertConfigs,
        upsertItemPolicies,
        deleteItemPolicy,

        fetchMasters,
    };
});
