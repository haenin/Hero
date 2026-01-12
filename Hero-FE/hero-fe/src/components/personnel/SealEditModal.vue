<!-- 
  <pre>
  Vue Name   : SealEditModal.vue
  Description : 직인 편집 모달 - 텍스트/이미지 업로드/삭제

  History
  2025/12/28 (혜원) 최초 작성
  2025/12/28 (혜원) 삭제 버튼 추가
  </pre>
 
  @author 혜원
  @version 1.1
 -->
<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>직인 편집</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- 직인 유형 선택 -->
        <div class="seal-type-section">
          <label class="section-label">직인 유형 선택</label>
          <div class="seal-type-grid">
            <div 
              :class="['seal-type-card', { active: sealType === 'TEXT' }]"
              @click="sealType = 'TEXT'"
            >
              <img src="/images/text.svg" alt="텍스트" style="width: 16px; height: 16px;" />
              <span>텍스트 직인</span>
            </div>
            <div 
              :class="['seal-type-card', { active: sealType === 'IMAGE' }]"
              @click="sealType = 'IMAGE'"
            >
              <img src="/images/upload.svg" alt="업로드" style="width: 16px; height: 16px;" />

              <span>이미지 업로드</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- 컨텐츠 영역 -->
        <div class="content-grid">
          <!-- 좌측: 설정 -->
          <div class="settings-section">
            <!-- 텍스트 직인 설정 -->
            <div v-if="sealType === 'TEXT'" class="text-seal-settings">
              <div class="setting-header">
                <img src="/images/text.svg" alt="텍스트" style="width: 16px; height: 16px;" />
                <span>텍스트 직인 설정</span>
              </div>
              <div class="form-group">
                <label class="required">직인 텍스트</label>
                <input 
                  v-model="sealText" 
                  type="text" 
                  placeholder="김대리"
                  maxlength="10"
                  class="form-input"
                />
                <div class="help-text">일반적으로 이름을 사용합니다 (예: 김대리)</div>
                <div class="help-text">빨간색 원형 스타일로 자동 생성됩니다</div>
              </div>
            </div>

            <!-- 이미지 업로드 설정 -->
            <div v-else class="image-seal-settings">
              <div class="setting-header">
                <img src="/images/upload.svg" alt="업로드" style="width: 16px; height: 16px;" />
                <span>이미지 업로드</span>
              </div>
              <div class="upload-area" @click="triggerFileInput">
                <input 
                  ref="fileInput"
                  type="file" 
                  accept="image/png,image/jpeg,image/jpg"
                  @change="handleFileSelect"
                  style="display: none"
                />
                <div v-if="!previewUrl" class="upload-placeholder">
                  <svg viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="8" width="32" height="32" stroke="#94A3B8" stroke-width="4" fill="none"/>
                    <path d="M18 4L30 4M24 18L24 30" stroke="#94A3B8" stroke-width="4"/>
                  </svg>
                  <p>클릭하여 이미지 업로드</p>
                  <span>PNG, JPG (최대 5MB)</span>
                </div>
                <div v-else class="upload-preview">
                  <img :src="previewUrl" alt="미리보기" />
                  <button type="button" class="remove-btn" @click.stop="removeImage">×</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 우측: 미리보기 -->
          <div class="preview-section">
            <div class="preview-header">
              <img src="/images/seal.svg" alt="직인" style="width: 16px; height: 16px;" />
              <span>직인 미리보기</span>
            </div>

            <!-- 직인 미리보기 -->
            <div class="seal-preview-box">
              <div v-if="sealType === 'TEXT' && sealText" class="text-seal-preview">
                {{ sealText }}
              </div>
              <div v-else-if="sealType === 'IMAGE' && previewUrl" class="image-seal-preview">
                <img :src="previewUrl" alt="직인" />
              </div>
              <div v-else class="seal-preview-empty">
                <p>미리보기</p>
              </div>
            </div>

            <!-- 전자결재 적용 예시 -->
            <div class="approval-example">
              <div class="example-label">전자결재 적용 예시</div>
              <div class="example-box">
                <div class="example-info">
                  <div class="example-name">작성자: {{ employeeName || '김대리' }}</div>
                  <div class="example-date">{{ formatDate(new Date()) }}</div>
                </div>
                <div v-if="sealType === 'TEXT' && sealText" class="text-seal-small">
                  {{ sealText }}
                </div>
                <div v-else-if="sealType === 'IMAGE' && previewUrl" class="image-seal-small">
                  <img :src="previewUrl" alt="직인" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 버튼 -->
        <div class="modal-footer">
          <button 
            v-if="currentSealUrl" 
            type="button" 
            class="btn-delete" 
            @click="handleDelete"
          >
            <img src="/images/trashcan.svg" alt="삭제" style="width: 16px; height: 16px;" />
            삭제
          </button>
          <div class="footer-right">
            <button type="submit" class="btn-submit" :disabled="loading || !isValid">
              <img src="/images/save.svg" alt="저장" style="width: 16px; height: 16px; filter: brightness(0) invert(1);" />
              {{ loading ? '저장 중...' : '저장' }}
            </button>
            <button type="button" class="btn-cancel" @click="handleClose">
              닫기
            </button>
          </div>
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
import { ref, computed, watch } from 'vue';
import { uploadSealImage, deleteSeal } from '@/api/personnel/personnel';

interface Props {
  isOpen: boolean;
  employeeName?: string;
  currentSealUrl?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  success: [];
}>();

const sealType = ref<'TEXT' | 'IMAGE'>('TEXT');
const sealText = ref('');
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

/**
 * 폼 유효성 검사
 */
const isValid = computed(() => {
  if (sealType.value === 'TEXT') {
    return sealText.value.trim().length > 0;
  } else {
    return selectedFile.value !== null;
  }
});

/**
 * 모달 초기화
 */
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    sealType.value = 'TEXT';
    sealText.value = props.employeeName || '';
    selectedFile.value = null;
    
    if (props.currentSealUrl) {
      previewUrl.value = props.currentSealUrl;
    } else {
      previewUrl.value = null;
    }
    
    error.value = null;
  }
});

/**
 * 파일 선택 트리거
 */
const triggerFileInput = () => {
  fileInput.value?.click();
};

/**
 * 파일 선택 핸들러
 */
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    error.value = '파일 크기는 5MB 이하여야 합니다.';
    return;
  }

  if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
    error.value = 'PNG, JPG 파일만 업로드 가능합니다.';
    return;
  }

  selectedFile.value = file;
  error.value = null;

  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

/**
 * 이미지 제거
 */
const removeImage = () => {
  selectedFile.value = null;
  previewUrl.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

/**
 * 날짜 포맷팅
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

/**
 * 모달 닫기
 */
const handleClose = () => {
  error.value = null;
  emit('close');
};

/**
 * 텍스트를 원형 직인 이미지로 생성
 */
const generateSealImage = (text: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const size = 300; 
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context를 가져올 수 없습니다.'));
      return;
    }

    ctx.clearRect(0, 0, size, size);

    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 20, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#DC2626';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const fontSize = text.length === 2 ? 80 : text.length === 3 ? 60 : 50;
    ctx.font = `${fontSize}px Arial, sans-serif`;
    
    const chars = text.split('');
    const totalHeight = chars.length * fontSize;
    const startY = (size - totalHeight) / 2 + fontSize / 2;
    
    chars.forEach((char, index) => {
      ctx.fillText(char, size / 2, startY + index * fontSize);
    });

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('이미지 생성에 실패했습니다.'));
      }
    }, 'image/png');
  });
};

/**
 * 직인 삭제 핸들러
 */
const handleDelete = async () => {
  if (!confirm('정말 직인을 삭제하시겠습니까?')) {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await deleteSeal();
    emit('success');
    handleClose();
  } catch (err: any) {
    console.error('직인 삭제 에러:', err);
    error.value = err.response?.data?.message || '직인 삭제에 실패했습니다.';
  } finally {
    loading.value = false;
  }
};

/**
 * 폼 제출
 */
const handleSubmit = async () => {
  if (!isValid.value) return;

  loading.value = true;
  error.value = null;

  try {
    if (sealType.value === 'TEXT') {
      const sealBlob = await generateSealImage(sealText.value);
      const formData = new FormData();
      const filename = `seal_${Date.now()}.png`;
      formData.append('file', sealBlob, filename);
      await uploadSealImage(formData);
    } else {
      if (!selectedFile.value) {
        throw new Error('파일을 선택해주세요.');
      }

      const formData = new FormData();
      formData.append('file', selectedFile.value);
      await uploadSealImage(formData);
    }

    emit('success');
    handleClose();
  } catch (err: any) {
    console.error('직인 저장 에러:', err);
    error.value = err.response?.data?.message || '직인 저장에 실패했습니다.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 기존 스타일 유지 */
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
  width: 900px;
  max-width: 95%;
  max-height: 95vh;
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
  padding: 33px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.seal-type-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-label {
  font-size: 16px;
  font-weight: 400;
  color: #334155;
}

.seal-type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.seal-type-card {
  padding: 14px;
  border: 1.2px solid #E2E8F0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.seal-type-card.active {
  background: rgba(67, 45, 215, 0.05);
  border-color: #432DD7;
}

.seal-type-card:hover {
  border-color: #432DD7;
}

.seal-type-card svg {
  width: 24px;
  height: 24px;
  color: #432DD7;
}

.seal-type-card span {
  font-size: 14px;
  color: #334155;
}

.divider {
  height: 1.2px;
  background: #E2E8F0;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.setting-header,
.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 16px;
  color: #334155;
}

.setting-header svg,
.preview-header svg {
  width: 20px;
  height: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 16px;
  color: #334155;
}

.form-group label.required::after {
  content: ' *';
  color: #FB2C36;
}

.form-input {
  padding: 12px 16px;
  border: 1.2px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  color: #1E293B;
  transition: all 0.2s;
}

.form-input::placeholder {
  color: #94A3B8;
}

.form-input:focus {
  outline: none;
  border-color: #432DD7;
}

.help-text {
  color: #64748B;
  font-size: 14px;
  line-height: 20px;
}

.upload-area {
  cursor: pointer;
}

.upload-placeholder {
  background: #F8FAFC;
  border: 1.2px dashed #E2E8F0;
  border-radius: 12px;
  padding: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}

.upload-placeholder:hover {
  border-color: #432DD7;
  background: rgba(67, 45, 215, 0.02);
}

.upload-placeholder svg {
  width: 48px;
  height: 48px;
  opacity: 0.3;
}

.upload-placeholder p {
  margin: 0;
  font-size: 14px;
  color: #334155;
}

.upload-placeholder span {
  font-size: 12px;
  color: #94A3B8;
}

.upload-preview {
  position: relative;
  background: #F8FAFC;
  border: 1.2px solid #E2E8F0;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-preview img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.seal-preview-box {
  background: #F8FAFC;
  border: 1.2px solid #E2E8F0;
  border-radius: 12px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.text-seal-preview {
  width: 128px;
  height: 128px;
  border: 3.6px solid #DC2626;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #DC2626;
  font-size: 24px;
  font-weight: 400;
  writing-mode: vertical-rl;
  text-orientation: upright;
}

.image-seal-preview img {
  max-width: 128px;
  max-height: 128px;
  object-fit: contain;
}

.seal-preview-empty {
  color: #94A3B8;
  font-size: 14px;
}

.approval-example {
  background: white;
  border: 1.2px solid #E2E8F0;
  border-radius: 12px;
  padding: 17px;
}

.example-label {
  color: #64748B;
  font-size: 14px;
  margin-bottom: 12px;
}

.example-box {
  background: #F8FAFC;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  min-height: 160px;
}

.example-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.example-name {
  color: #334155;
  font-size: 14px;
}

.example-date {
  color: #64748B;
  font-size: 12px;
}

.text-seal-small {
  width: 96px;
  height: 96px;
  border: 3.6px solid #DC2626;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #DC2626;
  font-size: 24px;
  writing-mode: vertical-rl;
  text-orientation: upright;
}

.image-seal-small img {
  max-width: 96px;
  max-height: 96px;
  object-fit: contain;
}

/* 버튼 영역 */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.footer-right {
  display: flex;
  margin-left: auto;
  gap: 12px;
}

.btn-submit,
.btn-cancel,
.btn-delete {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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

.btn-delete {
  background: white;
  border: 1px solid #ef4444;
  color: #DC2626;
}

.btn-delete:hover {
  background: #fef2f2;
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