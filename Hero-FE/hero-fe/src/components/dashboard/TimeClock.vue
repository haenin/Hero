<!-- 
  <pre>
  Component Name : TimeClock
  Description : 출퇴근 타각 컴포넌트
                - 출근/퇴근 버튼 UI 및 이벤트 발생
                - 주간 근무시간 도넛 차트 표시 (법정 52시간 기준)
                - 휴식시간 표시 추가
                - 버튼 활성화/비활성화 로직 (출근 전/후 상태 관리)
 
  History
  2025/12/26 (혜원) 최초 작성
  2026/01/06 (혜원) 디자인 수정
  2026/01/07 (혜원) 휴식시간 표시 및 차트 크기 조정
  </pre>
 
  @author 혜원
  @version 1.1
-->
<template>
  <section class="card main-attendance-card">
    <div class="card-header">
      <h3>근태현황</h3>
      <div class="recent-time">
        <span class="current-date">{{ currentDateTime }}</span>
      </div>
    </div>

    <!-- 출근/퇴근 버튼 -->
    <div class="punch-group-row">
      <!-- 출근 버튼: 출근 전에만 활성화 -->
      <button 
        class="btn-punch in" 
        :disabled="!!todayAttendance?.startTime"
        :class="{ disabled: !!todayAttendance?.startTime }"
        @click="handlePunchIn"
      >
        <div class="btn-icon-box primary">
          <img 
            src="/images/home-check.svg" 
            alt="출근" 
            class="btn-icon-img" 
          />
        </div>
        <div class="btn-text">
          <span class="guide">
            {{ todayAttendance?.endTime ? '오늘 업무 종료' :
               todayAttendance?.startTime ? '출근 완료' : '오늘도 힘내봅시다' }}
          </span>
          <strong class="action-label">출근하기</strong>
        </div>
      </button>

      <!-- 퇴근 버튼: 출근 후 & 퇴근 전에만 활성화 -->
      <button 
        class="btn-punch out" 
        :disabled="!todayAttendance?.startTime || !!todayAttendance?.endTime"
        :class="{ disabled: !todayAttendance?.startTime || !!todayAttendance?.endTime }"
        @click="handlePunchOut"
      >
        <div class="btn-icon-box gray">
          <img 
            src="/images/home-out.svg" 
            alt="퇴근" 
            class="btn-icon-img" 
          />
        </div>
        <div class="btn-text">
          <span class="guide">
            {{ !todayAttendance?.startTime ? '먼저 출근해주세요' : 
               todayAttendance?.endTime ? '퇴근 완료' : '수고하셨습니다' }}
          </span>
          <strong class="action-label">퇴근하기</strong>
        </div>
      </button>
    </div>

    <!-- 휴식시간 표시 (피그마 디자인) -->
    <div class="break-time-section">
      <div class="break-time-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="#90A1B9" stroke-width="1.5"/>
          <path d="M10 6V10L13 13" stroke="#90A1B9" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="break-time-label">휴식시간</span>
      <span class="break-time-value">{{ breakTimeMinutes }}시간</span>
    </div>

    <!-- 주간 근무시간 도넛 차트 (법정 52시간 기준) -->
    <div class="chart-section">
      <div class="chart-container">
        <!-- key를 weeklyWorkHours로 설정하여 데이터 변경 시 차트 리렌더링 -->
        <Doughnut 
          :key="weeklyWorkHours"
          :data="chartData" 
          :options="chartOptions" 
        />
        <!-- 차트 중앙에 근무시간 표시 -->
        <div class="chart-center-text">
          <span class="hours-val">{{ weeklyWorkHours.toFixed(1) }}</span>
          <span class="unit-val">시간</span>
        </div>
      </div>
      <div class="progress-footer">
        <span class="active-text">{{ weeklyWorkHours.toFixed(1) }}시간 근무</span>
        <span class="muted-text">/ 52시간</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { ClockStatusDTO } from '@/types/dashboard/dashboard.types';

ChartJS.register(ArcElement, Tooltip, Legend);

// Props
interface Props {
  currentDateTime: string;                  // 현재 날짜/시간 문자열
  todayAttendance: ClockStatusDTO | null;   // 오늘 출퇴근 상태
  weeklyWorkHours: number;                  // 이번 주 총 근무시간
  breakTimeMinutes?: number;                // 휴게시간 (분) - 기본값 60분
}

const props = withDefaults(defineProps<Props>(), {
  breakTimeMinutes: 60
});

// Emits
const emit = defineEmits<{
  punchIn: [];    // 출근 버튼 클릭 이벤트
  punchOut: [includeBreak: boolean];   // 퇴근 버튼 클릭 이벤트 (휴게시간 포함 여부)
}>();

// 법정 주 근무시간 (주 52시간 기준)
const LEGAL_WEEKLY_HOURS = 52;

/**
 * 도넛 차트 데이터
 * - 실제 근무시간 vs 남은 시간 비율 표시
 * - 파란색(#1E3A8A): 근무 완료 시간
 * - 회색(#E2E8F0): 남은 시간
 */
const chartData = computed(() => ({
  datasets: [{
    data: [
      props.weeklyWorkHours, 
      Math.max(0, LEGAL_WEEKLY_HOURS - props.weeklyWorkHours)
    ],
    backgroundColor: ['#1E3A8A', '#E2E8F0'],
    borderWidth: 0,
    cutout: '85%'  // 도넛 중앙 구멍 크기 (85%)
  }]
}));

/**
 * 차트 옵션
 * - 범례 숨김
 * - 툴팁 비활성화
 */
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false }
  }
};

/**
 * 출근 버튼 클릭 핸들러
 * - 부모 컴포넌트로 punchIn 이벤트 발생
 */
const handlePunchIn = () => emit('punchIn');

/**
 * 현재 시간이 오후 1시 이후인지 확인
 * @returns {boolean} 오후 1시 이후면 true
 */
const isAfter1PM = (): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  return currentHour >= 13; // 13시(오후 1시) 이후
};

/**
 * 퇴근 버튼 클릭 핸들러
 * - 오후 1시 이전: "퇴근시간이 아닙니다. 퇴근하시겠습니까?" 경고
 * - 오후 1시 이후: "퇴근하시겠습니까?" 확인
 * - 확인 시 휴게시간 포함 여부를 함께 전달
 */
const handlePunchOut = () => {
  const after1PM = isAfter1PM();
  
  let confirmMessage: string;
  if (after1PM) {
    confirmMessage = '퇴근하시겠습니까?';
  } else {
    confirmMessage = '퇴근시간이 아닙니다.\n퇴근하시겠습니까?';
  }
  
  if (confirm(confirmMessage)) {
    // 오후 1시 이후면 휴게시간을 차감해야 함 (true)
    // 오후 1시 이전이면 휴게시간 차감 안함 (false)
    emit('punchOut', after1PM);
  }
};
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 11.25px;
  border: 2px solid #E2E8F0;
  padding: 10px 29px;
  box-shadow: 0px 1px 2px -1px rgba(0, 0, 0, 0.10);
}

.main-attendance-card {
  min-height: 650px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.recent-time {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-date {
  color: #90A1B9;
  font-size: 14px;
  white-space: nowrap;
}

.punch-group-row {
  display: flex;
  gap: 18px;
  margin-bottom: 20px;
  width: 100%;
}

.btn-punch {
  flex: 1;
  height: 120px;
  border: none;
  border-radius: 11.25px;
  background: #F8FAFC;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 30px;
  cursor: pointer;
  gap: 20px;
  transition: all 0.2s ease;
}

.btn-punch:hover:not(.disabled) {
  background: #EFF6FF;
}

.btn-punch.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-punch.out:not(.disabled) {
  background: #F1F5F9;
}

.btn-punch.out:not(.disabled) .btn-icon-box.gray {
  background: #45556C;
}

.btn-punch.out:not(.disabled) .action-label {
  color: #45556C;
}

.btn-punch.out:not(.disabled):hover {
  background: #E2E8F0;
}

.btn-icon-box {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-icon-box.primary {
  background: #1E3A8A;
}

.btn-icon-box.gray {
  background: #90A1B9;
}

.btn-icon-img {
  width: 32px;
  height: 32px;
  filter: brightness(0) invert(1);
}

.btn-text {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.btn-text .guide {
  font-size: 14px;
  color: #62748E;
  margin-bottom: 4px;
}

.btn-text .action-label {
  font-size: 24px;
  color: #45556C;
  font-weight: 700;
}

/* 휴식시간 섹션 (피그마 디자인) */
.break-time-section {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #F8FAFC;
  border-radius: 8px;
  margin-bottom: 24px;
}

.break-time-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.break-time-label {
  font-size: 14px;
  color: #62748E;
  flex: 1;
}

.break-time-value {
  font-size: 16px;
  font-weight: 600;
  color: #1E3A8A;
}

.chart-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 차트 크기 축소 (220px → 180px) */
.chart-container {
  width: 180px;
  height: 180px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-center-text {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 폰트 크기도 비례해서 축소 */
.hours-val {
  font-size: 32px;
  font-weight: 700;
  color: #1C398E;
}

.unit-val {
  font-size: 14px;
  color: #90A1B9;
  margin-top: -4px;
}

.progress-footer {
  margin-top: 24px;
}

.active-text {
  color: #1C398E;
  font-weight: 600;
  font-size: 14px;
}

.muted-text {
  color: #90A1B9;
  font-size: 14px;
}
</style>