<!-- 
  <pre>
  Component Name : StatsCard
  Description : 통계 카드 공용 컴포넌트
                - 출근 통계, 휴가 현황, 결재 현황에서 재사용
                - 2가지 레이아웃 지원: table(테이블형), grid(그리드형)
 
  History
  2025/12/26 (혜원) 최초 작성
  2026/01/06 (혜원) 디자인 수정
  </pre>
 
  @author 혜원
  @version 1.0
-->
<template>
  <section class="card">
    <h3 class="card-title-blue">{{ title }}</h3>

    <!-- 테이블형 레이아웃 (출근 통계, 휴가 현황) -->
    <div v-if="type === 'table'" class="stats-table">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="stats-row"
      >
        <span class="stats-label">{{ item.label }}</span>
        <strong class="stats-value" :class="item.colorClass">
          {{ item.value }}
        </strong>
      </div>
    </div>

    <!-- 그리드형 레이아웃 (결재 현황) -->
    <div v-else-if="type === 'grid'" class="grid-3">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="summary-box"
      >
        <div class="summary-val" :class="item.colorClass">{{ item.value }}</div>
        <div class="summary-sub">{{ item.label }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 통계 아이템 인터페이스
 */
interface StatsItem {
  label: string;       // 라벨 (예: 정상 출근, 결재 대기)
  value: string;       // 값 (예: 21일, 5건)
  colorClass?: string; // 색상 클래스 (t-blue, t-green, t-red 등)
}

interface Props {
  title: string;          // 카드 제목
  type: 'table' | 'grid'; // 레이아웃 타입
  items: StatsItem[];     // 통계 아이템 배열
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

/* =========================
   테이블형 레이아웃
========================= */
.stats-table .stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;        /* 값 키워도 라벨 안 밀리게 */
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
}

.stats-label {
  font-size: 14px;
  color: #64748B;
}

.stats-value {
  font-size: 16px;            /* 값(40.0%, 2일 등)만 크게 */
  font-weight: 700;
  line-height: 1;             /* 행 높이 영향 최소화 */
}

/* =========================
   그리드형 레이아웃
========================= */
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

.summary-val {
  font-size: 30px;            /* 그리드 값도 같이 키움(원하면 26으로) */
  font-weight: 700;
  margin-bottom: 6px;
}

.summary-sub {
  font-size: 14px;
  color: #64748B;
}

/* =========================
   색상 유틸리티 클래스
========================= */
.t-blue { color: #1C398E !important; }
.t-green { color: #0D542B !important; }
.t-red { color: #82181A !important; }
.t-orange { color: #7E2A0C !important; }
.t-brown { color: #733E0A !important; }
.t-dark { color: #0F172B !important; }
</style>
