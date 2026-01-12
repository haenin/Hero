<!-- 
  File Name   : Promotion.vue
  Description : 승진 관련 페이지들의 Base Layout 컴포넌트
  
  History
  2025/12/19 - [User] 최초 작성
-->
<template>
  <div class="promotion-base-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.promotion-base-container {
  width: 100%;
  height: 100%;
  /* background-color: #f8fafc; */
  box-sizing: border-box;
}
</style>