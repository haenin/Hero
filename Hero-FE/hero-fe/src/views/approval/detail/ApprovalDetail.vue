<!--
 * <pre>
 * Vue Name        : ApprovalDetail.vue
 * Description     : 결재 문서 조회 화면 (디버깅 버전)
 *
 * 컴포넌트 연계
 * - 문서 상세 정보 표시
 * - 결재선, 참조자 정보 표시
 * - 결재 권한이 있는 경우 승인/반려 버튼 표시 (순차 결재)
 *
 * History
 * 2025/12/26 (민철) 최초 작성
 * 2025/12/26 (민철) 결재 처리 기능 추가
 * 2025/12/26 (민철) 순차 결재 로직 적용
 * 2025/12/26 (민철) 디버깅 정보 추가
 * 2025/12/29 (민철) 디버깅 정보 삭제, 승인/반려 상태 뱃지 반지름 10px로 변경
 * 2026/01/06 (민철) 주석 제거, 뒤로가기
 * </pre>
 *
 * @module approval
 * @author 민철
 * @version 3.2
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

                <div class="action-group" v-if="document">
                    <template v-if="isDraftDocument && !isEditMode">
                        <button class="btn-edit" @click="goToEdit">
                            <img class="btn-icon" src="/images/approval-white.svg" alt="수정" />
                            <span class="btn-text-white">수정</span>
                        </button>
                        <button class="btn-edit" @click="goToDelete(document.docId)">
                            <img class="btn-icon" src="/images/cancel-white.svg" alt="삭제" />
                            <span class="btn-text-white">삭제</span>
                        </button>
                    </template>
                    <div
                        v-if="(document.docStatus === 'INPROGRESS' && (document.drafterId === authStore.user?.employeeId))">
                        <button class="btn-primary" @click="handleCancel(document.docId)">
                            <img class="btn-icon" src="/images/cancel-white.svg" alt="회수">
                            <span class="btn-text-white">회수</span>
                        </button>
                    </div>
                    <div v-if="!(document.docStatus === 'DRAFT')" class="status-badge"
                        :class="getStatusClass(document.docStatus)">
                        {{ getStatusText(document.docStatus) }}
                    </div>



                    <template v-if="isEditMode && isDraftDocument">
                        <button class="btn-secondary" @click="handleSaveEdit">
                            <img class="btn-icon" src="/images/file.svg" alt="저장" />
                            <span class="btn-text">임시저장</span>
                        </button>
                        <button class="btn-primary" @click="handleSubmitEdit">
                            <img class="btn-icon" src="/images/submit.svg" alt="상신" />
                            <span class="btn-text-white">상신</span>
                        </button>
                    </template>

                    <template v-if="canApprove && !isEditMode">
                        <button class="btn-reject" @click="openRejectModal">
                            <img class="btn-icon" src="/images/cancel-white.svg" alt="반려" />
                            <span class="btn-text-white">반려</span>
                        </button>
                        <button class="btn-approve" @click="handleApprove">
                            <img class="btn-icon" src="/images/submit.svg" alt="승인" />
                            <span class="btn-text-white">승인</span>
                        </button>
                    </template>
                </div>
            </div>
        </div>

        <div class="page-body">
            <div class="form-wrapper">
                <div class="form-container">

                    <div v-if="loading" class="loading-container">
                        <div class="loading-text">문서를 불러오는 중...</div>
                    </div>

                    <div v-else-if="error" class="error-container">
                        <div class="error-text">{{ error }}</div>
                    </div>

                    <ApprovalDetailCommonForm v-else-if="document && !isEditMode" :document="document"
                        :parsedDetails="parsedDetails">
                        <template #detail-section>
                            <component :is="currentDetailSection" :modelValue="parsedDetails" :readonly="true" />
                        </template>
                    </ApprovalDetailCommonForm>

                    <ApprovalCreateCommonForm v-else-if="document && isEditMode" ref="commonFormRef"
                        :templateId="document.templateId" :templateName="document.templateName"
                        :category="document.category" :empName="authStore.user?.employeeName || ''"
                        :empDept="authStore.user?.departmentName || ''" :empGrade="authStore.user?.gradeName || ''"
                        :initialTitle="document.title" :initialLines="formattedLines"
                        :initialReferences="formattedReferences" :document="document" :hideActions="true">
                        <template #detail-section>
                            <component :is="currentDetailSection" v-model="sectionData" />
                        </template>
                    </ApprovalCreateCommonForm>

                </div>
            </div>
        </div>

        <Teleport to="body">
            <ApprovalRejectModal v-if="isRejectModalOpen" @close="closeRejectModal" @confirm="handleReject" />
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApprovalDetail } from '@/composables/approval/useApprovalDetail';
import { useApprovalDocument } from '@/composables/approval/useApprovalDocument';
import { processApproval } from '@/api/approval/approval_action.api';
import { useAuthStore } from '@/stores/auth';
import ApprovalDetailCommonForm from '@/views/approval/detail/ApprovalDetailCommonForm.vue';
import ApprovalCreateCommonForm from '@/views/approval/create/ApprovalCreateCommonForm.vue';
import ApprovalRejectModal from './ApprovalRejectModal.vue';
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
} from '@/views/approval/create/forms';
import {
    ApprovalDefaultLineDTO,
    ApprovalDefaultReferenceDTO
} from '@/types/approval/template.types';


const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const docId = computed(() => Number(route.params.docId));

const isEditMode = computed(() => route.query.edit === 'true');


const { document, parsedDetails, loading, error, fetchDocument } = useApprovalDetail(docId.value);
const { updateDraft, submitDraft, cancelDocument, deleteDocument } = useApprovalDocument();


const commonFormRef = ref<InstanceType<typeof ApprovalCreateCommonForm>>();
const sectionData = ref<any>({});

watch(() => isEditMode.value, (newValue) => {
    if (newValue && parsedDetails.value) {
        sectionData.value = { ...parsedDetails.value };
    }
}, { immediate: true });

watch(() => parsedDetails.value, (newValue) => {
    if (isEditMode.value && newValue) {
        sectionData.value = { ...newValue };
    }
}, { immediate: true });

const currentDate = computed(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
});

const createRequestDTO = (status: 'draft' | 'submitted') => {
    const commonFormData = commonFormRef.value?.getCommonData();
    const detailsJsonString = JSON.stringify(sectionData.value);

    if (!document.value) {
        throw new Error('문서 정보가 없습니다.');
    }

    return {
        formType: document.value.templateKey,
        documentType: document.value.category,
        title: commonFormData?.title || '',
        drafter: authStore.user?.employeeName || '',
        department: authStore.user?.departmentName || '',
        grade: authStore.user?.gradeName || '',
        draftDate: currentDate.value,
        status: status,
        submittedAt: status === 'submitted' ? new Date().toISOString() : null,
        lines: commonFormData?.lines || [],
        references: commonFormData?.references || [],
        details: detailsJsonString
    };
};

const handleSaveEdit = async () => {
    try {
        const requestDTO = createRequestDTO('draft');
        const commonFormData = commonFormRef.value?.getCommonData();
        const files = commonFormData?.attachments || [];

        await updateDraft(docId.value, requestDTO, files);

        router.push(`/approval/documents/${docId.value}`);
    } catch (error) {
        alert('임시저장 중 오류가 발생했습니다.');
    }
};

const handleSubmitEdit = async () => {
    try {
        const requestDTO = createRequestDTO('submitted');
        const commonFormData = commonFormRef.value?.getCommonData();
        const files = commonFormData?.attachments || [];

        if (!document.value) {
            throw new Error('문서 정보가 없습니다.');
        }

        const response = await submitDraft(docId.value, requestDTO, files, document.value.templateKey);

        if (response) {
            router.push('/approval/inbox');
        }
    } catch (error) {
        alert('상신 중 오류가 발생했습니다.');
    }
};


const isRejectModalOpen = ref(false);

const isDraftDocument = computed(() => {
    if (!document.value || !authStore.user) return false;

    return document.value.docStatus === 'DRAFT' &&
        document.value.drafterId === authStore.user.employeeId;
});

const myLine = computed(() => {
    if (!document.value || !authStore.user) return null;

    const currentEmployeeId = authStore.user.employeeId;
    return document.value.lines.find(
        line => line.approverId === currentEmployeeId
    );
});

const canApprove = computed(() => {
    if (!document.value || !authStore.user || !myLine.value) {
        return false;
    }

    if (document.value.docStatus !== 'INPROGRESS' || myLine.value.status !== 'PENDING') {
        return false;
    }

    const previousLines = document.value.lines.filter(
        line => line.seq < myLine.value!.seq && line.seq > 1
    );

    if (previousLines.length === 0) {
        return true;
    }

    const allPreviousApproved = previousLines.every(
        line => line.status === 'APPROVED'
    );

    return allPreviousApproved;
});

const myLineId = computed(() => {
    return myLine.value?.lineId || null;
});

const handleApprove = async () => {
    if (!myLineId.value) return;

    if (!confirm('이 문서를 승인하시겠습니까?')) {
        return;
    }

    try {
        const response = await processApproval({
            docId: docId.value,
            lineId: myLineId.value,
            action: 'APPROVE',
        });

        if (response.success) {
            alert('승인 처리되었습니다.');
            await fetchDocument(docId.value);
        } else {
            alert(response.message || '승인 처리에 실패했습니다.');
        }
    } catch (error) {
        console.error('approve error:', error);
        alert('승인 처리 중 오류가 발생했습니다.');
    }
};

const openRejectModal = () => {
    isRejectModalOpen.value = true;
};

const closeRejectModal = () => {
    isRejectModalOpen.value = false;
};

const handleReject = async (comment: string) => {
    if (!myLineId.value) return;

    try {
        const response = await processApproval({
            docId: docId.value,
            lineId: myLineId.value,
            action: 'REJECT',
            comment: comment,
        });

        if (response.success) {
            alert('반려 처리되었습니다.');
            closeRejectModal();
            await fetchDocument(docId.value);
        } else {
            alert(response.message || '반려 처리에 실패했습니다.');
        }
    } catch (error) {
        console.error('reject error:', error);
        alert('반려 처리 중 오류가 발생했습니다.');
    }
};

const handleCancel = async (docId: number) => {
    if (!confirm('이 문서를 회수하시겠습니까?')) {
        return;
    }
    try {
        await cancelDocument(docId);

        await fetchDocument(docId);
    } catch (error) {
        console.error('cancel error:', error);
        alert('회수 처리 중 오류가 발생했습니다.');
    }

};


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
    if (!document.value) return null;
    return sectionMap[document.value.templateKey];
});


const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
        'DRAFT': '임시저장',
        'INPROGRESS': '진행중',
        'APPROVED': '승인',
        'REJECTED': '반려',
    };
    return statusMap[status] || status;
};

const getStatusClass = (status: string): string => {
    const classMap: Record<string, string> = {
        'DRAFT': 'status-draft',
        'INPROGRESS': 'status-inprogress',
        'APPROVED': 'status-approved',
        'REJECTED': 'status-rejected',
    };
    return classMap[status] || '';
};

const goBack = () => {
    router.back();
};

const goToEdit = () => {
    router.push(`/approval/documents/${docId.value}?edit=true`);
};

const goToDelete = async (docId: number) => {
    if (!confirm('이 문서를 삭제하시겠습니까?')) {
        return;
    }

    try {
        await deleteDocument(docId);
        router.push('/approval/inbox');
    } catch (error) {
        console.error('delete error:', error);
    }
};

const formattedLines = computed<ApprovalDefaultLineDTO[]>(() => {
    if (!document.value || !document.value.lines) {
        return [];
    }

    return document.value.lines.map(line => ({
        seq: line.seq,
        approverId: line.approverId,
        approverName: line.approverName,
        departmentId: 0,
        departmentName: line.departmentName,
        gradeName: line.gradeName,
        jobTitleName: line.jobTitleName
    }));
});

const formattedReferences = computed<ApprovalDefaultReferenceDTO[]>(() => {
    if (!document.value || !document.value.references) {
        return [];
    }

    return document.value.references.map(ref => ({
        referencerId: ref.referencerId,
        referencerName: ref.referencerName,
        departmentId: 0,
        departmentName: ref.departmentName,
        gradeName: ref.gradeName,
        jobTitleName: ref.jobTitleName
    }));
});
</script>

<style scoped>
@import "@/assets/styles/approval/approval-detail.css";
</style>