<!--
  <pre>
  Vue Name: NotificationFilter
  Description: 알림 필터 탭 컴포넌트
               - 알림 유형별 필터링 탭 (전체, 근태, 급여, 결재, 평가, 시스템)
               - 각 탭별 읽지 않은 알림 개수 배지 표시
               - 삭제된 알림 버튼
               - 반응형 디자인: 모바일에서는 스크롤 가능한 탭

  History
  2025/12/09 (혜원) 최초 작성
  2026/01/04 (혜원) 디자인 수정
  2026/01/06 (혜원) 모두 읽음 버튼 → 삭제된 알림 버튼으로 변경
  2026/01/06 (혜원) 읽지 않음 탭 제거
  </pre>

  @author 최혜원
  @version 1.2
-->
<template>
  <!-- 필터 섹션: 탭 + 삭제된 알림 버튼 -->
  <div class="filter-section">
    <!-- 탭 컨테이너 (가로 스크롤 지원) -->
    <div class="tabs-container">
      <div class="tabs">
        <!-- 필터 탭 버튼들 (읽지 않음, 삭제된 알림 탭 제외) -->
        <button
          v-for="tab in visibleTabs"
          :key="tab.id"
          @click="$emit('update:activeTab', tab.id)"
          :class="['tab-button', { active: activeTab === tab.id }]"
        >
          {{ tab.label }}
          <!-- 읽지 않은 알림 개수 배지 (0개일 때는 숨김) -->
          <span v-if="tab.count > 0" class="badge">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <!-- 삭제된 알림 버튼 -->
      <button
      class="deleted-alarm-btn"
      :class="{ active: activeTab === 'deleted' }"
      @click="$emit('update:activeTab', 'deleted')"
    >
      <img src="/images/eye-off.svg" alt="trash" />
      숨겨진 알림
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 1. 타입 정의
/**
 * 탭 객체 타입
 * @property {string} id - 탭 고유 ID
 * @property {string} label - 탭 표시 라벨
 * @property {number} count - 해당 탭의 알림 개수
 */
interface Tab {
  id: string;
  label: string;
  count: number;
}

// 2. Props 정의
/**
 * Props
 * @property {Tab[]} tabs - 탭 목록 배열
 * @property {string} activeTab - 현재 활성화된 탭 ID
 */
const props = defineProps<{
  tabs: Tab[];
  activeTab: string;
}>();

// 3. Emits 정의
/**
 * Emits
 * @event update:activeTab - 탭 변경 이벤트 (v-model 양방향 바인딩)
 */
const emit = defineEmits<{
  'update:activeTab': [id: string];  // 탭 ID를 전달
}>();

/**
 * 읽지 않음, 삭제된 알림 탭을 제외한 탭 목록
 */
const visibleTabs = computed(() => {
  return props.tabs.filter(tab => tab.id !== 'deleted' && tab.id !== 'unread');
});
</script>

<style scoped>
* {
  font-size: 14px;
  font-family: "Inter-Regular", sans-serif;
}

/* 필터 섹션 컨테이너 */
.filter-section {
  margin: 24px auto;
  padding: 0 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

/* 탭 스크롤 컨테이너 */
.tabs-container {
  flex: 1;
  overflow-x: auto; /* 가로 스크롤 활성화 */
  -webkit-overflow-scrolling: touch; /* 모바일 부드러운 스크롤 */
}

/* 스크롤바 스타일 (Webkit 브라우저) */
.tabs-container::-webkit-scrollbar {
  height: 4px;
}

.tabs-container::-webkit-scrollbar-track {
  background: transparent;
}

.tabs-container::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 2px;
}

/* 탭 버튼 그룹 */
.tabs {
  display: flex;
  gap: 8px;
}

/* 개별 탭 버튼 */
.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 0.5px solid #E2E8F0;
  border-radius: 10px;
  color: #64748B;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap; /* 탭 텍스트 줄바꿈 방지 */
}

/* 탭 버튼 호버 효과 */
.tab-button:hover {
  border-color: #CBD5E1;
  background: #F8FAFC;
}

/* 활성화된 탭 버튼 스타일 */
.tab-button.active {
  background: linear-gradient(180deg, #1E3A8A 0%, #0B1B4D 100%); /* 전자결재 느낌 네이비 */
  border-color: transparent;
  color: #fff;
}

.tab-button.active:hover {
  filter: brightness(1.03);
}

/* 알림 개수 배지 */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 22px;
  padding: 0 8px;
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
  font-size: 13px;
  font-weight: 700;
  border-radius: 11px;
}

/* 활성 탭의 배지 스타일 */
.tab-button.active .badge {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

/* 비활성 탭의 배지 스타일 (강조를 위한 빨간색) */
.tab-button:not(.active) .badge {
  background: ghostwhite;
  color: black;
}

/* 삭제된 알림 버튼 (기존 모두 읽음 버튼 스타일 활용) */
.deleted-alarm-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: white;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  color: #64748B;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

/* 삭제된 알림 버튼 호버 효과 */
.deleted-alarm-btn:hover {
  background: #F8FAFC;
  border-color: #CBD5E1;
  color: #64748B;
}

.deleted-alarm-btn img {
  width: 18px;
  height: 18px;
}

.deleted-alarm-btn.active {
  background: linear-gradient(180deg, #1E3A8A 0%, #0B1B4D 100%);
  border-color: transparent;
  color: #fff;
}

.deleted-alarm-btn.active:hover {
  filter: brightness(1.03);
}

/* 아이콘도 하얗게 보이게 (svg/투명 png면 잘 먹음) */
.deleted-alarm-btn.active img {
  filter: brightness(0) invert(1);
  opacity: 0.95;
}

/* 태블릿 반응형 (1024px 이하) */
@media (max-width: 1024px) {
  .filter-section {
    padding-left: 24px;
    padding-right: 24px;
  }
}

/* 모바일 반응형 (768px 이하) */
@media (max-width: 768px) {
  .filter-section {
    flex-direction: column; /* 세로 배치 */
    align-items: stretch;
    padding: 0 20px;
    gap: 12px;
  }

  /* 모바일에서 삭제된 알림 버튼 전체 너비 */
  .deleted-alarm-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>