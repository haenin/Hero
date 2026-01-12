
/*
    <pre>
    (File=>TypeScript) Name   : guard.ts
    Description : Vue Router의 전역 네비게이션 가드를 설정합니다.
                - 페이지 이동 시 사용자의 인증 상태 확인
                - 인증되지 않은 사용자가 보호된 페이지 접근 시, 자동으로 토큰 갱신 시도
                - 토큰 갱신 실패 시 로그인 페이지로 리디렉션

    History
    2025/12/11 - 이승건 최초 작성
    </pre>

    @author 이승건
    @version 1.0
*/
import type { Router } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

/**
 * (설명 : )Vue Router 인스턴스에 전역 네비게이션 가드를 설정합니다.
 * @param {Router} router - Vue Router 인스턴스
 * @returns {void}
 */
export function setupAuthGuard(router: Router) {
    router.beforeEach(async (to, from, next) => {
        const authStore = useAuthStore();

        // 디버깅: 어떤 경로로 이동을 시도하는지 확인합니다.
        console.log(`[Auth Guard] Navigating from '${from.fullPath}' to '${to.fullPath}' (name: ${String(to.name)})`);

        const publicRoutes = ['Login', 'FindPassword', 'ResetPassword', 'Forbidden'];
        const isProtectedRoute = !publicRoutes.includes(to.name as string);

        // 1. 보호된 경로에 접근하려 하고, 현재 인증되지 않은 경우에만 토큰 갱신을 시도합니다.
        if (isProtectedRoute && !authStore.isAuthenticated) {
            try {
                await authStore.refresh();
            } catch (error) {
                // 토큰 갱신에 실패해도 괜찮습니다. 아래 로직에서 로그인 페이지로 안내할 것입니다.
                console.log('자동 로그인(토큰 갱신) 시도 실패:', error);
            }
        }

        // 2. 토큰 갱신 시도 후, 최종 인증 상태를 다시 확인합니다.
        const isAuthenticated = authStore.isAuthenticated;

        // 3. 최종 상태에 따라 페이지 이동을 결정합니다.
        if (to.name === 'Login' && isAuthenticated) {
            // 이미 로그인한 사용자가 로그인 페이지로 가려는 경우 -> 홈으로 리디렉션
            return next({ path: '/' });
        } else if (isProtectedRoute && !isAuthenticated) {
            // 보호된 페이지에 접근하려 하지만, 최종적으로 인증에 실패한 경우 -> 로그인 페이지로 리디렉션
            return next({ name: 'Login', query: { redirect: to.fullPath } });
        }
        const requiredRoles = (to.meta?.roles as string[] | undefined) ?? [];
        if (requiredRoles.length > 0 && !authStore.hasAnyRole(requiredRoles)) {
            console.warn(
                `[Auth Guard] Forbidden: missing roles ${requiredRoles.join(', ')}`
            );
            return next({ name: 'Forbidden' });
        }
        // 그 외 모든 경우 (정상 접근) -> 그대로 진행
        next();
    });
}