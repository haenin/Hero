/*
    <pre>
    (File=>TypeScript) Name   : auth.ts
    Description : Pinia를 사용한 전역 인증 상태 관리 스토어입니다.
                - 액세스 토큰과 사용자 정보(JWT 페이로드)를 상태로 관리
                - 로그인, 로그아웃, 토큰 갱신(refresh) 액션 제공
                - JWT 디코딩을 통해 사용자 정보 추출

    History
    2025/12/11 - 승건 최초 작성
    2025/12/12 - 동근 세션 스토어와 연동, 토큰 갱신 시 세션 타이머 리셋 기능 추가
    2025/12/16 - 혜원 employeeId 게터 추가, 리턴 값에 포함, number 타입 지정
    </pre>
    
    @author 승건
    @version 1.0
*/
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';
import { useSessionStore } from '@/stores/session';

// JWT 페이로드의 타입을 정의합니다.
// 서버에서 실제 보내주는 토큰의 내용(클레임)과 일치해야 합니다.
interface JwtPayload {
    exp: number;             // 토큰 만료 시간
    iat: number;             // 토큰 발급 시간
    employeeId: number;      // DB 사원 정보 인조키
    employeeNumber: string;  // 사원 번호
    employeeName: string;    // 사용자 이름
    departmentId: number;    // DB 부서 정보 인조키
    departmentName: string;  // 부서명
    gradeId: number;         // DB 직급 정보 인조키
    gradeName: string;       // 직급명
    jobTitleId: number;      // DB 직책 정보 인조키
    jobTitleName: string;    // 직책명
    imagePath: string        // 프로필 이미지 경로
    auth: string[];            // 권한
}

export const useAuthStore = defineStore('auth', () => {
    // 상태 (State): 액세스 토큰과 사용자 정보를 저장합니다.
    const accessToken = ref<string | null>(null);
    const user = ref<JwtPayload | null>(null);

    // employeeId getter 추가
    const employeeId = computed(() => user.value?.employeeId ?? null);

    // 게터 (Getters): 인증 여부를 쉽게 확인할 수 있는 계산된 속성입니다.
    const isAuthenticated = computed(() =>
        !!accessToken.value && !!user.value);

    // 액션 (Actions)

    /**
     * (설명 : )로그인 성공 시 호출됩니다.
     * 액세스 토큰을 받아 상태를 설정하고, 토큰에서 사용자 정보를 추출합니다.
     * @param {string} token - 서버로부터 받은 JWT 액세스 토큰
     * @returns {void}
     */
    function login(token: string) {
        try {
            accessToken.value = token;
            const decoded = jwtDecode<any>(token);

            // auth가 쉼표로 구분된 단일 문자열로 넘어오는 경우, 각 권한을 분리하여 배열로 변환합니다.
            if (decoded.auth && typeof decoded.auth === 'string') {
                decoded.auth = decoded.auth.split(',');
            }
            user.value = decoded as JwtPayload;

            //로그인 성공 시 세션 시작
            const sessionStore = useSessionStore();
            sessionStore.startSession();
        } catch (error) {
            console.error('토큰 디코딩 또는 로그인 처리 중 오류 발생:', error);
            logout(); // 문제가 생기면 안전하게 로그아웃 처리
        }
    }

    /**
     * (설명 : )로그아웃 시 호출되며, 모든 인증 관련 상태를 초기화합니다.
     * @returns {void}
     */
    async function logout() {
        const sessionStore = useSessionStore(); // 세션 정리용
        // 서버에 로그아웃을 요청하여 서버 측 세션/토큰을 무효화합니다.
        try {
            const apiClient = (await import('@/api/apiClient')).default;
            await apiClient.post('/auth/logout');
            console.log('서버 로그아웃 요청 성공');
        } catch (error) {
            console.error('서버 로그아웃 요청 실패:', error);
            // API 요청이 실패하더라도 클라이언트에서는 로그아웃을 계속 진행합니다.
        } finally {
            // 클라이언트 측 상태(토큰, 사용자 정보)를 모두 초기화합니다.
            accessToken.value = null;
            user.value = null;
            //타이머 종료 (중복&메모리 누수 방지)
            sessionStore.stopSession();
        }
    }

    /**
     * (설명 : )세션을 복원하거나 액세스 토큰을 갱신합니다.
     * HttpOnly 쿠키에 있는 리프레시 토큰을 사용하여 서버에 새 액세스 토큰을 요청합니다.
     * @returns {Promise<void>}
     */
    async function refresh() {
        try {
            // apiClient를 함수 내에서 동적으로 가져와 순환 참조 문제를 방지합니다.
            const apiClient = (await import('@/api/apiClient')).default;

            const response = await apiClient.post('/auth/refresh');

            // 응답 본문에 새로운 액세스 토큰이 있는지 확인합니다.
            const newAccessToken = response.data?.data?.accessToken;
            if (newAccessToken) {
                // 새 토큰으로 로그인 상태를 업데이트합니다.
                login(newAccessToken);

                // 토큰 갱신 성공 = 활동으로 간주 (세션 리셋)
                const sessionStore = useSessionStore();
                sessionStore.refreshSession();
            } else {
                throw new Error('Refresh response does not contain a new access token.');
            }
        } catch (error) {
            // 호출한 쪽(예: 네비게이션 가드)에서 이 에러를 받아 로그인 페이지로 리디렉션할 수 있습니다.
            throw error;
        }
    }


    /**
     * (설명 : )사용자가 특정 권한을 가지고 있는지 확인합니다.
     * @param {string} role - 확인할 권한 (예: 'ROLE_ADMIN')
     * @returns {boolean}
     */
    function hasRole(role: string): boolean {
        return user.value?.auth?.includes(role) ?? false;
    }

    function hasAnyRole(roles: string[]): boolean {
        return roles.some((role) => user.value?.auth?.includes(role));
    }

    return { accessToken, user, isAuthenticated, employeeId, login, logout, refresh, hasRole, hasAnyRole };
});
