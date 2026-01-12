<!--
 * <pre>
 * Vue Name        : ApprovalCreateCommonForm.vue
 * Description     : 공통 서식 (조직도 모달 통합)
 *
 * 컴포넌트 연계
 * - 부모 컴포넌트: ApprovalCreate.vue
 *
 * History
 * 2025/12/10 (민철) 최초작성
 * 2025/12/11 (민철) props 데이터 및 동적컴포넌트 추가
 * 2025/12/14 (민철) 공통 컴포넌트화
 * 2025/12/23 (민철) 파일명 변경
 * 2025/12/24 (민철) 작성 UI 최종 구현(제목/분류/결재선/참고목록 지정)
 * 2025/12/26 (민철) 조직도 모달 통합
 * 2026/01/06 (민철) 주석 제거
 * 2026/01/06 (민철) 외부 스타일 시트 방식 적용
 * </pre>
 *
 * @module approval
 * @author 민철
 * @version 2.3
-->
<template>
  <div class="form-wrapper">
    <div class="paper-sheet">
      <div class="paper-padding">
        <div class="paper-content">

          <div class="title-section">
            <div class="title-row">
              <h1 class="main-title">{{ props.templateName }}</h1>
            </div>
          </div>

          <div class="top-section">
            <div class="info-table">
              <div class="info-row">
                <div class="th-cell">
                  <span class="label-text">기안자</span>
                </div>
                <div class="td-cell">
                  <span class="value-text">{{ props.empName }}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="th-cell">
                  <span class="label-text">소속</span>
                </div>
                <div class="td-cell">
                  <span class="value-text">{{ props.empDept }}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="th-cell">
                  <span class="label-text">기안일</span>
                </div>
                <div class="td-cell">
                  <span class="value-text">{{ currentDate }}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="th-cell">
                  <span class="label-text">문서번호</span>
                </div>
                <div class="td-cell">
                  <span class="value-text">-</span>
                </div>
              </div>
              <div class="info-row last-row">
                <div class="th-cell">
                  <span class="label-text">문서분류</span>
                </div>
                <div class="td-cell">
                  <span class="value-text">{{ props.category }}</span>
                </div>
              </div>
            </div>

            <div class="stamp-area">
              <div class="stamp-group">

                <div class="stamp-box">
                  <div class="stamp-header">
                    <span class="stamp-role-label">기안</span>
                  </div>
                  <div class="stamp-body">
                    <div class="approver-info-vertical">
                      <div class="approver-name-row">
                        <span class="approver-name">{{ commonData.lines[0]?.approverName || authStore.user?.employeeName
                        }}</span>
                        <span class="approver-rank">{{ commonData.lines[0]?.gradeName || authStore.user?.gradeName
                        }}</span>
                      </div>
                      <span class="approver-dept">{{ commonData.lines[0]?.departmentName ||
                        authStore.user?.departmentName }}</span>
                    </div>
                    <div class="stamp-signature approved">
                      <div class="signature-text">
                        <span class="status-approved">기안</span>
                      </div>
                    </div>
                  </div>
                  <div class="stamp-footer">
                    <span class="stamp-date">{{ currentDate || '-' }}</span>
                  </div>
                </div>

                <div class="stamp-box">
                  <div class="stamp-header">
                    <span class="stamp-role-label">결재</span>
                  </div>
                  <div class="stamp-body">
                    <template v-if="commonData.lines[1]">
                      <div class="approver-info-vertical">
                        <div class="approver-name-row">
                          <span class="approver-name">{{ commonData.lines[1].approverName }}</span>
                          <span class="approver-rank">{{ commonData.lines[1].gradeName }}</span>
                        </div>
                        <span class="approver-dept">{{ commonData.lines[1].departmentName }}</span>
                      </div>
                      <div class="stamp-signature pending">
                        <div class="signature-text">
                          <span class="status-pending">대기</span>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="approver-info-vertical">
                        <span class="approver-name empty">미지정</span>
                      </div>
                      <div class="stamp-signature empty">
                        <div class="signature-text">
                          <span class="status-empty">-</span>
                        </div>
                      </div>
                    </template>
                  </div>
                  <div class="stamp-footer">
                    <span class="stamp-date">{{ commonData.lines[1] ? '-' : '' }}</span>
                  </div>
                </div>

                <div class="stamp-box">
                  <div class="stamp-header">
                    <span class="stamp-role-label">결재</span>
                  </div>
                  <div class="stamp-body">
                    <template v-if="commonData.lines[2]">
                      <div class="approver-info-vertical">
                        <div class="approver-name-row">
                          <span class="approver-name">{{ commonData.lines[2].approverName }}</span>
                          <span class="approver-rank">{{ commonData.lines[2].gradeName }}</span>
                        </div>
                        <span class="approver-dept">{{ commonData.lines[2].departmentName }}</span>
                      </div>
                      <div class="stamp-signature pending">
                        <div class="signature-text">
                          <span class="status-pending">대기</span>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="approver-info-vertical">
                        <span class="approver-name empty">미지정</span>
                      </div>
                      <div class="stamp-signature empty">
                        <div class="signature-text">
                          <span class="status-empty">-</span>
                        </div>
                      </div>
                    </template>
                  </div>
                  <div class="stamp-footer">
                    <span class="stamp-date">{{ commonData.lines[2] ? '-' : '' }} -</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">

            <div class="main-form-section">

              <div class="form-row">
                <div class="row-label-top">
                  <span class="label-text">제목</span>
                </div>
                <div class="row-content">
                  <input v-model="commonData.title" type="text" class="input-wrapper" placeholder="제목을 입력하세요" />
                </div>
              </div>

              <div class="form-row">
                <div class="row-label">
                  <span class="label-text">결재선</span>
                </div>
                <div class="row-content flow-content">
                  <div class="approval-flow">

                    <template v-for="(approver, index) in commonData.lines" :key="index">
                      <div class="flow-card">
                        <div class="card-inner">
                          <div class="avatar-circle">
                            <span class="avatar-text">{{ approver.approverName?.charAt(0) }}</span>
                          </div>
                          <div class="card-details">
                            <div class="detail-row">
                              <span class="detail-name">{{ approver.approverName }} {{ approver.gradeName }}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-dept">{{ approver.departmentName }}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-role"
                                :style="{ color: index === 0 ? '#1c398e' : '#62748e', fontWeight: index === 0 ? '600' : '400' }">
                                {{ index === 0 ? '기안' : '결재' }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <img v-if="index !== 0" class="btn-delete" src="/images/deletebutton.svg"
                          @click="removeApprover(index)" alt="삭제" />
                      </div>

                      <img v-if="index < commonData.lines.length - 1 || commonData.lines.length < 3" class="flow-arrow"
                        src="/images/linearrow.svg" alt="화살표" />
                    </template>

                    <button v-if="commonData.lines.length < 3" class="flow-card add-card" @click="openModal('LINE')"
                      type="button">
                      <div class="add-icon">
                        <img src="/images/plus-dark.svg" alt="결재자추가">
                      </div>
                    </button>

                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="row-label">
                  <span class="label-text">참조</span>
                </div>
                <div class="row-content ref-content">
                  <div class="reference-wrapper">

                    <div v-if="commonData.references.length > 0" class="ref-chip-list">
                      <div v-for="(refMember, index) in commonData.references" :key="index" class="ref-chip">
                        <span class="ref-name">{{ refMember.referencerName }} {{ refMember.gradeName }} {{
                          refMember.departmentName }}</span>
                        <button class="btn-ref-delete" @click="removeReference(index)" type="button">
                          <img src="/images/deletebutton.svg" alt="삭제" width="10" height="10" />
                        </button>
                      </div>
                    </div>

                    <button class="btn-add-ref" @click="openModal('REF')" type="button">
                      <img src="/images/plus-dark.svg" alt="추가" width="12" height="12" />
                      <span class="btn-text-sm">참조 추가</span>
                    </button>

                  </div>
                </div>
              </div>

              <Teleport to="body">
                <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
                  <ApprovalLineModal :type="modalType" @close="closeModal" @confirm="handleModalConfirm" />
                </div>
              </Teleport>

              <div class="form-row">
                <div class="row-label">
                  <span class="label-text">첨부파일</span>
                </div>

                <div class="row-content file-content">

                  <div class="upload-left-section">
                    <div class="file-upload-box" @click="triggerFileUpload">
                      <img class="icon-upload" src="/images/fileupload.svg" />
                      <div class="upload-text-wrap">
                        <span class="upload-label">파일 선택</span>
                      </div>
                      <input type="file" ref="fileInput" class="hidden-file-input" multiple @click.stop
                        @change="handleFileUpload" />
                    </div>
                    <div class="file-desc">
                      <span class="desc-text">최대 10MB, 여러 파일 첨부 가능</span>
                    </div>
                  </div>

                  <div v-if="commonData.attachments.length > 0" class="uploaded-file-list">
                    <div v-for="(file, index) in commonData.attachments" :key="index" class="file-item">
                      <div class="file-info">
                        <img class="icon-clip" src="/images/file.svg" alt="file" />
                        <span class="file-name">{{ file.name }}</span>
                        <span class="file-size">{{ formatFileSize(file.size) }}</span>
                      </div>
                      <button class="btn-remove-file" @click.stop="removeFile(index)">
                        <img src="/images/deletebutton.svg" alt="삭제" width="14" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <slot name="detail-section"></slot>

          </div>
        </div>

        <div v-if="!props.hideActions" class="action-buttons">
          <button class="btn-secondary" @click="onSave">
            <img class="btn-icon" src="/images/file.svg" />
            <span class="btn-text">임시저장</span>
          </button>
          <button class="btn-secondary" @click="onCancel">
            <img class="btn-icon" src="/images/cancel.svg" />
            <span class="btn-text">작성취소</span>
          </button>
          <button class="btn-primary" @click="onSubmit">
            <img class="btn-icon" src="/images/submit.svg" />
            <span class="btn-text-white">상신</span>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApprovalTemplateStore } from '@/stores/approval/approval.store';
import { useAuthStore } from '@/stores/auth';
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import {
  ApprovalDefaultLineDTO,
  ApprovalDefaultReferenceDTO
} from '@/types/approval/template.types';
import { SelectedApproverDTO } from '@/types/approval/organization.types';
import ApprovalLineModal from '@/views/approval/create/forms/ApprovalLineModal.vue';

const templateStore = useApprovalTemplateStore();
const authStore = useAuthStore();
const { template } = storeToRefs(templateStore);

const props = defineProps<{
  templateId: number;
  templateName: string;
  category: string;
  empName: string;
  empDept: string;
  empGrade: string;
  initialTitle?: string;
  initialLines?: ApprovalDefaultLineDTO[];
  initialReferences?: ApprovalDefaultReferenceDTO[];
  hideActions?: boolean;
}>();

const emit = defineEmits<{
  (e: 'saveDraft'): void;
  (e: 'cancel'): void;
  (e: 'submit'): void;
  (e: 'goBack'): void;
}>();

const commonData = reactive({
  title: '',
  lines: [] as ApprovalDefaultLineDTO[],
  references: [] as ApprovalDefaultReferenceDTO[],
  attachments: [] as File[]
});

onMounted(async () => {
  await initializeData();
});

watch(
  () => template.value,
  (newTemplate) => {
    if (newTemplate && newTemplate.templateId) {
      initializeData();
    }
  }
);

const initializeData = async () => {
  try {
    if (props.initialTitle) {
      commonData.title = props.initialTitle;
    }

    if (props.initialLines && props.initialLines.length > 0) {
      commonData.lines = props.initialLines;
    } else {
      const currentUser = authStore.user || {
        employeeId: 0,
        employeeName: props.empName,
        departmentId: 0,
        departmentName: props.empDept,
        gradeName: props.empGrade,
        jobTitleName: ''
      };

      const drafterLine: ApprovalDefaultLineDTO = {
        seq: 1,
        approverId: currentUser.employeeId,
        approverName: currentUser.employeeName,
        departmentId: currentUser.departmentId,
        departmentName: currentUser.departmentName,
        gradeName: currentUser.gradeName,
        jobTitleName: currentUser.jobTitleName,
      };

      if (!template.value || !template.value.lines) {
        commonData.lines = [drafterLine];
        commonData.references = [];
        return;
      }

      const defaultLines = template.value.lines;

      commonData.lines = [drafterLine, ...defaultLines];

    }

    if (props.initialReferences && props.initialReferences.length > 0) {
      commonData.references = props.initialReferences;
    } else if (template.value && template.value.references) {
      commonData.references = template.value.references || [];
    }

  } catch (error) {

    const currentUser = authStore.user || {
      employeeId: 0,
      employeeName: props.empName,
      departmentId: 0,
      departmentName: props.empDept,
      gradeName: props.empGrade,
      jobTitleName: ''
    };

    commonData.lines = [{
      seq: 1,
      approverId: currentUser.employeeId,
      approverName: currentUser.employeeName,
      departmentId: currentUser.departmentId,
      departmentName: currentUser.departmentName,
      gradeName: currentUser.gradeName,
      jobTitleName: currentUser.jobTitleName,
    }];
    commonData.references = [];
  }
};

const removeApprover = (index: number) => {
  if (index === 0) {
    alert("기안자(본인)는 결재선에서 제외할 수 없습니다.");
    return;
  }

  commonData.lines.splice(index, 1);

  commonData.lines.forEach((line, idx) => {
    line.seq = idx + 1;
  });
};

const removeReference = (index: number) => {
  commonData.references.splice(index, 1);
};


const isModalOpen = ref(false);
const modalType = ref<'LINE' | 'REF'>('LINE');

const openModal = (type: 'LINE' | 'REF') => {
  modalType.value = type;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleModalConfirm = (selectedEmployees: SelectedApproverDTO[]) => {

  if (modalType.value === 'LINE') {
    const currentCount = commonData.lines.length;
    const addCount = selectedEmployees.length;

    if (currentCount + addCount > 3) {
      alert("결재선은 본인 포함 최대 3단계까지만 지정 가능합니다.");
      return;
    }

    const maxSeq = Math.max(...commonData.lines.map(line => line.seq), 0);

    selectedEmployees.forEach((employee, index) => {
      const newLine: ApprovalDefaultLineDTO = {
        seq: maxSeq + index + 1,
        approverId: employee.approverId,
        approverName: employee.approverName,
        departmentId: employee.departmentId,
        departmentName: employee.departmentName,
        gradeName: employee.gradeName,
        jobTitleName: employee.jobTitleName,
      };

      commonData.lines.push(newLine);
    });


  } else {
    selectedEmployees.forEach(employee => {
      const newRef: ApprovalDefaultReferenceDTO = {
        referencerId: employee.approverId,
        referencerName: employee.approverName,
        departmentId: employee.departmentId,
        departmentName: employee.departmentName,
        gradeName: employee.gradeName,
        jobTitleName: employee.jobTitleName,
      };

      const exists = commonData.references.some(r => r.referencerId === newRef.referencerId);
      if (!exists) {
        commonData.references.push(newRef);
      }
    });

  }
  closeModal();
};


const currentDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileUpload = () => fileInput.value?.click();

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    commonData.attachments = [
      ...commonData.attachments,
      ...Array.from(target.files)
    ];
  }

  if (target.value) target.value = '';
};

const removeFile = (index: number) => commonData.attachments.splice(index, 1);

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getCommonData = () => ({
  title: commonData.title,
  lines: commonData.lines,
  attachments: commonData.attachments,
  references: commonData.references
});

const onSave = () => emit('saveDraft');
const onCancel = () => emit('cancel');
const onSubmit = () => emit('submit');

defineExpose({ getCommonData });
</script>

<style scoped>
@import "@/assets/styles/approval/commonform.css";
</style>