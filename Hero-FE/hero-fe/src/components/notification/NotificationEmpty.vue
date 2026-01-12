<!--
  <pre>
  Vue Name: NotificationEmpty
  Description: 알림 빈 상태 컴포넌트
               - 사용자가 받은 알림이 없을 때 표시
               - 안내 메시지와 아이콘으로 구성된 빈 화면
               - NotificationList에서 알림 개수가 0일 때 렌더링

  History
  2025/12/09 (혜원) 최초 작성
  2026/01/06 (혜원) Props 추가 - 커스텀 메시지 지원
  </pre>

  @author 최혜원
  @version 1.1
-->
<template>
  <!-- 알림 없음 상태 표시 영역 -->
  <div class="empty-state">
    <!-- 알림 아이콘 -->
    <div class="empty-icon">
      <img :src="icon" :alt="title" />
    </div>
    
    <!-- 안내 제목 -->
    <h3>{{ title }}</h3>
    
    <!-- 안내 설명 -->
    <p>{{ description }}</p>
  </div>
</template>

<script lang="ts" setup>
/**
 * Props 정의
 */
const props = withDefaults(
  defineProps<{
    icon?: string;
    title?: string;
    description?: string;
  }>(),
  {
    icon: '/images/alarm.svg',
    title: '알림이 없습니다',
    description: '새로운 알림이 도착하면 여기에 표시됩니다.'
  }
);
</script>

<style scoped>
/* 빈 상태 컨테이너 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

/* 알림 아이콘 배경 */
.empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F1F5F9;
  border-radius: 20px;
  margin-bottom: 24px;
}

.empty-icon img {
  width: 30px;
  height: 30px;
}

/* 안내 제목 스타일 */
.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

/* 안내 설명 스타일 */
.empty-state p {
  font-size: 15px;
  color: #94A3B8;
}
</style>