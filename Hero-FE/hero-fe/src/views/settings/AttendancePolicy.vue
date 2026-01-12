<!--
  <pre>
  File Name   : SettingsWorkSystemTemplate.vue
  Description : 근태 설정 - 근무제 템플릿(Work System Template) 관리 화면
                - 템플릿 목록 조회
                - 시간/휴게시간 수정 후 일괄 저장
                - 신규 템플릿 추가

  History
    2025/12/29 (지윤) 근무제 템플릿 조회/저장 화면 최초 작성
    2026/01/07 (혜원) 신규 템플릿 추가 기능 구현
  </pre>
-->

<template>
  <div class="page-content">
    <!-- 상단 헤더 영역: 근무제 생성 + 저장 버튼 -->
    <div class="page-header">
      <button
        type="button"
        class="btn-action"
        @click="onAddTemplate"
      >
        근무제 생성
      </button>
      <button
        type="button"
        class="btn-action"
        @click="onSaveTemplates"
      >
        저장
      </button>
    </div>

    <!-- 테이블 영역 -->
    <div class="table-container">
      <table class="data-table">
          <colgroup>
    <col style="width: 100px" />
    <col /> 
    <col style="width: 180px" />
    <col style="width: 180px" />
    <col style="width: 180px" />
  </colgroup>
        <thead>
          <tr>
            <th class="w-100">정책 번호</th>
            <th>근무제명</th>
            <th class="w-140">시작</th>
            <th class="w-140">종료</th>
            <th class="w-160">휴게시간(분)</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="row in localTemplates"
            :key="row.workSystemTemplateId"
          >
            <!-- 정책 번호 -->
            <td class="policy-id">
              {{ row.workSystemTemplateId > 0 ? row.workSystemTemplateId : '-' }}
            </td>

            <!-- 근무제명(사유) -->
            <td>
              <input
                v-model="row.reason"
                type="text"
                class="input-text"
                placeholder="예) 기본 고정 근무제"
              />
            </td>

            <!-- 시작 시간 -->
            <td>
              <input
                v-model="row.startTimeHHmm"
                type="time"
                class="input-time"
              />
            </td>

            <!-- 종료 시간 -->
            <td>
              <input
                v-model="row.endTimeHHmm"
                type="time"
                class="input-time"
              />
            </td>

            <!-- 휴게 시간(분) -->
            <td>
              <input
                v-model.number="row.breakMinMinutes"
                type="number"
                min="0"
                step="5"
                class="input-number"
                placeholder="60"
              />
            </td>
          </tr>

          <!-- 데이터 없음 -->
          <tr v-if="localTemplates.length === 0">
            <td
              colspan="5"
              class="no-data"
            >
              등록된 근무제가 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import {
  settingsAttendanceApi,
  type WorkSystemTemplateResponse,
  type WorkSystemTemplateUpsertRequest,
} from '@/api/settings/settings-attendance.api';

/**
 * 화면에서 사용하는 근무제 템플릿 행(Row) 타입
 * - 시간 필드는 "HH:mm" 포맷으로 관리
 */
interface WorkSystemTemplateRow {
  workSystemTemplateId: number; // 음수면 신규, 0 이상이면 기존 템플릿
  workSystemTypeId: number;
  reason: string;
  startTimeHHmm: string; // 예: "09:00"
  endTimeHHmm: string;   // 예: "18:00"
  breakMinMinutes: number;
}

/* =========================
   로컬 상태
   ========================= */
const localTemplates = ref<WorkSystemTemplateRow[]>([]);
let newTemplateIdCounter = -1; // 신규 템플릿 임시 ID (음수로 구분)

/* =========================
   시간 포맷 변환 유틸
   ========================= */

/**
 * "HH:mm:ss" → "HH:mm" 포맷으로 변환
 */
const toHHmm = (time: string): string => {
  if (!time) {
    return '';
  }
  return time.length >= 5 ? time.slice(0, 5) : time;
};

/**
 * "HH:mm" → "HH:mm:ss" 포맷으로 변환
 */
const toHHmmss = (time: string): string => {
  if (!time) {
    return '00:00:00';
  }
  return time.length === 5 ? `${time}:00` : time;
};

/* =========================
   템플릿 조회
   ========================= */

/**
 * 근무제 템플릿 목록 조회
 * - API 응답(초 단위 시간)을 화면용 "HH:mm" 포맷으로 매핑
 */
const fetchTemplates = async (): Promise<void> => {
  try {
    const list: WorkSystemTemplateResponse[] =
      await settingsAttendanceApi.listWorkSystemTemplates();

    localTemplates.value = (list ?? []).map((template) => ({
      workSystemTemplateId: template.workSystemTemplateId,
      workSystemTypeId: template.workSystemTypeId,
      reason: template.reason ?? '',
      startTimeHHmm: toHHmm(template.startTime),
      endTimeHHmm: toHHmm(template.endTime),
      breakMinMinutes: Number.isFinite(template.breakMinMinutes)
        ? template.breakMinMinutes
        : 0,
    }));
  } catch (error) {
    console.error('[fetchTemplates] 근무제 목록 조회 실패:', error);
    localTemplates.value = [];
    window.alert('근무제 목록 조회에 실패했습니다.');
  }
};

onMounted(() => {
  void fetchTemplates();
});

/* =========================
   템플릿 추가
   ========================= */

/**
 * 신규 근무제 템플릿 추가
 */
const onAddTemplate = (): void => {
  const newTemplate: WorkSystemTemplateRow = {
    workSystemTemplateId: newTemplateIdCounter--, // 음수로 신규 구분
    workSystemTypeId: 1, // 기본값
    reason: '',
    startTimeHHmm: '09:00',
    endTimeHHmm: '18:00',
    breakMinMinutes: 60,
  };
  
  localTemplates.value.push(newTemplate);
};

/* =========================
   저장 처리
   ========================= */

/**
 * 근무제 템플릿 저장(업서트)
 * - 간단한 유효성 검증 후 API 호출
 */
const onSaveTemplates = async (): Promise<void> => {
  try {
    // 간단 검증
    for (const row of localTemplates.value) {
      if (!row.reason?.trim()) {
        window.alert('근무제명(사유)을 입력해 주세요.');
        return;
      }
      if (!row.startTimeHHmm || !row.endTimeHHmm) {
        window.alert('시작/종료 시간을 모두 입력해 주세요.');
        return;
      }
      if (row.breakMinMinutes < 0) {
        window.alert('휴게시간은 0분 이상이어야 합니다.');
        return;
      }
    }

    const payload: WorkSystemTemplateUpsertRequest[] = localTemplates.value.map(
      (row) => ({
        workSystemTemplateId:
          row.workSystemTemplateId < 0 ? null : row.workSystemTemplateId,
        workSystemTypeId: row.workSystemTypeId,
        reason: row.reason,
        startTime: toHHmmss(row.startTimeHHmm),
        endTime: toHHmmss(row.endTimeHHmm),
        breakMinMinutes: row.breakMinMinutes,
      }),
    );

    await settingsAttendanceApi.upsertWorkSystemTemplates(payload);

    window.alert('근무제 설정이 저장되었습니다.');
    await fetchTemplates();
  } catch (error) {
    console.error('[onSaveTemplates] 근무제 설정 저장 실패:', error);
    window.alert('근무제 설정 저장에 실패했습니다.');
  }
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 24px 24px 0;
  margin-bottom: 20px;
}

.btn-action {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: #ffffff;
  border: none;
  height: 40px;
  padding: 0 15px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}

.btn-action:hover {
  background-color: #162456;
}

.page-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
  overflow-y: auto;
  height: calc(100vh - 300px);
  border: 1px solid #e2e8f0;
  background: #ffffff;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  table-layout: fixed;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
}

.input-text,
.input-time,
.input-number {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  border: 2px solid #cad5e2;
  background: #ffffff;
  box-sizing: border-box;
  margin: 0;
  vertical-align: middle;
}

.text-center {
  text-align: center;
}

.no-data {
  padding: 40px 0;
  text-align: center;
  color: #94a3b8;
}

.w-140 {
  width: 140px;
}

.w-160 {
  width: 160px;
}

.policy-id {
  width: 100px;
  text-align: center;
  vertical-align: middle;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.data-table th,
.data-table td {
  vertical-align: middle;
}

 .w-100 {
   width: 100px;
 }
</style>