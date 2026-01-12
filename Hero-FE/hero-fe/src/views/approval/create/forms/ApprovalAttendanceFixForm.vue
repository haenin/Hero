<!--
  * <pre>
  * Vue Name        : ApprovalAttendanceFixForm.vue
  * Description     : 지연출근 보고서
  *
  * 컴포넌트 연계
  *  - 부모 컴포넌트: ApprovalCreateCommonForm.vue
  *
  * History
  * 2025/12/10 (민철) 최초 작성
  * 2025/12/14 (민철) 공통 컴포넌트화
  * 2025/12/23 (민철) 파일명 변경
  * 2025/12/30 (민철) readonly 모드 지원 추가 (작성용/조회용 통합)
  * 2025/12/30 (민철) 모두 지원하도록 수정
  * 2025/12/30 (민철) Watch 최적화, Computed 적용, 서식명 변경 근태기록수정신청서 -> 지연출근신청서
  * 2026/01/06 (민철) 주석 제거
  * 2026/01/06 (민철) 외부 스타일 시트 방식 적용
  * </pre>
  *
  * @module approval
  * @author 민철
  * @version 4.0
-->
<template>
  <div class="detail-form-section">
    <div v-if="activePicker" class="overlay-backdrop" @click="closePicker"></div>

    <div class="form-row">
      <div class="row-label">
        <span class="label-text">정정신청정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">

          <div class="input-group-row mt-20">
            <div class="input-group col-half">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/vacation.svg" alt="date" />
                <span class="label-text">정정일자 {{ readonly ? '' : '*' }}</span>
              </div>

              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formatReadOnlyDate(formData.targetDate) }}</span>
              </div>

              <div v-else class="date-input-box">
                <input type="date" v-model="formData.targetDate" class="native-input" required />
              </div>
            </div>

            <div class="input-group col-half relative-box">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/clock.svg" alt="time" />
                <span class="label-text">정정출근시간 {{ readonly ? '' : '*' }}</span>
              </div>

              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formatReadOnlyTime(formData.correctedStart) }}</span>
              </div>

              <div v-else class="date-input-box pointer" :class="{ 'active-border': activePicker === 'start' }"
                @click="openPicker('start')">
                <span :class="formData.correctedStart ? 'text-value' : 'placeholder-text'">
                  {{ formData.correctedStart || '00:00' }}
                </span>
              </div>

              <div v-if="activePicker === 'start'" class="time-picker-dropdown">
                <div class="time-column">
                  <div v-for="h in hours" :key="h" class="time-cell" @click.stop="updateTime('start', 'hour', h)">
                    <span :class="{ 'selected-text': getHour(formData.correctedStart) === h }">{{ h }}</span>
                  </div>
                </div>
                <div class="time-column border-left">
                  <div v-for="m in minutes" :key="m" class="time-cell" @click.stop="updateTime('start', 'minute', m)">
                    <span :class="{ 'selected-text': getMinute(formData.correctedStart) === m }">{{ m }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="input-group col-half relative-box">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/clock.svg" alt="time" />
                <span class="label-text">정정퇴근시간 {{ readonly ? '' : '*' }}</span>
              </div>

              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formatReadOnlyTime(formData.correctedEnd) }}</span>
              </div>

              <div v-else class="date-input-box pointer" :class="{ 'active-border': activePicker === 'end' }"
                @click="openPicker('end')">
                <span :class="formData.correctedEnd ? 'text-value' : 'placeholder-text'">
                  {{ formData.correctedEnd || '00:00' }}
                </span>
              </div>

              <div v-if="activePicker === 'end'" class="time-picker-dropdown">
                <div class="time-column">
                  <div v-for="h in hours" :key="h" class="time-cell" @click.stop="updateTime('end', 'hour', h)">
                    <span :class="{ 'selected-text': getHour(formData.correctedEnd) === h }">{{ h }}</span>
                  </div>
                </div>
                <div class="time-column border-left">
                  <div v-for="m in minutes" :key="m" class="time-cell" @click.stop="updateTime('end', 'minute', m)">
                    <span :class="{ 'selected-text': getMinute(formData.correctedEnd) === m }">{{ m }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="form-row border-top">
      <div class="row-label label-bottom">
        <span class="label-text">사유</span>
      </div>
      <div class="row-content reason-content">
        <div v-if="readonly" class="readonly-textarea">
          <span class="value-text">{{ formData.reason || '-' }}</span>
        </div>
        <textarea v-else v-model="formData.reason" class="input-textarea" placeholder="사유를 입력하세요"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';

const props = defineProps<{
  modelValue?: ModifyWorkRecordFormData;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ModifyWorkRecordFormData];
}>();

export interface ModifyWorkRecordFormData {
  targetDate: string;      // YYYY-MM-DD
  correctedStart: string;  // HH:mm
  correctedEnd: string;    // HH:mm
  reason: string;
}

const formData = reactive<ModifyWorkRecordFormData>({
  targetDate: props.modelValue?.targetDate || '',
  correctedStart: props.modelValue?.correctedStart || '09:00',
  correctedEnd: props.modelValue?.correctedEnd || '18:00',
  reason: props.modelValue?.reason || ''
});

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal);
  }
}, { deep: true });

watch(formData, (newVal) => {
  if (!props.readonly) {
    emit('update:modelValue', { ...newVal });
  }
}, { deep: true });


const activePicker = ref<'start' | 'end' | null>(null);
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const openPicker = (type: 'start' | 'end') => {
  if (props.readonly) return;
  activePicker.value = type;
};

const closePicker = () => {
  activePicker.value = null;
};

const getHour = (timeStr: string) => timeStr ? timeStr.split(':')[0] : '09';
const getMinute = (timeStr: string) => timeStr ? timeStr.split(':')[1] : '00';

const updateTime = (type: 'start' | 'end', unit: 'hour' | 'minute', value: string) => {
  const targetKey = type === 'start' ? 'correctedStart' : 'correctedEnd';
  const currentVal = formData[targetKey] || (type === 'start' ? '09:00' : '18:00');

  let [h, m] = currentVal.split(':');

  if (unit === 'hour') h = value;
  else m = value;

  formData[targetKey] = `${h}:${m}`;
};

const formatReadOnlyDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const formatReadOnlyTime = (time: string) => {
  if (!time) return '-';
  const [hour, minute] = time.split(':');
  return `${hour}시 ${minute}분`;
};

</script>

<style scoped>
@import '@/assets/styles/approval/approval-attendancefix.css';
</style>