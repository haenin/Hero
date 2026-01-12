/**
 * <pre>
 * TypeScript Name : session.ts
 * Description     : 세션 관리용 Pinia Store
 *
 * Responsibility
 *   - 프론트엔드 세션 타이머 관리 (초 단위 카운트다운)
 *   - 페이지 전환 시 세션 갱신
 *   - 세션 만료 시 로그아웃 처리(추후 API 연동 예정)
 *
 * Note
 *   - 현재는 콘솔 로그만, 추후 토큰 삭제 & API 기반 로그아웃 구현 예정
 *
 * History
 *   2025/12/10 - 동근 최초 작성 (Pinia + Composition API)
 *   2025/12/12 - 동근 세션 만료 시 로그아웃 및 로그인 페이지 이동 기능 추가
 * </pre>
 *
 * @module session-store
 * @author 동근
 * @version 1.1
 */
import { defineStore } from "pinia";
import { ref, onUnmounted } from "vue";
import router from '@/router';
import { useAuthStore } from '@/stores/auth';

export const useSessionStore = defineStore("session", () => {
    const SESSION_DURATION = 3600; // 60분
    const remainingSeconds = ref(SESSION_DURATION);
    let timer: number | null = null;

    const stopSession = () => {
        if (timer !== null) {
            clearInterval(timer);
            timer = null;
        }
    };

    const startSession = () => {
        stopSession();
        remainingSeconds.value = SESSION_DURATION;

        timer = window.setInterval(async () => {
            remainingSeconds.value--;

            if (remainingSeconds.value <= 0) {
                stopSession();

                const authStore = useAuthStore();
                await authStore.logout();

                // 로그인 페이지로 이동
                router.push('/login');
            }
        }, 1000);
    };

    // 페이지 전환될 때만 호출
    const refreshSession = () => {
        remainingSeconds.value = SESSION_DURATION;
    };

    return {
        remainingSeconds,
        startSession,
        refreshSession,
        stopSession,
    };
});
