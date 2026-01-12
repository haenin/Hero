<!-- 
  <pre>
  Component Name : MonthlySummary
  Description : 이번 달 요약 통계 컴포넌트
                - 근무일수, 남은 연차, 사용 휴가 3가지 통계 표시
                - 아이콘과 함께 시각적으로 정보 제공
 
  History
  2025/12/26 (혜원) 최초 작성
  2026/01/06 (혜원) 디자인 수정
  </pre>
 
  @author 혜원
  @version 1.0
-->
<template>
  <section class="card">
    <h3 class="card-title-blue">이번 달 요약</h3>
    <!-- 3개 그리드로 통계 표시 -->
    <div class="grid-3">
      <div 
        v-for="m in summary" 
        :key="m.label" 
        class="summary-box"
      >
        <!-- 아이콘 -->
        <div class="summary-icon">
          <img 
            :src="m.image" 
            :alt="m.label" 
            class="summary-icon-img" 
          />
        </div>
        <!-- 값 (예: 23일) -->
        <div class="summary-val">{{ m.value }}</div>
<!-- 라벨 + 서브라벨 -->
<div class="summary-label-row">
  <span class="summary-lab">{{ m.label }}</span>
  <span class="summary-sub">{{ m.sub }}</span>
</div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 요약 통계 아이템 인터페이스
 */
interface SummaryItem {
  label: string;   // 라벨 (예: 일수, 잔여, 사용)
  value: string;   // 값 (예: 23일, 8일, 7.5일)
  sub: string;     // 서브 라벨 (예: 근무, 연차, 휴가)
  image: string;   // 아이콘 이미지 경로
}

interface Props {
  summary: SummaryItem[];  // 3개 요약 통계 배열
}

defineProps<Props>();
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 11.25px;
  border: 2px solid #E2E8F0;
  padding: 10px 29px 29px 29px;
  box-shadow: 0px 1px 2px -1px rgba(0, 0, 0, 0.10);
}

.card-title-blue {
  color: #1C398E;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.summary-box {
  background: #F8FAFC;
  border: 2px solid #E2E8F0;
  border-radius: 11.25px;
  padding: 25px;
  text-align: center;
}

.summary-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  margin-bottom: -1px;
  justify-content: center;
}

.summary-icon-img {
  width: 70%;
  height: 70%;
}

.summary-val {
  font-size: 26px;
  font-weight: 700;
  color: #1C398E;
  margin-bottom: 5px;
}
</style>