<!--
  * <pre>
  * Vue Name        : ApprovalPromotionForm.vue
  * Description     : 승진계획서
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
    <div v-if="activeTableDropdown" class="overlay-backdrop" @click="closeDropdown"></div>

    <div class="form-row">
      <div class="row-label">
        <span class="label-text">승진 일정</span>
      </div>
      <div class="row-content">
        <div class="section-body">
          <div class="input-group-row">
            <div class="input-group col-half">
              <div class="group-label">
                <span class="label-text">추천 마감일 {{ readonly ? '' : '*' }}</span>
              </div>
              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formData.nominationDeadlineAt || '-' }}</span>
              </div>
              <div v-else class="date-input-box">
                <input type="date" v-model="formData.nominationDeadlineAt" class="native-input" />
              </div>
            </div>
            <div class="input-group col-half">
              <div class="group-label">
                <span class="label-text">발령 예정일 {{ readonly ? '' : '*' }}</span>
              </div>
              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formData.appointmentAt || '-' }}</span>
              </div>
              <div v-else class="date-input-box">
                <input type="date" v-model="formData.appointmentAt" class="native-input" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-row border-top">
      <div class="row-label">
        <span class="label-text">부서별 승진 TO</span>
      </div>
      <div class="row-content table-content">
        <div class="section-body">

          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 60px;">번호</th>
                  <th>대상 부서</th>
                  <th>승진 후 직급</th>
                  <th style="width: 100px;">대상 수</th>
                  <th v-if="!readonly" style="width: 60px;">삭제</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in formData.detailPlan" :key="index">
                  <td class="text-center">{{ index + 1 }}</td>

                  <td>
                    <div v-if="readonly" class="cell-text text-center">
                      {{ getLabel('dept', item.departmentId) }}
                    </div>

                    <div v-else class="cell-dropdown-wrapper">
                      <div class="dropdown-box table-dropdown"
                        :class="{ 'is-open': activeTableDropdown === `${index}-dept` }"
                        @click.stop="toggleTableDropdown(index, 'dept')">
                        <div class="dropdown-value">
                          <span :class="item.departmentId ? 'text-selected' : 'placeholder-text'">
                            {{ getLabel('dept', item.departmentId) === '-' ? '선택' : getLabel('dept', item.departmentId)
                            }}
                          </span>
                        </div>
                        <img class="icon-dropdown" :class="{ 'rotate': activeTableDropdown === `${index}-dept` }"
                          src="/images/dropdownarrow.svg" alt="arrow" />

                        <ul v-if="activeTableDropdown === `${index}-dept`" class="dropdown-options">
                          <li v-for="dept in personnelTypes?.departments" :key="dept.departmentId" class="dropdown-item"
                            @click.stop="selectItem(index, 'departmentId', dept.departmentId)">
                            {{ dept.departmentName }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div v-if="readonly" class="cell-text text-center">
                      {{ getLabel('grade', item.gradeId) }}
                    </div>

                    <div v-else class="cell-dropdown-wrapper">
                      <div class="dropdown-box table-dropdown"
                        :class="{ 'is-open': activeTableDropdown === `${index}-grade` }"
                        @click.stop="toggleTableDropdown(index, 'grade')">
                        <div class="dropdown-value">
                          <span :class="item.gradeId ? 'text-selected' : 'placeholder-text'">
                            {{ getLabel('grade', item.gradeId) === '-' ? '선택' : getLabel('grade', item.gradeId) }}
                          </span>
                        </div>
                        <img class="icon-dropdown" :class="{ 'rotate': activeTableDropdown === `${index}-grade` }"
                          src="/images/dropdownarrow.svg" alt="arrow" />

                        <ul v-if="activeTableDropdown === `${index}-grade`" class="dropdown-options">
                          <li v-for="grade in personnelTypes?.grades" :key="grade.gradeId" class="dropdown-item"
                            @click.stop="selectItem(index, 'gradeId', grade.gradeId)">
                            {{ grade.grade }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div v-if="readonly" class="cell-text text-center">
                      {{ item.quotaCount }} 명
                    </div>
                    <input v-else type="number" v-model.number="item.quotaCount" class="table-input text-center" min="0"
                      placeholder="0" />
                  </td>

                  <td v-if="!readonly" class="text-center">
                    <button type="button" class="btn-delete" @click="removeRow(index)">✕</button>
                  </td>
                </tr>

                <tr v-if="formData.detailPlan.length === 0">
                  <td :colspan="readonly ? 4 : 5" class="empty-text">
                    {{ readonly ? '등록된 승진 계획이 없습니다.' : '승진 계획을 추가해주세요.' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="!readonly" class="button-area">
            <button type="button" class="btn-add" @click="addRow">+ 행 추가</button>
          </div>

        </div>
      </div>
    </div>

    <div class="form-row border-top">
      <div class="row-label label-bottom">
        <span class="label-text">계획 상세 내용</span>
      </div>
      <div class="row-content reason-content">
        <div v-if="readonly" class="readonly-textarea">
          <span class="value-text">{{ formData.planContent || '-' }}</span>
        </div>
        <textarea v-else v-model="formData.planContent" class="input-textarea"
          placeholder="승진 계획에 대한 상세 내용을 입력해주세요."></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref, onMounted } from 'vue';
import { useApprovalDataStore } from '@/stores/approval/approval_data.store';
import { storeToRefs } from 'pinia';

// --- Store ---
const approvalDataStore = useApprovalDataStore();
const { personnelTypes } = storeToRefs(approvalDataStore); // departments, grades 등이 들어있음

onMounted(async () => {
  // 데이터가 없으면 로드 (중복 호출 방지)
  if (!personnelTypes.value?.departments ||
    (personnelTypes.value.departments.length === 0 &&
      personnelTypes.value.grades.length === 0)
  ) {
    await approvalDataStore.fetchPersonnelTypes();
  }
});

// --- Types ---
interface DetailPlanItem {
  departmentId: number;
  gradeId: number;
  quotaCount: number;
}

export interface PromotionPlanFormData {
  nominationDeadlineAt: string;
  appointmentAt: string;
  planContent: string;
  detailPlan: DetailPlanItem[];
}

// --- Props & Emits ---
const props = defineProps<{
  modelValue?: PromotionPlanFormData;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: PromotionPlanFormData];
}>();

// --- State Management ---
const formData = reactive<PromotionPlanFormData>({
  nominationDeadlineAt: props.modelValue?.nominationDeadlineAt || '',
  appointmentAt: props.modelValue?.appointmentAt || '',
  planContent: props.modelValue?.planContent || '',
  detailPlan: props.modelValue?.detailPlan || (props.readonly ? [] : [
    { departmentId: 0, gradeId: 0, quotaCount: 0 }
  ])
});

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // 값이 완전히 동일하다면 덮어쓰지 않고 리턴 (Loop Break)
    if (JSON.stringify(newVal) === JSON.stringify(formData)) {
      return;
    }
    Object.assign(formData, newVal);
  }
}, { deep: true });

watch(formData, (newVal) => {
  if (!props.readonly) {
    // 방금 부모에게서 받은 값과 동일하다면 다시 Emit 하지 않음 (Loop Break)
    if (JSON.stringify(newVal) === JSON.stringify(props.modelValue)) {
      return;
    }
    emit('update:modelValue', { ...newVal });
  }
}, { deep: true });

// --- Actions ---
const addRow = () => {
  formData.detailPlan.push({
    departmentId: 0,
    gradeId: 0,
    quotaCount: 0
  });
};

const removeRow = (index: number) => {
  formData.detailPlan.splice(index, 1);
};


// --- Table Dropdown Logic ---
const activeTableDropdown = ref<string | null>(null);

const toggleTableDropdown = (index: number, type: 'dept' | 'grade') => {
  if (props.readonly) return;
  const key = `${index}-${type}`;
  activeTableDropdown.value = activeTableDropdown.value === key ? null : key;
};

const closeDropdown = () => {
  activeTableDropdown.value = null;
};

const selectItem = (index: number, field: keyof DetailPlanItem, value: number) => {
  if (props.readonly) return;
  const row = formData.detailPlan[index];
  if (row) {
    // @ts-ignore
    row[field] = value;
  }
  closeDropdown();
};


// --- Helper: ID -> Label 변환 (Store 데이터 사용) ---
const getLabel = (type: 'dept' | 'grade', id: number) => {
  if (!id || !personnelTypes.value) return '-';

  if (type === 'dept' && personnelTypes.value.departments) {
    const found = personnelTypes.value.departments.find(d => d.departmentId === id);
    return found ? found.departmentName : '-';
  }

  if (type === 'grade' && personnelTypes.value.grades) {
    const found = personnelTypes.value.grades.find(g => g.gradeId === id);
    return found ? found.grade : '-';
  }

  return '-';
};

</script>

<style scoped>
@import '@/assets/styles/approval/approval-promotion.css';
</style>