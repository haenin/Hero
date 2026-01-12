<!--
 * <pre>
 * Vue Name        : ApprovalRejectModal.vue
 * Description     : 결재 반려 사유 입력 모달
 *
 * 컴포넌트 연계
 * - 부모 컴포넌트: ApprovalDetail.vue
 *
 * History
 * 2025/12/26 (민철) 최초 작성
 * 2026/01/06 (민철) 주석 제거
 * </pre>
 *
 * @module approval
 * @author 민철
 * @version 1.1
-->
<template>
    <div class="modal-container">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">반려 사유 입력</h2>
                <button class="btn-close" @click="closeModal">
                    <img src="/images/deletebutton.svg" alt="닫기" />
                </button>
            </div>

            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">반려 사유 <span class="required">*</span></label>
                    <textarea v-model="rejectComment" class="form-textarea" placeholder="반려 사유를 입력하세요 (필수)" rows="6"
                        maxlength="500"></textarea>
                    <div class="char-count">{{ rejectComment.length }} / 500</div>
                </div>

                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-cancel" @click="closeModal">
                    취소
                </button>
                <button class="btn-submit" @click="handleConfirm">
                    반려 처리
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'confirm', comment: string): void;
}>();

const rejectComment = ref('');
const errorMessage = ref('');

const closeModal = () => {
    emit('close');
};

const handleConfirm = () => {
    if (!rejectComment.value.trim()) {
        errorMessage.value = '반려 사유를 입력해주세요.';
        return;
    }

    if (rejectComment.value.trim().length < 10) {
        errorMessage.value = '반려 사유는 최소 10자 이상 입력해주세요.';
        return;
    }

    errorMessage.value = '';
    emit('confirm', rejectComment.value.trim());
};
</script>

<style scoped>
.modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: #ffffff;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;
}

.modal-title {
    font-family: "Inter-Regular", sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #0f172b;
    margin: 0;
}

.btn-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
}

.btn-close img {
    width: 20px;
    height: 20px;
}

.modal-body {
    padding: 24px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-family: "Inter-Regular", sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #334155;
}

.required {
    color: #dc2626;
}

.form-textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-family: "Inter-Regular", sans-serif;
    font-size: 14px;
    color: #334155;
    resize: vertical;
    min-height: 120px;
}

.form-textarea:focus {
    outline: none;
    border-color: #1c398e;
}

.char-count {
    font-family: "Inter-Regular", sans-serif;
    font-size: 12px;
    color: #64748b;
    text-align: right;
}

.error-message {
    margin-top: 12px;
    padding: 12px;
    background-color: #fee2e2;
    border-radius: 8px;
    font-family: "Inter-Regular", sans-serif;
    font-size: 13px;
    color: #991b1b;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid #e2e8f0;
}

.btn-cancel,
.btn-submit {
    padding: 10px 20px;
    border-radius: 8px;
    font-family: "Inter-Regular", sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-cancel {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    color: #64748b;
}

.btn-cancel:hover {
    background-color: #f8fafc;
}

.btn-submit {
    background: linear-gradient(180deg, #dc2626 0%, #991b1b 100%);
    border: none;
    color: #ffffff;
}

.btn-submit:hover {
    opacity: 0.9;
}
</style>