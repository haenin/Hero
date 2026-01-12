<!--
  * <pre>
  * Vue Name        : ApprovalResignForm.vue
  * Description     : 사직서
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
    <div v-if="isDropdownOpen" class="overlay-backdrop" @click="closeAllPickers"></div>

    <div class="form-row">
      <div class="row-label">
        <span class="label-text">퇴직정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">

          <div class="input-group-row">
            <div class="input-group col-quarter">
              <div class="group-label">
                <span class="value-text">사번</span>
              </div>
              <div class="text-input-box readonly-value">
                <input type="text" :value="formData.employeeNumber" class="native-input" readonly tabindex="-1" />
              </div>
            </div>

            <div class="input-group col-quarter">
              <div class="group-label">
                <span class="label-text">부서</span>
              </div>
              <div class="text-input-box readonly-value">
                <input type="text" :value="formData.department" class="native-input" readonly tabindex="-1" />
              </div>
            </div>

            <div class="input-group col-quarter">
              <div class="group-label">
                <span class="label-text">직급</span>
              </div>
              <div class="text-input-box readonly-value">
                <input type="text" :value="formData.grade" class="native-input" readonly tabindex="-1" />
              </div>
            </div>

            <div class="input-group col-quarter">
              <div class="group-label">
                <span class="label-text">이름</span>
              </div>
              <div class="text-input-box readonly-value">
                <input type="text" :value="formData.employeeName" class="native-input" readonly tabindex="-1" />
              </div>
            </div>

            <div class="input-group col-quarter">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/vacation.svg" alt="date" />
                <span class="label-text">입사일자 {{ readonly ? '' : '*' }}</span>
              </div>

              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formatReadOnlyDate(formData.hireDate) }}</span>
              </div>
              <div v-else class="date-input-box">
                <input type="date" v-model="formData.hireDate" class="native-input" />
              </div>
            </div>

            <div class="input-group col-quarter">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/vacation.svg" alt="date" />
                <span class="label-text">퇴사일자 {{ readonly ? '' : '*' }}</span>
              </div>

              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formatReadOnlyDate(formData.terminationDate) }}</span>
              </div>
              <div v-else class="date-input-box">
                <input type="date" v-model="formData.terminationDate" class="native-input" />
              </div>
            </div>

            <div class="input-group col-quarter">
              <div class="group-label">
                <span class="label-text">퇴직사유 {{ readonly ? '' : '*' }}</span>
              </div>

              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ currentResignReasonName || '-' }}</span>
              </div>

              <div v-else class="dropdown-box" :class="{ 'is-open': isDropdownOpen }" @click.stop="toggleDropdown">
                <div class="dropdown-value">
                  <span :class="formData.terminateReason ? 'text-selected' : 'placeholder-text'">
                    {{ currentResignReasonName || '선택하세요' }}
                  </span>
                </div>
                <img class="icon-dropdown" :class="{ 'rotate': isDropdownOpen }" src="/images/dropdownarrow.svg"
                  alt="arrow" />

                <ul v-if="isDropdownOpen" class="dropdown-options">
                  <li v-for="option in resignTypes" :key="option.resignTypeId" class="dropdown-item"
                    @click.stop="selectReason(option)">
                    {{ option.resignTypeName }}
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <div class="form-row border-top">
      <div class="row-label label-bottom">
        <span class="label-text">상세퇴직사유</span>
      </div>
      <div class="row-content reason-content">
        <div v-if="readonly" class="readonly-textarea">
          <span class="value-text">{{ formData.terminateReasonDetail || '-' }}</span>
        </div>
        <textarea v-else v-model="formData.terminateReasonDetail" class="input-textarea"
          placeholder="퇴직사유에 대한 상세 내용을 입력해 주세요."></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useApprovalDataStore } from '@/stores/approval/approval_data.store';
import type { ResignTypeResponseDTO } from '@/types/approval/approval_data.types';

const approvalDataStore = useApprovalDataStore();
const { resignTypes } = storeToRefs(approvalDataStore);
const userStore = useAuthStore();
const { user } = storeToRefs(userStore);

const props = defineProps<{
  modelValue?: ResignFormData;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ResignFormData];
}>();

export interface ResignFormData {
  employeeName: string;
  employeeNumber: number | string;
  department: string;
  grade: string;
  hireDate: string;
  terminationDate: string;
  terminateReason: number;
  terminateReasonDetail: string;
}

onMounted(async () => {
  if (!resignTypes.value || resignTypes.value.length === 0) {
    await approvalDataStore.fetchResignTypes();
  }
});

const formData = reactive<ResignFormData>({
  employeeName: props.modelValue?.employeeName || user.value?.employeeName || '-',
  employeeNumber: props.modelValue?.employeeNumber ?? (user.value?.employeeNumber || 0),
  department: props.modelValue?.department || user.value?.departmentName || '-',
  grade: props.modelValue?.grade || user.value?.gradeName || '-',
  hireDate: props.modelValue?.hireDate || '',
  terminationDate: props.modelValue?.terminationDate || '',
  terminateReason: props.modelValue?.terminateReason || 0,
  terminateReasonDetail: props.modelValue?.terminateReasonDetail || ''
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

const closeAllPickers = () => {
  isDropdownOpen.value = false;
};

const selectReason = (option: ResignTypeResponseDTO) => {
  if (props.readonly) return;
  formData.terminateReason = option.resignTypeId;
  isDropdownOpen.value = false;
};

const currentResignReasonName = computed(() => {
  const val = formData.terminateReason;
  if (!val) return null;

  if (!resignTypes.value || resignTypes.value.length === 0) return val;

  const matched = resignTypes.value.find(r => r.resignTypeId === val);
  return matched ? matched.resignTypeName : val;

});


const formatReadOnlyDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${year}년 ${month}월 ${day}일`;
};
</script>

<style scoped>
@import '@/assets/styles/approval/approval-resign.css';
</style>