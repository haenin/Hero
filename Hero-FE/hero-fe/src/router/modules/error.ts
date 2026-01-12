import type { RouteRecordRaw } from "vue-router";

const errorRoutes: RouteRecordRaw[] = [
    {
        path: "/403",
        name: "Forbidden",
        component: () => import("@/views/Forbidden.vue"),
        meta: { title: "접근 권한 없음" },
    },
];

export default errorRoutes;
