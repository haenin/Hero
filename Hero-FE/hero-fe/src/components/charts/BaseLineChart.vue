<!-- 
  <pre>
  Vue Name   : BaseLineChart.vue
  Description : 공통 Line Chart 컴포넌트
                - labels, data만 넣으면 선 그래프를 출력
                - 급여 추이, 통계 그래프 등 다양한 곳에서 재사용 가능
 
  History
  2025/12/09 - 동근 최초 작성
  </pre>
 
  @author 동근
  @version 1.0
 -->
<template>
  <div class="base-line-chart">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">

import { onMounted, onUnmounted, ref, watch } from 'vue';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

/**
 * Base Line Chart Props
 * @property {string[]} labels - x축에 표시될 레이블 목록
 * @property {number[]} data - 라인 차트에 표시될 숫자 데이터
 * @property {string} [tooltipLabelPrefix] - 툴팁 앞에 붙는 레이블 (예: '실수령액: ')
 * @property {boolean} [currency] - 숫자를 ₩ 단위의 통화 형식으로 표시할지 여부
 */
const props = defineProps<{
  labels: string[];
  data: number[];
  tooltipLabelPrefix?: string; // 툴팁 앞에 붙는 텍스트 (예: '실수령액: ')
  currency?: boolean;          // 통화 표기(₩) 여부
  color?: string;              // 선 색상
}>();

const chartRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;


/**
 * 차트를 생성/갱신하는 함수
 */
const buildChart = () => {
  if (!chartRef.value) return;

  //기존 차트가 있으면 제거 후 다시 생성
  if (chart) chart.destroy();

  chart = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels: props.labels,
      datasets: [
        {
          label: props.tooltipLabelPrefix ?? '값',
          data: props.data,
          tension: 0.3,
          fill: false,
          borderColor: props.color || '#3b82f6',
          backgroundColor: props.color || '#3b82f6',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { left: 10, right: 24, top: 10, bottom: 10 },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              const raw = context.parsed.y ?? 0;
              //통화 표시가 필요한 경우 (₩ 자동 추가 + 3자리 단위로 콤마)
              if (props.currency) {
                return `${props.tooltipLabelPrefix ?? ''}₩${Number(raw).toLocaleString()}`;
              }
              return `${props.tooltipLabelPrefix ?? ''}${raw}`;
            },
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (value) => {
              if (props.currency) {
                return `₩${Number(value).toLocaleString()}`;
              }
              return String(value);
            },
          },
        },
      },
    },
  });
};

// 컴포넌트 최초 렌더링 시 차트 생성
onMounted(buildChart);

watch(
  () => [props.labels, props.data],
  () => {
    buildChart();
  },
  { deep: true }
);

// 컴포넌트 언마운트 시 차트 메모리 해제
onUnmounted(() => {
  if (chart) chart.destroy();
});
</script>

<style scoped>
.base-line-chart {
  width: 100%;
  height: 100%;
}
.base-line-chart canvas {
  width: 100%;
  height: 100%;
}
</style>
