/**
 * TypeScript Name : payroll-analytics.store.ts
 * Description     : 급여 Analytics(Admin) 상태 관리 Pinia Store
 *                  - Overview / Organization / Composition 데이터 관리
 *                  - 간단 캐시를 통한 중복 요청 방지
 *
 * History
 *  2026/01/02 - 동근 최초 작성
 *
 * @module payroll-analytics-store
 * @author 동근
 * @version 1.0
 */


import { defineStore } from 'pinia';
import type {
    PayrollAnalyticsCompositionResponse,
    PayrollAnalyticsOrgResponse,
    PayrollAnalyticsOverviewResponse,
} from '@/types/payroll/payroll-analytics.types';
import { payrollAdminApi } from '@/api/payroll/payroll.admin';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

type CacheValue =
    | PayrollAnalyticsOverviewResponse
    | PayrollAnalyticsOrgResponse
    | PayrollAnalyticsCompositionResponse;

type KeyParamValue = string | number | boolean | null | undefined;
const makeKey = (path: string, params: Record<string, KeyParamValue>) =>
    `${path}:${Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&')}`;

export const usePayrollAnalyticsStore = defineStore('payrollAnalytics', {
    state: () => ({
        overview: null as PayrollAnalyticsOverviewResponse | null,
        organization: null as PayrollAnalyticsOrgResponse | null,
        composition: null as PayrollAnalyticsCompositionResponse | null,

        overviewState: 'idle' as LoadState,
        organizationState: 'idle' as LoadState,
        compositionState: 'idle' as LoadState,

        errorMessage: null as string | null,
        cache: new Map<string, CacheValue>(),
    }),

    actions: {
        clearError() {
            this.errorMessage = null;
        },

        extractErrorMessage(e: unknown, fallback: string) {
            if (e instanceof Error && e.message) return e.message;
            const maybe = e as {
                response?: { data?: { message?: string } };
                message?: string;
            };

            return (
                maybe?.response?.data?.message ??
                maybe?.message ??
                fallback
            );
        },

        reset() {
            this.overview = null;
            this.organization = null;
            this.composition = null;
            this.overviewState = 'idle';
            this.organizationState = 'idle';
            this.compositionState = 'idle';
            this.errorMessage = null;
            this.cache.clear();
        },

        async loadOverview(month: string, trendMonths?: number) {
            this.clearError();
            this.overviewState = 'loading';

            const key = makeKey('overview', { month, trendMonths });
            if (this.cache.has(key)) {
                this.overview = this.cache.get(key) as PayrollAnalyticsOverviewResponse;
                this.overviewState = 'success';
                return this.overview!;
            }

            try {
                const data = await payrollAdminApi.getAnalyticsOverview({ month, trendMonths });
                this.overview = data;
                this.cache.set(key, data);
                this.overviewState = 'success';
                return data;
            } catch (e: unknown) {
                this.overviewState = 'error';
                this.errorMessage = this.extractErrorMessage(
                    e,
                    '급여 Analytics(Overview) 조회 중 오류가 발생했습니다.'
                );
                throw e;
            }
        },

        async loadOrganization(month: string, deptId?: number) {
            this.clearError();
            this.organizationState = 'loading';

            const key = makeKey('organization', { month, deptId });
            if (this.cache.has(key)) {
                this.organization = this.cache.get(key) as PayrollAnalyticsOrgResponse;
                this.organizationState = 'success';
                return this.organization!;
            }

            try {
                const data = await payrollAdminApi.getAnalyticsOrganization({ month, deptId });
                this.organization = data;
                this.cache.set(key, data);
                this.organizationState = 'success';
                return data;
            } catch (e: unknown) {
                this.organizationState = 'error';
                this.errorMessage = this.extractErrorMessage(
                    e,
                    '급여 Analytics(Organization) 조회 중 오류가 발생했습니다.'
                );
                throw e;
            }
        },

        async loadComposition(month: string, trendMonths?: number) {
            this.clearError();
            this.compositionState = 'loading';

            const key = makeKey('composition', { month, trendMonths });
            if (this.cache.has(key)) {
                this.composition = this.cache.get(key) as PayrollAnalyticsCompositionResponse;
                this.compositionState = 'success';
                return this.composition!;
            }

            try {
                const data = await payrollAdminApi.getAnalyticsComposition({ month, trendMonths });
                this.composition = data;
                this.cache.set(key, data);
                this.compositionState = 'success';
                return data;
            } catch (e: unknown) {
                this.compositionState = 'error';
                this.errorMessage = this.extractErrorMessage(
                    e,
                    '급여 Analytics(Composition) 조회 중 오류가 발생했습니다.'
                );
                throw e;
            }
        },
    },
});
