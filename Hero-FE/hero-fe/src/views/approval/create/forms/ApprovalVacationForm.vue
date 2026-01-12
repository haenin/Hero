<!--
  * <pre>
  * Vue Name        : ApprovalVacationForm.vue
  * Description     : 휴가신청서 (작성용 + 조회용 통합)
  *
  * 컴포넌트 연계
  *  - 부모 컴포넌트: ApprovalCreateCommonForm.vue, ApprovalDetailCommonForm.vue
  *
  * History
  * 2025/12/10 (민철) 최초 작성
  * 2025/12/14 (민철) 공통 컴포넌트화
  * 2025/12/23 (민철) 파일명 변경
  * 2025/12/29 (민철) readonly 모드 지원 추가 (작성용/조회용 통합)
  * 2025/12/29 (민철) 이름/ID 모두 지원하도록 수정
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
    <div v-if="isDropdownOpen" class="overlay-backdrop" @click="closeDropdown"></div>

    <div class="form-row">
      <div class="row-label">
        <span class="label-text">휴가신청정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">
          <div class="input-group-row">

            <div class="input-group col-type">
              <div class="group-label">
                <span class="label-text">휴가 종류 {{ readonly ? '' : '*' }}</span>
              </div>

              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formData.vacationType || '-' }}</span>
              </div>

              <div v-else class="dropdown-box" :class="{ 'is-open': isDropdownOpen }" @click.stop="toggleDropdown">
                <div class="dropdown-value">
                  <span :class="formData.vacationType ? 'text-selected' : 'placeholder-text'">
                    {{ currentVacationTypeName || '선택하세요' }}
                  </span>
                </div>
                <img class="icon-dropdown" :class="{ 'rotate': isDropdownOpen }" src="/images/dropdownarrow.svg"
                  alt="dropdown" />

                <ul v-if="isDropdownOpen" class="dropdown-options">
                  <li v-for="option in vacationTypes" :key="option.vacationTypeId" class="dropdown-item"
                    @click.stop="selectVacationType(option)">
                    {{ option.vacationTypeName }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="input-group col-period">
              <div class="group-label">
                <span class="label-text">휴가 기간 {{ readonly ? '' : '*' }}</span>
              </div>

              <div v-if="readonly" class="date-range-box">
                <div class="readonly-value date-input">
                  <span class="value-text">{{ formatReadOnlyDate(formData.startDate) }}</span>
                </div>
                <div class="tilde">~</div>
                <div class="readonly-value date-input">
                  <span class="value-text">{{ formatReadOnlyDate(formData.endDate) }}</span>
                </div>
              </div>

              <div v-else class="date-range-box">
                <div class="date-input-box">
                  <input type="date" v-model="formData.startDate" class="date-input" />
                </div>
                <div class="tilde">~</div>
                <div class="date-input-box">
                  <input type="date" v-model="formData.endDate" class="date-input" />
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
        <textarea v-else v-model="formData.reason" class="input-textarea" placeholder="사유를 입력해 주세요."></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue';
import { useApprovalDataStore } from '@/stores/approval/approval_data.store';
import { storeToRefs } from 'pinia';
import type { VacationTypeResponseDTO } from '@/types/approval/approval_data.types';

const props = defineProps<{
  modelValue?: VacationFormData;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: VacationFormData];
}>();

export interface VacationFormData {
  vacationType: number;
  startDate: string;
  endDate: string;
  reason: string;
}

const approvalDataStore = useApprovalDataStore();
const { vacationTypes } = storeToRefs(approvalDataStore);

onMounted(async () => {
  if (!vacationTypes.value || vacationTypes.value.length === 0) {
    await approvalDataStore.fetchVacationTypes();
  }
});

const formData = reactive<VacationFormData>({
  vacationType: props.modelValue?.vacationType || 0,
  startDate: props.modelValue?.startDate || '',
  endDate: props.modelValue?.endDate || '',
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


const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  if (props.readonly) return;
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const selectVacationType = (option: VacationTypeResponseDTO) => {
  if (props.readonly) return;
  formData.vacationType = option.vacationTypeId; // ID 저장
  isDropdownOpen.value = false;
};

const currentVacationTypeName = computed(() => {
  const targetId = formData.vacationType;

  if (!targetId) return null;

  if (!vacationTypes.value) return targetId;

  const matched = vacationTypes.value.find(v => v.vacationTypeId === targetId);

  return matched ? matched.vacationTypeName : targetId;
});


const formatReadOnlyDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${year}년 ${month}월 ${day}일`;
};

</script>

<style scoped>
@import '@/assets/styles/approval/approval-vacation.css';
</style>