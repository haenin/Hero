<!-- 
  <pre>
  Vue Name   : ContactEditModal.vue
  Description : 연락처 정보 수정 모달

  History
  2025/12/28 (혜원) 최초 작성
  2025/12/29 (혜원) 전화번호 자동 하이픈 포맷팅 추가
  2025/12/29 (혜원) Vee-Validate 폼 검증 추가
  </pre>
 
  @author 혜원
  @version 1.4
 -->
<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>연락처 정보 수정</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <form @submit.prevent="onSubmit" class="modal-body">
        <!-- 이메일 -->
        <div class="form-group">
          <label class="label-with-icon">
            <img src="/images/email.svg" alt="이메일" class="label-icon" />
            이메일
          </label>
          <input 
            v-model="formData.email" 
            type="email" 
            placeholder="kim.developer@company.com"
            class="form-input"
            :class="{ 'input-error': errors.email }"
          />
          <div v-if="errors.email" class="error-text">{{ errors.email }}</div>
          <div v-else class="help-text">업무용 이메일 주소를 입력해주세요</div>
        </div>

        <!-- 휴대폰 -->
        <div class="form-group">
          <label class="label-with-icon">
            <img src="/images/phone.svg" alt="휴대폰" class="label-icon" />
            휴대폰
          </label>
          <input 
            v-model="formData.mobile" 
            type="tel" 
            placeholder="010-1234-5678"
            class="form-input"
            :class="{ 'input-error': errors.mobile }"
            @input="handlePhoneInput"
            maxlength="13"
          />
          <div v-if="errors.mobile" class="error-text">{{ errors.mobile }}</div>
          <div v-else class="help-text">숫자만 입력하면 자동으로 하이픈이 추가됩니다</div>
        </div>

        <!-- 주소 -->
        <div class="form-group">
          <label class="label-with-icon">
            <img src="/images/address.svg" alt="주소" class="label-icon" />
            주소
          </label>
          <input 
            v-model="formData.address" 
            type="text" 
            placeholder="서울시 강남구 테헤란로 123"
            class="form-input"
          />
        </div>

        <!-- 버튼 -->
        <div class="modal-footer">
          <button type="submit" class="btn-submit" :disabled="loading">
            <img src="/images/save.svg" alt="저장" style="width: 16px; height: 16px; filter: brightness(0) invert(1);" />
            {{ loading ? '저장 중...' : '저장' }}
          </button>
          <button type="button" class="btn-cancel" @click="handleClose">
            닫기
          </button>
        </div>
      </form>

      <!-- 에러 메시지 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { updateContactInfo, type ContactUpdateRequest } from '@/api/personnel/personnel';
import { useToast } from 'vue-toastification';
import { useQueryClient } from '@tanstack/vue-query';

interface Props {
  isOpen: boolean;
  initialData: {
    email: string;
    mobile: string;
    address?: string;
  };
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  success: [];
}>();

const toast = useToast();
const queryClient = useQueryClient();

/**
 * Vee-Validate 스키마 정의
 * 모든 필드 선택 입력 (nullable)
 * 값이 있을 때만 형식 검증
 */
const schema = yup.object({
  email: yup.string()
    .required('이메일을 입력해주세요')
    .email('이메일 형식이 올바르지 않습니다'),
  mobile: yup
    .string()
    .nullable()
    .test('mobile-format', '휴대폰 형식: 010-1234-5678', function(value) {
      // 값이 비어있으면 통과
      if (!value || value.trim() === '') return true;
      // 값이 있으면 전화번호 형식 검증
      return /^010-\d{4}-\d{4}$/.test(value);
    }),
  address: yup.string().nullable()
});

const { handleSubmit, setValues, errors, values } = useForm({
  validationSchema: schema,
  initialValues: {
    email: '',
    mobile: '',
    address: ''
  }
});

const formData = ref<ContactUpdateRequest>({
  email: '',
  mobile: '',
  address: ''
});

const loading = ref(false);
const error = ref<string | null>(null);

/**
 * Props 변경 시 폼 데이터 초기화
 */
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = {
      email: newData.email || '',
      mobile: newData.mobile || '',
      address: newData.address || ''
    };
    
    // Vee-Validate 값도 설정
    setValues({
      email: newData.email || '',
      mobile: newData.mobile || '',
      address: newData.address || ''
    });
  }
}, { immediate: true });

/**
 * formData 변경 시 Vee-Validate 동기화
 */
watch(() => formData.value, (newData) => {
  setValues({
    email: newData.email || '',
    mobile: newData.mobile || '',
    address: newData.address || ''
  });
}, { deep: true });

/**
 * 전화번호 자동 하이픈 포맷팅
 * 
 * @param value 입력된 전화번호 문자열
 * @returns 하이픈이 추가된 전화번호 (예: 010-1234-5678)
 */
const formatPhoneNumber = (value: string): string => {
  // 숫자만 추출
  const numbers = value.replace(/[^0-9]/g, '');
  
  // 길이에 따라 포맷팅
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  } else if (numbers.length <= 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  } else {
    // 11자 초과 시 11자까지만 사용
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }
};

/**
 * 휴대폰 입력 시 자동 포맷팅
 */
const handlePhoneInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const formatted = formatPhoneNumber(input.value);
  formData.value.mobile = formatted;
};

/**
 * 모달 닫기
 */
const handleClose = () => {
  error.value = null;
  emit('close');
};

/**
 * 폼 제출 (Vee-Validate)
 */
const onSubmit = handleSubmit(async () => {
  loading.value = true;
  error.value = null;

  try {
    // 빈 값을 빈 문자열로 전송 (백엔드에서 처리)
    const payload: ContactUpdateRequest = {
      email: formData.value.email?.trim() || '',
      mobile: formData.value.mobile?.trim() || '',
      address: formData.value.address?.trim() || ''
    };

    await updateContactInfo(payload);
    
    // 성공 토스트
    toast.success('연락처가 수정되었습니다');
    
    // 쿼리 무효화 (프로필 재조회)
    queryClient.invalidateQueries({ queryKey: ['employeeProfile'] });
    
    emit('success');
    handleClose();
  } catch (err: any) {
    console.error('연락처 수정 에러:', err);
    error.value = err.response?.data?.message || '연락처 정보 수정에 실패했습니다.';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
}, ({ errors }) => {
  if (errors.email) {
    toast.error(errors.email);
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 800px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #E2E8F0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1E293B;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #64748B;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #F1F5F9;
  color: #1E293B;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 400;
  color: #334155;
}

.label-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.help-text {
  color: #64748B;
  font-size: 14px;
  line-height: 20px;
}

.error-text {
  color: #DC2626;
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
}

.form-input {
  padding: 12px 16px;
  border: 1.2px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  color: #1E293B;
  transition: all 0.2s;
  background: white;
}

.form-input::placeholder {
  color: #94A3B8;
}

.form-input:focus {
  outline: none;
  border-color: #432DD7;
  box-shadow: 0 0 0 3px rgba(67, 45, 215, 0.1);
}

.form-input.input-error {
  border-color: #DC2626;
}

.form-input.input-error:focus {
  border-color: #DC2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.modal-footer {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-submit,
.btn-cancel {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-submit {
  background: #3b82f6;
  border: none;
  color: white;
}

.btn-submit svg {
  width: 16px;
  height: 16px;
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
}

.btn-submit:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.btn-cancel {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.error-message {
  margin: 0 24px 24px;
  padding: 12px;
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  border-radius: 8px;
  color: #DC2626;
  font-size: 14px;
}
</style>