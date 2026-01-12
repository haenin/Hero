<!--
  <pre>
  Vue Name: NotificationItem.vue
  Description: 알림 아이템 컴포넌트
                - 알림 타입별 아이콘 표시
                - 읽음/안 읽음 상태 스타일 구분
                - 링크 버튼 클릭 시 관련 페이지 이동
                - 삭제 버튼 제공

  History
  2025/12/09 (혜원) 최초작성
  2025/12/14 (혜원) TypeScript 변환 및 타입 정의
  2025/12/16 (혜원) Notification 타입 맞춤 수정, 링크 버튼 추가
  2026/01/04 (혜원) 알림 디자인 수정
  2026/01/04 (혜원) 아이템 클릭 제거, 버튼만 클릭 가능하도록 수정
  2026/01/06 (혜원) 드롭다운 메뉴 버튼 형식으로 변경
  </pre>

  @author 혜원
  @version 2.4
-->
<template>
  <!-- 알림 아이템 최상위 컨테이너 -->
    <div
      class="notification-item"
      :class="{
        unread: !notification.isRead,
        read: notification.isRead
      }"
    >
    <!-- 알림 헤더 영역 -->
    <div class="notification-header">
      <!-- 알림 타입 아이콘 -->
      <div class="icon-wrap" :class="`icon-${notification.type}`">
        <img
          :src="getIcon(notification.type)"
          :alt="`${notification.type} 아이콘`"
          class="notification-icon"
        />
      </div>

      <!-- 알림 내용 영역 -->
      <div class="content">
        <!-- 제목 + New 배지 -->
        <div class="title-row">
          <h3 class="title">{{ notification.title }}</h3>
          <span v-if="!notification.isRead" class="new-badge">New</span>
        </div>

        <!-- 알림 메시지 -->
        <p class="description">{{ notification.message }}</p>

        <!-- 시간/날짜/링크버튼을 한 줄에 -->
        <div class="meta-row">
          <div class="meta-time">
            <div class="meta-chip">
              <img class="meta-icon" src="/images/clock.png" alt="시간" />
              <span class="time">{{ notification.timeAgo }}</span>
            </div>

            <div class="meta-chip">
              <img class="meta-icon" src="/images/calendar.svg" alt="날짜" />
              <span class="date">{{ formatDate(notification.createdAt) }}</span>
            </div>
          </div>

          <!-- 링크 버튼 -->
          <button
            v-if="notification.link"
            class="link-btn inline"
            type="button"
            @click.stop="handleViewClick"
          >
            {{ getLinkText(notification.type) }}
          </button>
        </div>
      </div>

      <!-- 더보기 메뉴 버튼 (우측 상단 고정) -->
      <div class="menu-wrapper">
        <button
          class="menu-btn"
          type="button"
          @click.stop="toggleMenu"
          title="더보기"
        >
          ⋮
        </button>

        <!-- 드롭다운 메뉴 - 2개 버튼으로 변경 -->
        <!-- 드롭다운 메뉴 - 단일 아이템 -->
<div v-if="showMenu" class="dropdown-menu">
  <button
    class="menu-item"
    type="button"
    @click.stop="handleHideClick"
  >
    이 알림 숨기기
  </button>
</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { Notification, NotificationCategory } from '@/types/notification/notification.types';

const props = defineProps<{
  notification: Notification;
}>();

const emit = defineEmits<{
  view: [notification: Notification];
  delete: [id: number];
}>();

const showMenu = ref(false);

const toggleMenu = (): void => {
  showMenu.value = !showMenu.value;
};

const handleHideClick = (): void => {
  showMenu.value = false;
  emit('delete', props.notification.notificationId);
};


const handleViewClick = (): void => {
  emit('view', props.notification);
};

const getIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    attendance: '/images/alarm/alarm-check.svg',
    payroll: '/images/alarm/alarm-money.svg',
    approval: '/images/alarm/alarm-paper.svg',
    evaluation: '/images/alarm/alarm-paper.svg',
    system: '/images/alarm/alarmsetting.svg',
  };
  return iconMap[type] || '/images/alarm/alarmsetting.svg';
};

const getLinkText = (type: NotificationCategory): string => {
  const linkTextMap: Record<NotificationCategory, string> = {
    attendance: '근태 확인하기',
    payroll: '명세서 보기',
    approval: '결재 상세보기',
    evaluation: '평가 보기',
    system: '자세히 보기',
  };
  return linkTextMap[type] || '자세히 보기';
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
};

const handleClickOutside = (event: MouseEvent): void => {
  const target = event.target as HTMLElement;
  if (!target.closest('.menu-wrapper')) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.notification-item {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  cursor: default;

  /* 읽은 알림 기본: 테두리만 */
  border: 1px solid #E2E8F0;
  transition: all 0.2s ease;
}

/* 읽은 알림(read): 테두리만 유지 + 배경 흰색 */
.notification-item.read {
  background: #fff;
  border-color: #E2E8F0;
  border-left: 1px solid #E2E8F0; /* 띠 없음 */
}

/* 새 알림(unread): 왼쪽 띠 + 배경 살짝 */
.notification-item.unread {
  background: #EFF6FF;
  border-color: #BFDBFE;
  border-left: 4px solid #3B82F6; /* 띠는 여기만 */
}

/* hover는 공통 */
.notification-header:hover {
  background: rgba(0, 0, 0, 0.02);
}


.notification-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  position: relative;
  cursor: default;
}

.notification-header:hover {
  background: rgba(0, 0, 0, 0.02);
}

.icon-wrap {
  width: 36px;
  height: 36px;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #F1F5F9;
  flex-shrink: 0;
}

.notification-icon {
  width: 20px;
  height: 20px;
}

.content {
  flex: 1;
  min-width: 0;
  padding-right: 52px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
  line-height: 1.4;
}

.notification-item.unread .title {
  font-weight: 700;
  color: #1E40AF;
}

.new-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  background: #3B82F6;
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.description {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 8px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-item.unread .description {
  color: #1E293B;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 6px;
}

.meta-time {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

.meta-icon {
  width: 14px;
  height: 14px;
  opacity: 0.7;
}

.link-btn.inline {
  padding: 8px 14px;
  background: linear-gradient(180deg, #1E3A8A 0%, #0B1B4D 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.link-btn.inline:hover {
  background: linear-gradient(180deg, #1E40AF 0%, #1E3A8A 100%);
  color: white;
}

.notification-item.unread .link-btn.inline {
  background: linear-gradient(180deg, #1E3A8A 0%, #0B1B4D 100%);
  border: none;
  color: white;
}

.notification-item.unread .link-btn.inline:hover {
  background: linear-gradient(180deg, #1E40AF 0%, #1E3A8A 100%);
  color: white;
}

.menu-wrapper {
  position: absolute;
  top: 12px;
  right: 12px;
  flex-shrink: 0;
}

.menu-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: white;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.menu-btn:hover {
  background: #F1F5F9;
  color: #64748b;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 160px;
  overflow: hidden;
}

.menu-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: white;
  color: black;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.menu-item:hover {
    background-color: #f8fafc;
}

/* 액션 버튼 공통 스타일 */
.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-icon {
  width: 16px;
  height: 16px;
}
/* 읽은 알림: 왼쪽 띠(라인)만 표시 */
.notification-item.read {
  border-left: 4px solid #1C398E ; /* 회색 라인 */
}
/* 만약 “안읽음은 띠 말고 테두리만” 원하면 위 줄 지우고 이걸로 */
 /* .notification-item.unread { border-left: 4px solid transparent; } */



/* 반응형 스타일 */
@media (max-width: 768px) {
  .notification-header {
    gap: 12px;
    padding: 12px;
  }

  .notification-icon {
    width: 18px;
    height: 18px;
  }

  .title {
    font-size: 14px;
  }

  .description {
    font-size: 13px;
  }

  .menu-btn {
    width: 24px;
    height: 24px;
    font-size: 18px;
  }

  .menu-wrapper {
    top: 8px;
    right: 8px;
  }

  .meta-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .link-btn.inline {
    width: 100%;
  }

  .new-badge {
    font-size: 10px;
    padding: 2px 6px;
  }

  .dropdown-menu {
    flex-direction: column;
    min-width: 160px;
  }

  .action-btn {
    width: 100%;
  }
}
</style>