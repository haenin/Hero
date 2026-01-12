<!--
 * <pre>
 * Vue Name        : ApprovalCreate.vue
 * Description     : 작성화면
 *
 * 컴포넌트 연계
 * - 문서 상세 조회
 * - ApprovalTemplates.vue: 새 결재 작성 버튼 클릭 시 결재문서서식페이지로 라우팅
 *
 * History
 * 2025/12/14 (민철) 공통 컴포넌트화
 * 2025/12/23 (민철) 파일명 변경 
 * 2025/12/24 (민철) 작성 UI 최종 구현(제목/분류/결재선/참고목록 지정)
 * 2025/12/25 (민철) 서식 목록에서 서식ID 쿼리스트링으로 전달받기
 * 2025/12/26 (민철) Composable 사용 및 타입 안정성 개선, 미리보기 주석처리
 * 2025/12/31 (지윤) 지연 근무 신청/초과 근무 신청에 관한 로직 추가 script 부분에 표시
 * 2026/01/06 (민철) 주석제거, 뒤로 가기
 * </pre>
 *
 * @module approval
 * @author 민철
 * @version 2.3
-->
<template>
  <div class="page-wrapper">

    <div class="page-header">
      <div class="header-inner">
        <div class="back-label-wrap">
          <button class="btn-back" @click="goBack">
            <img class="icon-arrow" src="/images/arrow.svg" alt="화살표" />
          </button>
          <div class="back-label">뒤로가기</div>
        </div>
        <div class="action-group">
          <button class="btn-secondary" @click="handleSaveDraft()">
            <img class="btn-icon" src="/images/file.svg" />
            <div class="btn-text">임시저장</div>
          </button>
          
          <button class="btn-primary" @click="handleSubmit()">
            <img class="btn-icon" src="/images/submit.svg" />
            <div class="btn-text-white">상신</div>
          </button>
        </div>
      </div>
    </div>

    <div class="page-body">
      <div class="form-wrapper">
        <div class="form-container">
          <ApprovalCreateCommonForm ref="commonFormRef" :templateId="templateId" :templateName="templateName"
            :category="category" :empName="empName" :empDept="empDept" :empGrade="empGrade"
            @saveDraft="handleSaveDraft()" @cancel="goBack" @submit="handleSubmit()">
            <template #detail-section>
              <component :is="currentDetailSection" v-model="sectionData" />
            </template>
          </ApprovalCreateCommonForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApprovalDocument } from '@/composables/approval/useApprovalDocument';
import { ApprovalDocumentRequestDTO } from '@/types/approval/approval_request.types';
import ApprovalCreateCommonForm from './ApprovalCreateCommonForm.vue';
import {
  ApprovalVacationForm,
  ApprovalOvertimeForm,
  ApprovalWorkChangeForm,
  ApprovalAttendanceFixForm,
  ApprovalAppointmentForm,
  ApprovalPromotionForm,
  ApprovalResignForm,
  ApprovalPayrollRaiseForm,
  ApprovalPayrollAdjustForm,
} from './forms';
import { useApprovalTemplateStore } from '@/stores/approval/approval.store';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { useAttendanceStore } from '@/stores/attendance/attendanceStore';


const commonFormRef = ref<InstanceType<typeof ApprovalCreateCommonForm>>();
const sectionData = ref<any>({});


const router = useRouter();
const route = useRoute();
const { saveDraft, submit } = useApprovalDocument();
const approvalStore = useApprovalTemplateStore();
const authStore = useAuthStore();
const { template } = storeToRefs(approvalStore);
const attendanceStore = useAttendanceStore();
const { selectedRow } = storeToRefs(attendanceStore);

const props = defineProps<{
  formName: string;
}>();


const toHHmm = (t?: string | null) => (t ? String(t).substring(0, 5) : '00:00');

const preloadModifyWorkRecord = (): void => {
  if (props.formName !== 'modifyworkrecord') return;

  const stored = selectedRow.value;
  const attendanceId = stored?.attendanceId ?? Number(route.query.attendanceId);
  if (!attendanceId) return;

  if (stored && stored.attendanceId === attendanceId) {
    sectionData.value = {
      attendanceId,
      targetDate: stored.workDate,
      correctedStart: toHHmm(stored.startTime),
      correctedEnd: toHHmm(stored.endTime),
      reason: '',
    };
  }
};

const preloadOvertime = (): void => {
  if (props.formName !== 'overtime') return;

  const storedWorkDate = selectedRow.value?.workDate;
  const workDate = storedWorkDate ?? String(route.query.workDate ?? '');
  if (!workDate) return;

  sectionData.value = {
    workDate,
    startTime: sectionData.value?.startTime ?? '00:00',
    endTime: sectionData.value?.endTime ?? '00:00',
    reason: sectionData.value?.reason ?? '',
  };
};

const preloadByForm = (): void => {
  preloadModifyWorkRecord();
  preloadOvertime();
};

onMounted(async () => {
  const idFromQuery = Number(route.query.templateId);

  if (idFromQuery) {
    await approvalStore.fetchTemplate(idFromQuery);
  }

  preloadByForm();

});


const sectionMap: Record<string, any> = {
  vacation: ApprovalVacationForm,
  changework: ApprovalWorkChangeForm,
  overtime: ApprovalOvertimeForm,
  modifyworkrecord: ApprovalAttendanceFixForm,
  personnelappointment: ApprovalAppointmentForm,
  promotionplan: ApprovalPromotionForm,
  resign: ApprovalResignForm,
  raisepayroll: ApprovalPayrollRaiseForm,
  modifypayroll: ApprovalPayrollAdjustForm,
};

const currentDetailSection = computed(() => {
  return sectionMap[props.formName];
});

const templateId = computed(() => template.value.templateId || 0);
const templateName = computed(() => template.value.templateName || '서식명');
const category = computed(() => template.value.category || '분류명');
const empName = computed(() => authStore.user?.employeeName || '직원이름');
const empDept = computed(() => authStore.user?.departmentName || '부서');
const empGrade = computed(() => authStore.user?.gradeName || '직급');

const currentDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

const createRequestDTO = (status: 'draft' | 'submitted'): ApprovalDocumentRequestDTO => {
  const commonFormData = commonFormRef.value?.getCommonData();
  const detailsJsonString = JSON.stringify(sectionData.value);

  return {
    formType: props.formName,
    documentType: category.value,
    title: commonFormData?.title || '',
    drafter: empName.value,
    department: empDept.value,
    grade: empGrade.value,
    draftDate: currentDate.value,
    status: status,
    submittedAt: status === 'submitted' ? new Date().toISOString() : null,
    lines: commonFormData?.lines || [],
    references: commonFormData?.references || [],
    details: detailsJsonString
  };
};


const handleSaveDraft = async () => {
  try {
    const requestDTO = createRequestDTO('draft');
    const commonFormData = commonFormRef.value?.getCommonData();
    const files = commonFormData?.attachments || [];

    const response = await saveDraft(requestDTO, files);
    alert('임시저장되었습니다.');
    router.push('/approval/document-templates');
  } catch (error) {
    alert('임시저장 중 오류가 발생했습니다.');
  }
};

const handleSubmit = async () => {
  try {
    const requestDTO = createRequestDTO('submitted');
    const commonFormData = commonFormRef.value?.getCommonData();
    const files = commonFormData?.attachments || [];

    const response = await submit(requestDTO, files, props.formName);

    if (response) {
      router.push('/approval/document-templates');
    }
  } catch (error) {
    alert('상신 중 오류가 발생했습니다.');
  }
};

const goBack = () => {
  router.back();
};

</script>

<style scoped>
@import "@/assets/styles/approval/approval-detail.css";
</style>