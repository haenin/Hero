<!--
  <pre>
  (File => TypeScript / Vue) Name   : EmployeeHalfChartDrawer.vue
  Description : 직원 반기 근태 Drawer 컴포넌트
                - Drawer 열고 닫기
                - 연도/반기(H1/H2) 필터
                - 직원 반기 근태 대시보드 데이터 조회
                - 요약 카드 + 월별 출근/지각/결근 차트 표시

  History
  2025/12/26 - 이지윤 최초 작성
  2026/01/02 - (지윤) 년도 필터링 부분 수정
  2026/01/06 - (지윤) 디자인 수정
  </pre>

  @author 이지윤
  @version 1.1
-->

<template>
  <!-- Drawer 오버레이 -->
  <div
    v-if="open"
    class="drawer-overlay"
    @click.self="emitClose"
  >
    <section
      class="drawer-panel"
      role="dialog"
      aria-modal="true"
    >
      <!-- 헤더 영역 -->
      <header class="drawer-header">
        <div class="drawer-title">
          <img
            class="back-icon"
            src="/images/backArrow.svg"
            alt="뒤로가기"
            @click="goBack"
          />
          <span class="title-text">직원 근태 상세</span>
        </div>
      </header>

      <!-- 직원 기본 정보 영역 -->
      <div class="employee-head">
        <div class="employee-name">
          {{ dashboard?.employeeName ?? '-' }}
        </div>
        <div class="employee-meta">
          <span>사번: {{ dashboard?.employeeNumber ?? '-' }}</span>
          <span class="dot">·</span>
          <span>사원ID: {{ dashboard?.employeeId ?? employeeId }}</span>
        </div>
      </div>

      <!-- 필터 영역 (연도 / 반기) -->
      <div class="filters">
        <div class="filter-item">
          <label class="filter-label">연도</label>
          <select
            v-model.number="selectedYear"
            class="filter-select"
            @change="fetchData"
          >
            <option
              v-for="y in yearOptions"
              :key="y"
              :value="y"
            >
              {{ y }}년
            </option>
          </select>
        </div>

        <div class="filter-item">
          <label class="filter-label">반기</label>
          <select
            v-model="selectedHalf"
            class="filter-select"
            @change="fetchData"
          >
            <option value="H1">상반기(H1)</option>
            <option value="H2">하반기(H2)</option>
          </select>
        </div>
      </div>

      <!-- ====== 반기 근태 대시보드 카드 START ====== -->
      <div class="half-dashboard-card">
        <!-- 카드 내부 헤더 -->
        <div class="half-dashboard-header">

          <div class="half-dashboard-titles">
            <div class="half-dashboard-title">
              {{ dashboard?.employeeName ?? '-' }}님의 월별 근태 현황
            </div>
            <div class="half-dashboard-subtitle">
              {{ dashboard?.employeeNumber ?? '-' }} ·
              {{ selectedYear }}년도 ·
              {{ selectedHalf === 'H1' ? '상반기' : '하반기' }}
            </div>
          </div>
        </div>

        <!-- 로딩 / 에러 상태 표시 -->
        <div
          v-if="loading"
          class="state-box"
        >
          불러오는 중...
        </div>
        <div
          v-else-if="errorMessage"
          class="state-box error"
        >
          {{ errorMessage }}
        </div>

        <template v-else>
          <!-- 요약 카드(총 출근/총 지각/총 결근) -->
          <div class="half-dashboard-summary">
            <div class="summary-mini-card">
              <div class="summary-mini-label">총 출근</div>
              <div class="summary-mini-value">
                {{ dashboard?.summary?.totalWorkDays ?? 0 }}일
              </div>
            </div>

            <div class="summary-mini-card">
              <div class="summary-mini-label">총 지각</div>
              <div class="summary-mini-value">
                {{ dashboard?.summary?.totalTardyCount ?? 0 }}회
              </div>
            </div>

            <div class="summary-mini-card">
              <div class="summary-mini-label">총 결근</div>
              <div class="summary-mini-value">
                {{ dashboard?.summary?.totalAbsenceCount ?? 0 }}회
              </div>
            </div>
          </div>

          <!-- 차트 1: 월별 출근 현황 (막대 차트) -->
          <div class="chart-block">
            <div class="chart-block-title">월별 출근 현황</div>

            <div class="chart-canvas-wrap">
              <svg
                class="chart-svg"
                :viewBox="`0 0 ${barChartW} ${barChartH}`"
                role="img"
              >
                <defs>
                  <linearGradient
                    id="workGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stop-color="#1C398E"
                    />
                    <stop
                      offset="100%"
                      stop-color="#162456"
                    />
                  </linearGradient>
                </defs>

                <!-- 플롯 영역(윤곽선만, 디자인용) -->
                <rect
                  :x="barPlot.x"
                  :y="barPlot.y"
                  :width="barPlot.w"
                  :height="barPlot.h"
                  fill="transparent"
                />

                <!-- Y축 눈금 텍스트 -->
                <g>
                  <text
                    v-for="(t, i) in barTicks"
                    :key="`barTick-${i}`"
                    class="axis-text"
                    :x="barPlot.x - 10"
                    :y="barTickY(t) + 4"
                    text-anchor="end"
                  >
                    {{ t }}
                  </text>
                </g>

                <!-- 막대 렌더링 -->
                <g>
                  <rect
                    v-for="b in bars"
                    :key="`bar-${b.month}`"
                    :x="b.x"
                    :y="b.y"
                    :width="b.w"
                    :height="b.h"
                    rx="0"
                    fill="url(#workGrad)"
                  />
                </g>

                <!-- X축 월 라벨 -->
                <g>
                  <text
                    v-for="b in bars"
                    :key="`barX-${b.month}`"
                    class="axis-text"
                    :x="b.x + b.w / 2"
                    :y="barPlot.y + barPlot.h + 18"
                    text-anchor="middle"
                  >
                    {{ b.month }}월
                  </text>
                </g>
              </svg>
            </div>
          </div>

          <!-- 차트 2: 월별 지각/결근 현황 (라인 차트) -->
          <div class="chart-block">
            <div class="chart-block-title">월별 지각/결근 현황</div>

            <div class="chart-canvas-wrap">
              <svg
                class="chart-svg"
                :viewBox="`0 0 ${lineChartW} ${lineChartH}`"
                role="img"
              >
                <!-- 플롯 영역 윤곽선 -->
                <rect
                  :x="linePlot.x"
                  :y="linePlot.y"
                  :width="linePlot.w"
                  :height="linePlot.h"
                  fill="transparent"
                  stroke="transparent"
                />

                <!-- Y축 눈금 텍스트 -->
                <g>
                  <text
                    v-for="(t, i) in lineTicks"
                    :key="`lineTick-${i}`"
                    class="axis-text"
                    :x="linePlot.x - 10"
                    :y="lineTickY(t) + 4"
                    text-anchor="end"
                  >
                    {{ t }}
                  </text>
                </g>

                <!-- 플롯 박스(노란색/빨간색 테두리, 디자인용) -->
                <rect
                  :x="linePlot.x"
                  :y="linePlot.y"
                  :width="linePlot.w"
                  :height="linePlot.h"
                  fill="transparent"
                  stroke="#EAB308"
                  stroke-width="2"
                />
                <rect
                  :x="linePlot.x"
                  :y="linePlot.y"
                  :width="linePlot.w"
                  :height="linePlot.h"
                  fill="transparent"
                  stroke="#EF4444"
                  stroke-width="2"
                  opacity="0.55"
                />

                <!-- 지각/결근 선 -->
                <path
                  :d="tardyPath"
                  fill="none"
                  stroke="#EAB308"
                  stroke-width="2"
                />
                <path
                  :d="absencePath"
                  fill="none"
                  stroke="#EF4444"
                  stroke-width="2"
                />

                <!-- 데이터 포인트 -->
                <g>
                  <circle
                    v-for="p in tardyPoints"
                    :key="`tp-${p.month}`"
                    :cx="p.x"
                    :cy="p.y"
                    r="4"
                    fill="#EAB308"
                    stroke="#EAB308"
                    stroke-width="2"
                  />
                  <circle
                    v-for="p in absencePoints"
                    :key="`ap-${p.month}`"
                    :cx="p.x"
                    :cy="p.y"
                    r="4"
                    fill="#EF4444"
                    stroke="#EF4444"
                    stroke-width="2"
                  />
                </g>

                <!-- X축 월 라벨 -->
                <g>
                  <text
                    v-for="p in xPoints"
                    :key="`lx-${p.month}`"
                    class="axis-text"
                    :x="p.x"
                    :y="linePlot.y + linePlot.h + 18"
                    text-anchor="middle"
                  >
                    {{ p.month }}월
                  </text>
                </g>
              </svg>
            </div>

            <!-- 범례 -->
            <div class="chart-legend">
              <div class="legend-item legend-absence">
                <span class="legend-line"></span>
                <span class="legend-text">결근</span>
              </div>
              <div class="legend-item legend-tardy">
                <span class="legend-line"></span>
                <span class="legend-text">지각</span>
              </div>
            </div>
          </div>
        </template>
      </div>
      <!-- ====== 반기 근태 대시보드 카드 END ====== -->
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useAttendanceEmployeeDashboardStore } from '@/stores/attendance/attendanceEmployeeDashboard';

/** 반기 타입(H1/H2) */
type HalfType = 'H1' | 'H2';

/**
 * Props 정의
 * - open       : Drawer 열림 여부
 * - employeeId : 선택된 직원 ID
 */
const props = defineProps<{
  open: boolean;
  employeeId: number | null;
}>();

/**
 * Emits 정의
 * - close : Drawer 닫기 이벤트
 */
const emit = defineEmits<{
  (e: 'close'): void;
}>();

const goBack = (): void => {
  emitClose();
};

const handleKeyDown = (e: KeyboardEvent): void => {
  if (e.key !== 'Escape') return;
  if (!props.open) return;
  emitClose();
};

/**
 * Drawer 닫기 이벤트 핸들러
 */
const emitClose = (): void => {
  emit('close');
};

/** 근태 직원 반기 대시보드 스토어 */
const store = useAttendanceEmployeeDashboardStore();

/**
 * 스토어 상태를 template에서 바로 사용할 수 있도록 참조로 변환
 */
const {
  dashboard: dashboard,
  loading,
  errorMessage,
} = storeToRefs(store);

/* =========================
   필터 상태(연도, 반기)
   ========================= */
const selectedHalf = ref<HalfType>('H1');
/** 현재 시점 기준 연도/반기 초기값 */
const now = new Date();
const selectedYear = ref<number>(now.getFullYear());

// ✅ 2025년부터 현재 연도까지만 표시
const BASE_YEAR = 2025;

const yearOptions = computed<number[]>(() => {
  const cur = now.getFullYear();
  const years: number[] = [];

  for (let y = cur; y >= BASE_YEAR; y--) {
    years.push(y);
  }

  return years;
});

/**
 * 반기 대시보드 API 호출
 * - props.employeeId, selectedYear, selectedHalf를 기준으로 조회
 */
const fetchData = async (): Promise<void> => {
  if (!props.employeeId) return;
  await store.fetchEmployeeHalfDashboard(
    props.employeeId,
    selectedYear.value,
    selectedHalf.value,
  );
};

/**
 * Drawer 열림 상태 감시
 * - open이 true가 될 때마다 최신 필터 기준으로 재조회
 */
watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      await fetchData();
      return;
    }

    window.removeEventListener('keydown', handleKeyDown);
  },
  { immediate: true },
);

/**
 * employeeId 변경 감시
 * - Drawer가 열린 상태에서 직원이 변경되면 재조회
 */
watch(
  () => props.employeeId,
  async (id) => {
    if (!props.open) return;
    if (!id) return;
    await fetchData();
  },
);

/**
 * 컴포넌트 마운트 시 초기 데이터 로딩
 * - 이미 open 상태이고 employeeId가 있는 경우에만 실행
 */

 onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

/* =========================
   그래프용 데이터 가공
   - DTO의 monthlyStats를 반기 기준(6개월) 배열로 변환
   ========================= */

type StatRow = {
  month: number;
  workDays: number;
  tardyCount: number;
  absenceCount: number;
};

/**
 * 선택된 반기(H1/H2)에 해당하는 6개월 데이터
 * - 데이터가 없으면 0으로 채워서 반환
 */
const halfStats = computed<StatRow[]>(() => {
  const stats = dashboard.value?.monthlyStats ?? [];
  const map = new Map<number, StatRow>();

  stats.forEach((s) => {
    map.set(s.month, {
      month: s.month,
      workDays: s.workDays,
      tardyCount: s.tardyCount,
      absenceCount: s.absenceCount,
    });
  });

  const months = selectedHalf.value === 'H1'
    ? [1, 2, 3, 4, 5, 6]
    : [7, 8, 9, 10, 11, 12];

  return months.map((m) =>
    map.get(m) ?? {
      month: m,
      workDays: 0,
      tardyCount: 0,
      absenceCount: 0,
    },
  );
});

/* =========================
   막대 차트(월별 출근일)
   ========================= */

const barChartW = 696;
const barChartH = 180;

const barPlot = {
  x: 65, // Y축 라벨 영역 폭
  y: 10,
  w: 626,
  h: 120,
};

/**
 * 막대 차트 최대 출근일 수 계산
 * - 0 이하일 경우 1로 보정
 */
const maxWork = computed<number>(() => {
  const m = Math.max(...halfStats.value.map((s) => s.workDays), 0);
  return m <= 0 ? 1 : m;
});

/**
 * 막대 차트 Y축 눈금 값
 * - 0 ~ maxWork를 4등분
 */
const barTicks = computed<number[]>(() => {
  const max = maxWork.value;
  const step = max / 4;
  const ticks = [0, step, step * 2, step * 3, step * 4].map((v) => Math.round(v));

  // 작은 값일 때 중복 제거
  return Array.from(new Set(ticks));
});

/**
 * Y축 눈금 값 → SVG Y좌표
 */
const barTickY = (tick: number): number => {
  const ratio = tick / maxWork.value;
  return barPlot.y + barPlot.h - ratio * barPlot.h;
};

/**
 * 막대 위치/크기 계산
 */
const bars = computed(() => {
  const data = halfStats.value;
  const n = data.length;

  const gap = 14;
  const barW = Math.floor((barPlot.w - gap * (n + 1)) / n);
  const baseY = barPlot.y + barPlot.h;

  return data.map((d, i) => {
    const x = barPlot.x + gap + i * (barW + gap);
    const h = (d.workDays / maxWork.value) * barPlot.h;
    const y = baseY - h;

    return {
      month: d.month,
      x,
      y,
      w: barW,
      h,
    };
  });
});

/* =========================
   라인 차트(월별 지각/결근)
   ========================= */

const lineChartW = 696;
const lineChartH = 180;

const linePlot = {
  x: 65,
  y: 10,
  w: 626,
  h: 120,
};

/**
 * 지각/결근 중 최대값 계산
 * - 0 이하일 경우 1로 보정
 */
const maxIssue = computed<number>(() => {
  const m = Math.max(
    ...halfStats.value.map((s) => Math.max(s.tardyCount, s.absenceCount)),
    0,
  );
  return m <= 0 ? 1 : m;
});

/**
 * 라인 차트 Y축 눈금 값
 * - 0 ~ maxIssue를 4등분
 * - max 값에 따라 소수점 자릿수 조정
 */
const lineTicks = computed<(number | string)[]>(() => {
  const max = maxIssue.value;
  const step = max / 4;

  const ticks = [0, step, step * 2, step * 3, step * 4].map((v) => {
    if (max <= 1) return Number(v.toFixed(2));
    const vv = Number(v.toFixed(1));
    return Number.isInteger(vv) ? Math.round(vv) : vv;
  });

  return Array.from(new Set(ticks));
});

/**
 * 라인 차트 Y축 눈금 값 → SVG Y좌표
 */
const lineTickY = (tick: number | string): number => {
  const t = typeof tick === 'string' ? Number(tick) : tick;
  const ratio = t / maxIssue.value;
  return linePlot.y + linePlot.h - ratio * linePlot.h;
};

/**
 * X축 월 포인트(라인 차트용) 계산
 */
const xPoints = computed(() => {
  const data = halfStats.value;
  const n = data.length;
  const step = linePlot.w / (n - 1);

  return data.map((d, i) => ({
    month: d.month,
    x: linePlot.x + i * step,
  }));
});

/**
 * 값 → SVG Y좌표 변환
 */
const toY = (value: number): number => {
  const ratio = value / maxIssue.value;
  return linePlot.y + linePlot.h - ratio * linePlot.h;
};

/**
 * 지각 데이터 포인트 좌표
 */
const tardyPoints = computed(() => {
  return halfStats.value.map((d, i) => ({
    month: d.month,
    x: xPoints.value[i].x,
    y: toY(d.tardyCount),
  }));
});

/**
 * 결근 데이터 포인트 좌표
 */
const absencePoints = computed(() => {
  return halfStats.value.map((d, i) => ({
    month: d.month,
    x: xPoints.value[i].x,
    y: toY(d.absenceCount),
  }));
});

/**
 * 포인트 배열 → SVG path 문자열로 변환
 */
const buildPath = (pts: { x: number; y: number }[]): string => {
  if (!pts.length) return '';
  return pts
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');
};

/** 지각 라인 path */
const tardyPath = computed(() => buildPath(tardyPoints.value));

/** 결근 라인 path */
const absencePath = computed(() => buildPath(absencePoints.value));
</script>


<style scoped src="@/assets/styles/attendance/employee-chart.css"></style>
