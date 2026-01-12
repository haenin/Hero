import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

import App from './App.vue';
import router from './router';
import './assets/styles/theme.css';
import { useAuthStore } from './stores/auth';

async function initializeApp() {
    const app = createApp(App);
    const pinia = createPinia();

    app.use(pinia);

    // =================== Vue Query 설정 ===================
    app.use(VueQueryPlugin, {
        queryClientConfig: {
            defaultOptions: {
                queries: {
                    refetchOnWindowFocus: false, // 창 포커스 시 자동 재조회 비활성화
                    retry: 1, // 실패 시 1번 재시도
                    staleTime: 5 * 60 * 1000, // 5분 - 데이터 신선도 유지 시간
                    cacheTime: 10 * 60 * 1000, // 10분 - 캐시 유지 시간
                },
                mutations: {
                    retry: 0, // Mutation 실패 시 재시도 안 함
                }
            },
        },
    });

    // =================== Toast 설정 ===================
    app.use(Toast, {
        position: 'top-right',
        timeout: 3000, // 3초 후 자동 사라짐
        closeOnClick: true,
        pauseOnFocusLoss: true,
        pauseOnHover: true,
        draggable: true,
        draggablePercent: 0.6,
        showCloseButtonOnHover: false,
        hideProgressBar: false,
        closeButton: 'button',
        icon: true,
        rtl: false,
        transition: 'Vue-Toastification__bounce',
        maxToasts: 5, // 최대 5개까지만 표시
        newestOnTop: true
    });

    // Pinia가 설치된 후 auth 스토어를 초기화합니다.
    const authStore = useAuthStore();

    try {
        // 앱 시작 시 자동으로 토큰 갱신을 시도합니다.
        // HttpOnly 쿠키에 유효한 리프레시 토큰이 있다면,
        // 이 과정에서 새로운 액세스 토큰이 스토어에 저장됩니다.
        await authStore.refresh();
    } catch (error) {
        // 리프레시 토큰이 없거나 만료된 경우 오류가 발생하지만, 이는 예상된 동작입니다.
        // 사용자는 그냥 로그아웃 상태로 유지되며, 네비게이션 가드가 로그인 페이지로 안내할 것입니다.
        console.log('Initial token refresh failed. User is not logged in.');
    }

    // 라우터를 설치하고 앱을 마운트합니다.
    // 자동 갱신 시도 후에 라우터를 설치해야 네비게이션 가드가 올바른 인증 상태로 동작합니다.
    app.use(router);
    app.mount('#app');
}

initializeApp();