<!--
  * <pre>
  * Vue Name        : ApprovalAppointmentForm.vue
  * Description     : 인사발령품의서
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
    <div v-if="activeDropdown" class="overlay-backdrop" @click="closeDropdown"></div>

    <div class="form-row">
      <div class="row-label label-bottom">
        <span class="label-text">인사발령 정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">

          <div class="input-group-row">
            <div class="input-group col-half">
              <div class="group-label">
                <span class="label-text">발령 유형 {{ readonly ? '' : '*' }}</span>
              </div>
              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ getLabel('type', formData.changeType) }}</span>
              </div>
              <div v-else class="dropdown-box" :class="{ 'is-open': activeDropdown === 'type' }"
                @click.stop="toggleDropdown('type')">
                <div class="dropdown-value">
                  <span :class="formData.changeType ? 'text-selected' : 'placeholder-text'">
                    {{ getLabel('type', formData.changeType) || '선택하세요' }}
                  </span>
                </div>
                <img class="icon-dropdown" :class="{ 'rotate': activeDropdown === 'type' }"
                  src="/images/dropdownarrow.svg" alt="arrow" />
                <ul v-if="activeDropdown === 'type'" class="dropdown-options">
                  <li v-for="opt in typeOptions" :key="opt.value" class="dropdown-item"
                    @click.stop="selectOption('changeType', opt.value)">
                    {{ opt.label }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="input-group col-half">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/vacation.svg" alt="date" />
                <span class="label-text">발령시행일자 {{ readonly ? '' : '*' }}</span>
              </div>
              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formData.effectiveDate || '-' }}</span>
              </div>
              <div v-else class="date-input-box">
                <input type="date" v-model="formData.effectiveDate" class="native-input" />
              </div>
            </div>
          </div>

          <div class="input-group-row mt-20">
            <div class="input-group col-half">
              <div class="group-label">
                <span class="label-text">대상 직원 사번 {{ readonly ? '' : '*' }}</span>
              </div>
              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formData.employeeNumber || '-' }}</span>
              </div>
              <div v-else class="text-input-box">
                <input type="text" v-model="formData.employeeNumber" class="native-input" placeholder="사번 입력" />
              </div>
            </div>
            <div class="input-group col-half">
              <div class="group-label">
                <span class="label-text">대상 직원 이름 {{ readonly ? '' : '*' }}</span>
              </div>
              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formData.employeeName || '-' }}</span>
              </div>
              <div v-else class="text-input-box">
                <input type="text" v-model="formData.employeeName" class="native-input" placeholder="이름 입력" />
              </div>
            </div>
          </div>

          <div class="section-title mt-30">현재 정보 (발령 전)</div>
          <div class="input-group-row">
            <div class="input-group col-quarter">
              <div class="group-label"><span class="label-text">현재 부서</span></div>
              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ getLabel('dept', formData.departmentBefore) }}</span>
              </div>
              <div v-else class="dropdown-box" :class="{ 'is-open': activeDropdown === 'deptBefore' }"
                @click.stop="toggleDropdown('deptBefore')">
                <div class="dropdown-value">
                  <span :class="formData.departmentBefore ? 'text-selected' : 'placeholder-text'">
                    {{ getLabel('dept', formData.departmentBefore) || '선택하세요' }}
                  </span>
                </div>
                <img class="icon-dropdown" :class="{ 'rotate': activeDropdown === 'deptBefore' }"
                  src="/images/dropdownarrow.svg" alt="arrow" />
                <ul v-if="activeDropdown === 'deptBefore'" class="dropdown-options">
                  <li v-for="opt in personnelTypes?.departments" :key="opt.departmentId" class="dropdown-item"
                    @click.stop="selectOption('departmentBefore', opt.departmentId)">
                    {{ opt.departmentName }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="input-group col-quarter">
              <div class="group-label"><span class="label-text">현재 직책</span></div>
              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ getLabel('duty', formData.jobTitleBefore) }}</span>
              </div>
              <div v-else class="dropdown-box" :class="{ 'is-open': activeDropdown === 'dutyBefore' }"
                @click.stop="toggleDropdown('dutyBefore')">
                <div class="dropdown-value">
                  <span :class="formData.jobTitleBefore ? 'text-selected' : 'placeholder-text'">
                    {{ getLabel('duty', formData.jobTitleBefore) || '선택하세요' }}
                  </span>
                </div>
                <img class="icon-dropdown" :class="{ 'rotate': activeDropdown === 'dutyBefore' }"
                  src="/images/dropdownarrow.svg" alt="arrow" />
                <ul v-if="activeDropdown === 'dutyBefore'" class="dropdown-options">
                  <li v-for="opt in personnelTypes?.jobTitles" :key="opt.jobTitleId" class="dropdown-item"
                    @click.stop="selectOption('jobTitleBefore', opt.jobTitleId)">
                    {{ opt.jobTitle }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="input-group col-quarter">
              <div class="group-label"><span class="label-text">현재 직급</span></div>
              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ getLabel('position', formData.gradeBefore) }}</span>
              </div>
              <div v-else class="dropdown-box" :class="{ 'is-open': activeDropdown === 'gradeBefore' }"
                @click.stop="toggleDropdown('gradeBefore')">
                <div class="dropdown-value">
                  <span :class="formData.gradeBefore ? 'text-selected' : 'placeholder-text'">
                    {{ getLabel('position', formData.gradeBefore) || '선택하세요' }}
                  </span>
                </div>
                <img class="icon-dropdown" :class="{ 'rotate': activeDropdown === 'gradeBefore' }"
                  src="/images/dropdownarrow.svg" alt="arrow" />
                <ul v-if="activeDropdown === 'gradeBefore'" class="dropdown-options">
                  <li v-for="opt in personnelTypes?.grades" :key="opt.gradeId" class="dropdown-item"
                    @click.stop="selectOption('gradeBefore', opt.gradeId)">
                    {{ opt.grade }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="section-title mt-30">발령 후 정보</div>
          <div class="input-group-row">
            <div class="input-group col-quarter">
              <div class="group-label"><span class="label-text">발령 부서 {{ readonly ? '' : '*' }}</span></div>
              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ getLabel('dept', formData.departmentAfter) }}</span>
              </div>
              <div v-else class="dropdown-box" :class="{ 'is-open': activeDropdown === 'deptAfter' }"
                @click.stop="toggleDropdown('deptAfter')">
                <div class="dropdown-value">
                  <span :class="formData.departmentAfter ? 'text-selected' : 'placeholder-text'">
                    {{ getLabel('dept', formData.departmentAfter) || '선택하세요' }}
                  </span>
                </div>
                <img class="icon-dropdown" :class="{ 'rotate': activeDropdown === 'deptAfter' }"
                  src="/images/dropdownarrow.svg" alt="arrow" />
                <ul v-if="activeDropdown === 'deptAfter'" class="dropdown-options">
                  <li v-for="opt in personnelTypes?.departments" :key="opt.departmentId" class="dropdown-item"
                    @click.stop="selectOption('departmentAfter', opt.departmentId)">
                    {{ opt.departmentName }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="input-group col-quarter">
              <div class="group-label"><span class="label-text">발령 직책 {{ readonly ? '' : '*' }}</span></div>
              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ getLabel('duty', formData.jobTitleAfter) }}</span>
              </div>
              <div v-else class="dropdown-box" :class="{ 'is-open': activeDropdown === 'dutyAfter' }"
                @click.stop="toggleDropdown('dutyAfter')">
                <div class="dropdown-value">
                  <span :class="formData.jobTitleAfter ? 'text-selected' : 'placeholder-text'">
                    {{ getLabel('duty', formData.jobTitleAfter) || '선택하세요' }}
                  </span>
                </div>
                <img class="icon-dropdown" :class="{ 'rotate': activeDropdown === 'dutyAfter' }"
                  src="/images/dropdownarrow.svg" alt="arrow" />
                <ul v-if="activeDropdown === 'dutyAfter'" class="dropdown-options">
                  <li v-for="opt in personnelTypes?.jobTitles" :key="opt.jobTitleId" class="dropdown-item"
                    @click.stop="selectOption('jobTitleAfter', opt.jobTitleId)">
                    {{ opt.jobTitle }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="input-group col-quarter">
              <div class="group-label"><span class="label-text">발령 직급 {{ readonly ? '' : '*' }}</span></div>
              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ getLabel('position', formData.gradeAfter) }}</span>
              </div>
              <div v-else class="dropdown-box" :class="{ 'is-open': activeDropdown === 'gradeAfter' }"
                @click.stop="toggleDropdown('gradeAfter')">
                <div class="dropdown-value">
                  <span :class="formData.gradeAfter ? 'text-selected' : 'placeholder-text'">
                    {{ getLabel('position', formData.gradeAfter) || '선택하세요' }}
                  </span>
                </div>
                <img class="icon-dropdown" :class="{ 'rotate': activeDropdown === 'gradeAfter' }"
                  src="/images/dropdownarrow.svg" alt="arrow" />
                <ul v-if="activeDropdown === 'gradeAfter'" class="dropdown-options">
                  <li v-for="opt in personnelTypes?.grades" :key="opt.gradeId" class="dropdown-item"
                    @click.stop="selectOption('gradeAfter', opt.gradeId)">
                    {{ opt.grade }}
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
        <span class="label-text">내용</span>
      </div>
      <div class="row-content reason-content">
        <div v-if="readonly" class="readonly-textarea">
          <span class="value-text">{{ formData.reason || '-' }}</span>
        </div>
        <textarea v-else v-model="formData.reason" class="input-textarea" placeholder="내용을 입력하세요"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { useApprovalDataStore } from '@/stores/approval/approval_data.store';
import { storeToRefs } from 'pinia';

const approvalDataStore = useApprovalDataStore();
const { personnelTypes } = storeToRefs(approvalDataStore);

onMounted(async () => {
  if (!personnelTypes.value.departments ||
    !personnelTypes.value.jobTitles ||
    !personnelTypes.value.grades ||
    personnelTypes.value.departments?.length === 0 ||
    personnelTypes.value.jobTitles?.length === 0 ||
    personnelTypes.value.grades?.length === 0
  ) {
    await approvalDataStore.fetchPersonnelTypes();
  }
});

const props = defineProps<{
  modelValue?: PersonnelAppointmentFormData;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: PersonnelAppointmentFormData];
}>();

export interface PersonnelAppointmentFormData {
  changeType: string;
  employeeNumber: string;
  employeeName: string;
  effectiveDate: string;

  departmentBefore: number;
  gradeBefore: number;
  jobTitleBefore: number;

  departmentAfter: number;
  gradeAfter: number;
  jobTitleAfter: number;

  status: string;
  auditDate: string;
  reason: string;
}

const typeOptions = [
  { label: '정기 승진', value: 'REGULAR' },
  { label: '특별 승진', value: 'SPECIAL' }
];

const formData = reactive<PersonnelAppointmentFormData>({
  changeType: props.modelValue?.changeType || '',
  employeeNumber: props.modelValue?.employeeNumber || '',
  employeeName: props.modelValue?.employeeName || '',
  effectiveDate: props.modelValue?.effectiveDate || '',
  departmentBefore: props.modelValue?.departmentBefore || 0,
  gradeBefore: props.modelValue?.gradeBefore || 0,
  jobTitleBefore: props.modelValue?.jobTitleBefore || 0,
  departmentAfter: props.modelValue?.departmentAfter || 0,
  gradeAfter: props.modelValue?.gradeAfter || 0,
  jobTitleAfter: props.modelValue?.jobTitleAfter || 0,
  status: props.modelValue?.status || '',
  auditDate: props.modelValue?.auditDate || new Date().toISOString().split('T')[0],
  reason: props.modelValue?.reason || '',
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


const activeDropdown = ref<string | null>(null);

const toggleDropdown = (key: string) => {
  if (props.readonly) return;
  activeDropdown.value = activeDropdown.value === key ? null : key;
};

const closeDropdown = () => {
  activeDropdown.value = null;
};

const selectOption = (field: keyof PersonnelAppointmentFormData, value: string | number) => {
  if (props.readonly) return;

  // @ts-ignore
  formData[field] = value;
  closeDropdown();
};

const getLabel = (type: 'type' | 'dept' | 'duty' | 'position', value: string | number) => {
  if (!value) return '';

  if (type === 'type') {
    const found = typeOptions.find(o => o.value === value);
    return found ? found.label : String(value);
  }

  if (type === 'dept' && personnelTypes.value?.departments) {
    const found = personnelTypes.value.departments.find(d => d.departmentId === value);
    return found ? found.departmentName : '';
  }
  if (type === 'duty' && personnelTypes.value?.jobTitles) {
    const found = personnelTypes.value.jobTitles.find(j => j.jobTitleId === value);
    return found ? found.jobTitle : '';
  }
  if (type === 'position' && personnelTypes.value?.grades) {
    const found = personnelTypes.value.grades.find(g => g.gradeId === value);
    return found ? found.grade : '';
  }

  return String(value);
};

</script>

<style scoped>
@import '@/assets/styles/approval/approval-appointment.css';
</style>