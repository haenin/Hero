<!--
  * <pre>
  * Vue Name        : ApprovalPayrollRaiseForm.vue
  * Description     : 급여인상신청서
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
  * 2025/12/30 (민철) Watch 최적화, Computed 적용
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
    <div class="form-row">
      <div class="row-label">
        <span class="label-text">급여인상신청정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">

          <div v-if="!readonly" class="radio-group-row">
            <span class="label-text group-title">인상액 입력 방식을 선택하세요:</span>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" value="direct" v-model="increaseType" />
                <span class="radio-text">직접 입력</span>
              </label>
              <label class="radio-label">
                <input type="radio" value="rate" v-model="increaseType" />
                <span class="radio-text">인상률로 계산</span>
              </label>
            </div>
          </div>

          <div class="input-group-row calculation-row">

            <div class="input-group col-rate">
              <span v-if="readonly" class="label-text group-title">인상률</span>
              <div class="input-box rate-box" :class="{ 'active': increaseType === 'rate' && !readonly }">

                <input v-if="!readonly && increaseType === 'rate'" type="number" class="input-invisible text-right"
                  v-model.number="formData.raisePercent" placeholder="0.0" step="0.1" min="0" />

                <span v-else class="input-invisible text-right">
                  {{ formData.raisePercent ? formData.raisePercent.toFixed(1) : '0.0' }}
                </span>

                <span class="unit-text">%</span>
              </div>
            </div>

            <div class="input-group col-salary">
              <div class="input-box salary-box disabled">
                <span class="placeholder-text">기존 기본급</span>
                <span class="input-value">{{ formatNumber(currentBaseSalary) }}</span>
                <span class="unit-text">원</span>
              </div>
            </div>

            <div class="arrow-icon">&gt;</div>

            <div class="input-group col-salary">
              <div class="input-box salary-box"
                :class="{ 'active': increaseType === 'direct' && !readonly, 'disabled': readonly }">
                <span class="placeholder-text active-placeholder">인상 후 기본급</span>

                <div class="value-wrapper">
                  <input v-if="!readonly && increaseType === 'direct'" type="text"
                    class="input-invisible text-right input-value active-value" v-model="displayAfterSalary"
                    @focus="onFocus" @blur="onBlur" placeholder="0" />

                  <span v-else class="input-value active-value text-right">
                    {{ formatNumber(formData.afterSalary) }}
                  </span>

                  <span class="unit-text active-unit">원</span>
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
        <textarea v-else v-model="formData.reason" class="input-textarea" placeholder="인상사유를 입력해 주세요."></textarea>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { useApprovalDataStore } from '@/stores/approval/approval_data.store';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  modelValue?: RaisePayrollFormData;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: RaisePayrollFormData];
}>();

export interface RaisePayrollFormData {
  raisePercent: number;
  beforeSalary: number;
  afterSalary: number;
  reason: string;
}

const approvalDataStore = useApprovalDataStore();
const { payroll } = storeToRefs(approvalDataStore);

onMounted(async () => {
  if (!payroll.value) {
    await approvalDataStore.fetchPayroll();
  }
});

const increaseType = ref<'direct' | 'rate'>('rate');

const formData = reactive<RaisePayrollFormData>({
  raisePercent: props.modelValue?.raisePercent || 0,
  beforeSalary: props.modelValue?.beforeSalary || 0,
  afterSalary: props.modelValue?.afterSalary || 0,
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


const currentBaseSalary = computed(() => {
  if (props.modelValue?.beforeSalary) {
    return props.modelValue.beforeSalary;
  }

  const storeVal = payroll.value?.beforePayroll || 0;


  if (!props.readonly && formData.beforeSalary !== storeVal) {
    formData.beforeSalary = storeVal;
  }
  return storeVal;
});


watch(() => formData.raisePercent, (newRate) => {
  if (increaseType.value === 'rate' && !props.readonly) {
    const base = currentBaseSalary.value;
    if (base > 0) {
      formData.afterSalary = Math.round(base * (1 + newRate / 100));
    }
  }
});

watch(() => formData.afterSalary, (newSalary) => {
  if (increaseType.value === 'direct' && !props.readonly) {
    const base = currentBaseSalary.value;
    if (base > 0 && newSalary > 0) {
      const rate = ((newSalary - base) / base) * 100;
      formData.raisePercent = Math.round(rate * 10) / 10;
    }
  }
});


const isFocused = ref(false);

const displayAfterSalary = computed({
  get() {
    if (isFocused.value) {
      return formData.afterSalary ? formData.afterSalary.toString() : '';
    } else {
      return formatNumber(formData.afterSalary);
    }
  },
  set(value: string) {
    const numericValue = value.replace(/[^\d]/g, '');
    formData.afterSalary = numericValue ? parseInt(numericValue) : 0;
  }
});

const onFocus = () => isFocused.value = true;
const onBlur = () => isFocused.value = false;

const formatNumber = (num: number | undefined) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return num.toLocaleString('ko-KR');
};

</script>

<style scoped>
@import '@/assets/styles/approval/approval-payrollraise.css';
</style>