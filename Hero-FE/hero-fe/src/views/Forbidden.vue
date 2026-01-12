<template>
  <section class="error">
    <div class="box">
      <p class="code">403</p>
      <h1 class="title">접근 권한이 없습니다</h1>
      <p class="desc">
        해당 메뉴는 권한이 있는 사용자만 접근할 수 있어요.
      </p>

      <div class="actions">
        <button class="btn" @click="goHome">홈으로</button>
        <button class="btn secondary" @click="goBack">이전으로</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => router.push("/");
const goBack = () => router.back();
</script>

<style scoped>
.error {
  min-height: calc(100vh - 60px);
  display: grid;
  place-items: center;
  padding: 24px;
}

.box {
  width: 100%;
  max-width: 520px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px;
  background: #fff;
  text-align: center;
}

.code {
  font-size: 44px;
  font-weight: 800;
  margin: 0 0 6px;
  color: #162456;
}

.title {
  font-size: 20px;
  margin: 0 0 10px;
  color: #1f2933;
}

.desc {
  margin: 0 0 18px;
  color: #62748e;
  font-size: 14px;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}

.btn.secondary {
  background: #f8fafc;
}
</style>
