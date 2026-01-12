<!--
  <pre>
  Vue Name: NotificationHeader
  Description: 알림 페이지 헤더 컴포넌트
                - 뒤로가기 버튼
                - 페이지 제목 (알림)
                - 읽지 않은 알림 개수 뱃지
                - 설정 버튼

  History
  2025/12/09 (혜원) 최초 작성
  2026/01/04 (혜원) 스타일 수정
  </pre>

  @author 혜원
  @version 1.0
-->

<template>
  <!-- 헤더 영역 -->
  <header class="header">
    <div class="header-content">
      <!-- 헤더 왼쪽: 뒤로가기, 제목, 읽지 않은 알림 개수 -->
      <div class="header-left">
        <!-- 뒤로가기 버튼 -->
        <button class="back-button" type="button" @click="$emit('back')" aria-label="뒤로가기">
          <img src="/images/arrow.svg" alt="" class="back-icon" />
        </button>

        <!-- 페이지 제목 -->
        <h1 class="title">알림</h1>

        <!-- 읽지 않은 알림 개수 뱃지 -->
        <span class="unread-count" v-if="unreadCount > 0">{{ unreadCount }}</span>
      </div>

      <!-- 헤더 오른쪽: 설정 버튼 -->
      <div class="header-actions">
        <button class="icon-button" type="button" @click="$emit('settings')" aria-label="설정">
          <img src="/images/alarm/alarmsetting.svg" alt="" class="icon-img" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
/**
 * Props
 * @property {number} unreadCount - 읽지 않은 알림 개수
 */
defineProps<{
  unreadCount: number;
}>();

/**
 * Emits
 * @event back - 뒤로가기 버튼 클릭
 * @event settings - 설정 버튼 클릭
 */
defineEmits<{
  back: [];
  settings: [];
}>();
</script>

<style scoped>
/* ===== 헤더 바깥 컨테이너 ===== */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  height: 56px;                 /* 고정 높이 (튀어나옴 방지) */
  background: #fff;
  border-bottom: 1px solid #E2E8F0;
  box-sizing: border-box;
}

/* ===== 헤더 내부 레이아웃 ===== */
.header-content {
  height: 100%;                 /* 부모(56px) 안에서만 */
  padding: 0 16px;              /* 과한 padding 제거 */
  display: flex;
  align-items: center;          /* 수직 가운데 정렬 */
  justify-content: space-between;
  box-sizing: border-box;
  overflow: hidden;            
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

/* ===== 뒤로가기 버튼 ===== */
.back-button {
  width: 40px;
  height: 40px;                 /* 버튼 박스 고정 */
  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 10px;
  transition: transform 0.2s ease, background 0.2s ease;
}

.back-button:hover {
  transform: translateX(-2px);
  background: #F1F5F9;
}

.back-icon {
  width: 20px;
  height: 20px;
  display: block;               /* baseline 튐 방지 */
}

/* ===== 페이지 제목 ===== */
.title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
  letter-spacing: -0.02em;
  line-height: 1;               /* 글자 위/아래 튐 방지 */
  display: flex;
  align-items: center;
  white-space: nowrap;
}

/* ===== 읽지 않은 알림 개수 뱃지 ===== */
.unread-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 26px;
  height: 26px;
  padding: 0 10px;

  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

/* ===== 오른쪽 액션 ===== */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 설정 버튼 */
.icon-button {
  margin-left: -60px;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: #F1F5F9;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
  padding: 0;
}

.icon-button:hover {
  background: #E2E8F0;
}

.icon-img {
  width: 20px;
  height: 20px;
  display: block;               /* baseline 튐 방지 */
}

/* ===== 반응형 ===== */
@media (max-width: 768px) {
  .header {
    height: 52px;
  }

  .header-content {
    padding: 0 12px;
  }

  .title {
    font-size: 18px;
  }

  .back-button,
  .icon-button {
    width: 36px;
    height: 36px;
  }

  .back-icon,
  .icon-img {
    width: 18px;
    height: 18px;
  }
}
</style>
