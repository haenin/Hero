/*
    <pre>
    (File=>TypeScript) Name   : apiClient.ts
    Description : Axios 인스턴스를 생성하고 API 요청/응답을 가로채는 인터셉터를 설정합니다.
                - 모든 요청에 인증 토큰 자동 추가
                - 401 오류 발생 시 토큰 자동 갱신 시도
                - HttpOnly 쿠키 기반의 리프레시 토큰 관리

    History
    2025/12/11 - 이승건 최초 작성
    </pre> 

    @이승건
    @version 1.0
*/
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth';

// 1. 기본 API 설정
// 배포 환경 변수(VITE_API_URL)가 있으면 쓰고, 없으면 로컬(5000)을 씁니다.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // HttpOnly 쿠키를 주고받기 위해 필수
});

// 2. 요청 인터셉터: 모든 요청에 Access Token 첨부
/**
 * (설명 : )모든 API 요청 전에 실행되어, 유효한 액세스 토큰이 있는 경우 Authorization 헤더에 추가합니다.
 * @param {InternalAxiosRequestConfig} config - Axios 요청 설정 객체
 * @returns {InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>} 수정된 요청 설정 객체
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 인터셉터 내에서 스토어를 호출해야 최신 상태를 반영합니다.
        const authStore = useAuthStore();
        const accessToken = authStore.accessToken;

        // 로그인이나 토큰 갱신 요청에는 토큰을 첨부하지 않음
        // 실제 사용하는 URL 경로로 수정해야 합니다.
        if (config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh')) {
            return config;
        }

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    /**
     * (설명 : )요청 설정 과정에서 오류가 발생했을 때 처리합니다.
     * @param {AxiosError} error - 발생한 Axios 오류 객체
     * @returns {Promise<never>} 에러를 reject하는 프로미스
     */
    (error: AxiosError) => {
        return Promise.reject(error);   // 에러 정보를 catch 블럭으로 전달
    }
);

// 3. 응답 인터셉터: 토큰 갱신 및 에러 처리
let isRefreshing = false;
// 실패한 요청을 저장하는 큐
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

// 큐에 쌓인 요청들을 처리하는 함수
/**
 * (설명 : )토큰 갱신 후, 실패했던 요청들을 새로운 토큰으로 재시도하거나 에러로 거부합니다.
 * @param {AxiosError | null} error - 토큰 갱신 과정에서 발생한 에러. 성공 시 null.
 * @param {string | null} token - 새로 발급받은 액세스 토큰. 실패 시 null.
 * @returns {void}
 */
const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

/**
 * (설명 : )API 응답을 수신했을 때 실행됩니다. 성공적인 응답을 그대로 반환하거나, 응답 헤더에 새 토큰이 있는 경우 저장합니다.
 * @param {any} response - Axios 응답 객체
 * @returns {any} 처리된 응답 객체
 */
apiClient.interceptors.response.use(
    (response) => {
        // 로그인 또는 토큰 갱신 응답의 헤더에 새 Access Token이 있는 경우 처리
        const newAccessToken = response.headers['authorization'];
        if (newAccessToken) {
            const authStore = useAuthStore();
            const token = newAccessToken.startsWith('Bearer ') ? newAccessToken.substring(7) : newAccessToken;
            authStore.login(token);
        }
        return response;
    },
    /**
     * (설명 : )API 응답이 에러일 경우 실행됩니다.
     * 특히 401 에러 발생 시, 토큰 갱신 로직을 트리거합니다.
     * @param {AxiosError} error - 발생한 Axios 오류 객체
     * @returns {Promise<any>} 재시도된 요청의 프로미스 또는 에러를 reject하는 프로미스
     */
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // 로그인 요청에서 발생한 401 에러는 토큰 만료가 아니므로 재발급을 시도하지 않음
        if (originalRequest.url?.includes('/auth/login')) {
            return Promise.reject(error);
        }

        if (!error.response || error.response.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        const authStore = useAuthStore();

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(token => {
                originalRequest.headers!['Authorization'] = 'Bearer ' + token;
                return apiClient(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            await authStore.refresh();
            processQueue(null, authStore.accessToken);
            return apiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError as AxiosError, null);
            authStore.logout();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default apiClient;
