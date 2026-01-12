/**
 * <pre>
 * TypeScript Name   : payrollAdmin.ts
 * Description : 급여(Payroll) 도메인의 라우트 설정 파일
 * 
 *
 * History
 * 2025/12/09 - 동근 최초 작성
 * 2025/12/26 - 동근 급여 관리 사이드바 항목 반영
 * </pre>
 *
 * @module payrollAdmin-routes
 * @author 동근
 * @version 1.1
 */
import type { RouteRecordRaw } from "vue-router";

const PAYROLL_ADMIN_ROLES = [
    "ROLE_SYSTEM_ADMIN",
    "ROLE_HR_MANAGER",
    "ROLE_HR_PAYROLL",
] as const;


/**
 * 급여 도메인 라우트 설정 (관리자용)
 * @module payroll-admin
 * @see /views/payroll/admin/batch/Batch.vue  월별 급여 배치
 * @see /views/payroll/admin/Adjust.vue  급여 조정
 * @see /views/payroll/admin/Search.vue  급여 조회
 * @see /views/payroll/admin/items/Items.vue  급여 항목 관리
 * @see /views/payroll/admin/Report.vue  급여 보고서
 */
const payrollAdminRoutes: RouteRecordRaw[] = [
    {
        path: "/payroll/admin/batch",
        name: "PayrollAdminBatch",
        component: () => import("@/views/payroll/admin/batch/BatchPage.vue"),
        meta: { title: "월별 급여 배치", roles: [...PAYROLL_ADMIN_ROLES] },
    },
    {
        path: "/payroll/admin/adjust",
        name: "PayrollAdminAdjust",
        component: () => import("@/views/payroll/admin/adjustment/Adjust.vue"),
        meta: { title: "급여 조정", roles: [...PAYROLL_ADMIN_ROLES] },
    },
    {
        path: "/payroll/admin/search",
        name: "PayrollAdminSearch",
        component: () => import("@/views/payroll/admin/Search.vue"),
        meta: { title: "급여 조회(검색)", roles: [...PAYROLL_ADMIN_ROLES] },
    },
    {
        path: "/payroll/admin/items",
        name: "PayrollAdminItems",
        component: () => import("@/views/payroll/admin/items/Items.vue"),
        meta: { title: "급여 항목 관리", roles: [...PAYROLL_ADMIN_ROLES] },
    },
    {
        path: "/payroll/admin/report",
        name: "PayrollAdminReport",
        component: () => import("@/views/payroll/admin/Analytics/Analytics.vue"),
        meta: { title: "급여 보고서", roles: [...PAYROLL_ADMIN_ROLES] },
    },
];

export default payrollAdminRoutes;
