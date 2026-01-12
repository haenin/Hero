<!--
 * <pre>
 * Vue Name        : App.vue
 * Description     : HERO 프론트엔드 최상위 레이아웃 컴포넌트
 *
 * 기능
 *  - 공통 헤더 / 사이드바 / 푸터 레이아웃 구성
 *  - 페이지 전환 시 세션 타이머 갱신 (SessionStore 연동)
 *
 * Layout
 *  - 헤더(TheHeader) : 상단 공통 네비게이션 영역
 *  - 사이드바(TheSidebar) : 좌측 도메인 메뉴
 *  - 메인(main-content) : 라우터 뷰 영역 (페이지 컨텐츠)
 *  - 푸터(TheFooter) : 하단 공통 정보 영역
 *
 * History
 *   2025/11/28 - 승건 최초 작성
 *   2025/12/08 - 승민 레이아웃 디자인 수정
 *   2025/12/10 - 민철 main-content 스타일 수정
 *   2025/12/11 - 동근 세션 타이머 연동 추가
 * </pre>
 *
 * @module app-root
 * @author 승건
 * @version 1.3
-->


<template>
  <div id="app">
    <template v-if="!route.meta.hiddenLayout">
      <TheHeader />
      <div class="layout-body">
        <TheSidebar />
        <main class="main-content">
          <router-view />
        </main>
      </div>
      <TheFooter />
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script setup lang="ts">
import TheHeader from '@/components/layout/TheHeader.vue';
import TheFooter from '@/components/layout/TheFooter.vue';
import TheSidebar from '@/components/layout/TheSidebar.vue';
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from "vue-router";
import { useSessionStore } from "@/stores/session";
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification/notification.store';

// 현재 라우트 및 세션 스토어 (route.fullPath 변화를 감지하여 세션을 연장)
const route = useRoute();
const session = useSessionStore();

const authStore = useAuthStore(); 
const notificationStore = useNotificationStore();

// 최초 진입 시 세션 타이머 시작 & WebSocket 연결
onMounted(() => {
  session.startSession();
  
  // 인증된 사용자면 WebSocket 연결
  if (authStore.isAuthenticated) {  
    notificationStore.connectWebSocket();
  }
});

// 페이지 전환 시 세션 갱신
watch(
  () => route.fullPath,
  () => {
    session.refreshSession();
  },
);

// 로그인/로그아웃 감지하여 WebSocket 연결/해제
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      notificationStore.connectWebSocket();
    } else {
      notificationStore.disconnectWebSocket();
    }
  }
);

// 앱 종료 시 WebSocket 연결 해제
onUnmounted(() => {
  notificationStore.disconnectWebSocket();
});

// 최초 진입 시 세션 타이머 시작됨
onMounted(() => {
  session.startSession();
});

// 페이지 전환 될 때 세션 갱신 (사용자가 화면 이동하면 세션 시간 초기화)
watch(
  () => route.fullPath,
  () => {
    session.refreshSession();
  },
);
</script>

<style>
html {
  font-size: 14px;
}
</style>

<style scoped>
#app {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f6fa;
  overflow: hidden;
}

.layout-body {
  flex: 1;
  display: flex;
  min-height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 0px;
  background: #f5f6fa;
  height: 100%;               
  min-height: 0;              
  overflow-y:hidden;
  display: flex;
  flex-direction: column;
}
</style>
