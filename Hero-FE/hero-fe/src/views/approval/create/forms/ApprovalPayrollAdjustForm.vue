<!--
  * <pre>
  * Vue Name        : ApprovalPayrollAdjustForm.vue
  * Description     : 급여조정신청서
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
        <span class="label-text">급여 조정 정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">
          <div class="input-group-row">

            <div class="input-group col-amount">
              <div class="group-label">
                <span class="label-text">조정 금액 {{ readonly ? '' : '*' }}</span>
              </div>

              <div class="calculation-box">
                <div class="input-box disabled">
                  <span class="placeholder-text">기존</span>
                  <div class="value-wrapper">
                    <span class="input-value">{{ formatNumber(currentAmount) }}</span>
                    <span class="unit-text">원</span>
                  </div>
                </div>

                <div class="arrow-icon">&gt;</div>

                <div class="input-box active" :class="{ 'disabled': readonly }">
                  <span class="placeholder-text text-blue">조정</span>
                  <div class="value-wrapper">

                    <span v-if="readonly" class="input-value text-right text-blue">
                      {{ formatNumber(formData.adjustmentAmount) }}
                    </span>

                    <input v-else type="text" v-model="displayAdjustmentAmount" @focus="onFocus" @blur="onBlur"
                      class="input-invisible text-right" placeholder="0" />
                    <span class="unit-text text-blue">원</span>
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
        <span class="label-text">조정사유</span>
      </div>
      <div class="row-content reason-content">
        <div v-if="readonly" class="readonly-textarea">
          <span class="value-text">{{ formData.reason || '-' }}</span>
        </div>
        <textarea v-else v-model="formData.reason" class="input-textarea" placeholder="조정사유를 입력해 주세요."></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { useApprovalDataStore } from '@/stores/approval/approval_data.store';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  modelValue?: ModifyPayrollFormData;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ModifyPayrollFormData];
}>();

export interface ModifyPayrollFormData {
  currentAmount: number;
  adjustmentAmount: number;
  reason: string;
}

const approvalDataStore = useApprovalDataStore();
const { payroll } = storeToRefs(approvalDataStore);

onMounted(async () => {
  if (!payroll.value) {
    await approvalDataStore.fetchPayroll();
  }
});

const formData = reactive<ModifyPayrollFormData>({
  currentAmount: props.modelValue?.currentAmount || 0,
  adjustmentAmount: props.modelValue?.adjustmentAmount || 0,
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


const currentAmount = computed(() => {
  if (props.modelValue?.currentAmount) {
    return props.modelValue.currentAmount;
  }
  const storeVal = payroll.value?.beforePayroll || 0;

  if (!props.readonly && formData.currentAmount !== storeVal) {
    formData.currentAmount = storeVal;
  }

  return storeVal;
});


const isFocused = ref(false);

const displayAdjustmentAmount = computed({
  get() {
    if (isFocused.value) {
      return formData.adjustmentAmount ? formData.adjustmentAmount.toString() : '';
    } else {
      return formatNumber(formData.adjustmentAmount);
    }
  },
  set(value: string) {
    const numericValue = value.replace(/[^\d]/g, '');
    formData.adjustmentAmount = numericValue ? parseInt(numericValue) : 0;
  }
});

const onFocus = () => {
  isFocused.value = true;
};

const onBlur = () => {
  isFocused.value = false;
};

const formatNumber = (num: number | undefined) => {
  if (num === undefined || num === null || isNaN(num)) {
    return '0';
  }
  return num.toLocaleString('ko-KR');
};

</script>

<style scoped>
@import '@/assets/styles/approval/approval-payrolladjust.css';
</style>