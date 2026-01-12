<template>
  <div class="page-container">
    <!-- 전체 화면 로딩 오버레이 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner-large"></div>
      <p>등록 중입니다...</p>
    </div>

    <div class="page-header">
      <div class="header-inner">
        <div class="title-wrapper">
          <img class="back-icon" src="/images/backArrow.svg" @click="goBack" />
          <h1 class="title">신규 사원 등록</h1>
        </div>
        <div class="button-group">
          <button class="btn-cancel" @click="goBack">취소</button>
          <button class="btn-save" @click="handleSave" :disabled="isLoading">
            <span>{{ isLoading ? '등록 중...' : '등록' }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="form-box">
        <!-- 단일 등록 폼 -->
        <div class="form-content">
          <h2 class="section-title">기본 정보</h2>
          <div class="form-grid">
            <div class="form-item">
              <label class="required">이름</label>
              <input type="text" v-model="formData.employeeName" placeholder="이름 입력" />
            </div>
            <div class="form-item">
              <label class="required">사번</label>
              <input type="text" v-model="formData.employeeNumber" placeholder="사번 입력" />
            </div>
            <div class="form-item">
              <label class="required">이메일</label>
              <input type="email" v-model="formData.email" placeholder="example@company.com" />
            </div>
            <div class="form-item">
              <label class="required">전화번호</label>
              <input type="tel" v-model="formData.phone" placeholder="010-0000-0000" />
            </div>
            <div class="form-item">
              <label class="required">성별</label>
              <div class="radio-group">
                <label><input type="radio" v-model="formData.gender" value="M" /> 남성</label>
                <label><input type="radio" v-model="formData.gender" value="F" /> 여성</label>
              </div>
            </div>
            <div class="form-item">
              <label>생년월일</label>
              <input type="date" v-model="formData.birthDate" />
            </div>
            <div class="form-item full-width">
              <label>주소</label>
              <input type="text" v-model="formData.address" placeholder="주소 입력" />
            </div>
              <div class="form-item full-width">
              <label class="required">프로필 사진</label>
              <input type="file" @change="handleFileChange" accept="image/*" />
            </div>
          </div>

          <h2 class="section-title">인사 정보</h2>
          <div class="form-grid">
            <div class="form-item">
              <label class="required">입사일</label>
              <input type="date" v-model="formData.hireDate" />
            </div>
            <div class="form-item">
              <label class="required">고용 형태</label>
              <select v-model="formData.contractType">
                <option value="">선택</option>
                <option value="정규직">정규직</option>
                <option value="계약직">계약직</option>
                <option value="인턴">인턴</option>
                <option value="일일근로자">일일근로자</option>
              </select>
            </div>
            <div class="form-item">
              <label>부서</label>
              <select v-model="formData.departmentName">
                <option disabled value="">부서를 선택하세요</option>
                <option v-for="dept in departmentOptions" :key="dept" :value="dept">{{ dept }}</option>
              </select>
            </div>
            <div class="form-item">
              <label>직급</label>
              <select v-model="formData.gradeName">
                <option disabled value="">직급을 선택하세요</option>
                <option v-for="grade in gradeOptions" :key="grade" :value="grade">{{ grade }}</option>
              </select>
            </div>
            <div class="form-item">
              <label>직책</label>
              <select v-model="formData.jobTitleName">
                <option disabled value="">직책을 선택하세요</option>
                <option v-for="title in jobTitleOptions" :key="title" :value="title">{{ title }}</option>
              </select>
            </div>
            <div class="form-item">
              <label class="required">기본급</label>
              <input 
                type="text" 
                :value="formData.baseSalary > 0 ? formData.baseSalary.toLocaleString() : ''" 
                @input="handleSalaryInput" 
                placeholder="기본급 입력 (원)" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { createEmployee, fetchEmployeeSearchOptions } from '@/api/personnel/personnel';
import type { EmployeeRegisterParams } from '@/types/personnel/personnel';

const router = useRouter();

const goBack = () => {
  router.push('/personnel/list');
};

const registrationType = ref<'single' | null>('single');

const departmentOptions = ref<string[]>([]);
const gradeOptions = ref<string[]>([]);
const jobTitleOptions = ref<string[]>([]);

const isLoading = ref(false);
const formData = reactive<EmployeeRegisterParams>({
  employeeName: '',
  employeeNumber: '',
  email: '',
  phone: '',
  contractType: '',
  gender: 'M',
  hireDate: '',
  imageFile: null,
  baseSalary: 0,
  birthDate: '',
  address: '',
  departmentName: '',
  gradeName: '',
  jobTitleName: '',
});

onMounted(async () => {
  try {
    const response = await fetchEmployeeSearchOptions();
    if (response.data.success) {
      departmentOptions.value = response.data.data.department;
      gradeOptions.value = response.data.data.grade;
      jobTitleOptions.value = response.data.data.jobTitle;
    }
  } catch (error) {
    console.error('옵션 정보를 불러오는데 실패했습니다.', error);
  }
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    formData.imageFile = target.files[0];
  } else {
    formData.imageFile = null; // 파일 선택 취소 시 초기화
  }
};

const handleSalaryInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  // 숫자 이외의 문자 제거
  const rawValue = target.value.replace(/[^0-9]/g, '');
  
  if (rawValue) {
    // 실제 데이터에는 숫자로 저장
    formData.baseSalary = parseInt(rawValue, 10);
    // 화면에는 천 단위 콤마를 붙여서 표시
    target.value = formData.baseSalary.toLocaleString();
  } else {
    formData.baseSalary = 0;
    target.value = '';
  }
};

// 타입 가드: 객체가 message 속성(문자열)을 가지고 있는지 확인
const hasMessage = (data: unknown): data is { message: string } => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof (data as any).message === 'string'
  );
};

// 타입 가드: 에러 객체가 response.data.message 구조를 가지고 있는지 확인
const isErrorWithResponse = (error: unknown): error is { response: { data: { message: string } } } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    hasMessage((error as any).response?.data)
  );
};

const handleSave = async () => {
  if (registrationType.value !== 'single') return;
  if (isLoading.value) return;

  // 필수값 체크
  if (!formData.employeeName || !formData.employeeNumber || !formData.email || !formData.phone || !formData.contractType || !formData.hireDate || !formData.baseSalary) {
    alert('필수 항목을 모두 입력해주세요.');
    return;
  }

  // FormData 생성
  const submitData = new FormData();
  submitData.append('employeeName', formData.employeeName);
  submitData.append('employeeNumber', formData.employeeNumber);
  submitData.append('email', formData.email);
  submitData.append('phone', formData.phone);
  submitData.append('contractType', formData.contractType);
  submitData.append('gender', formData.gender);
  submitData.append('hireDate', formData.hireDate);
  submitData.append('baseSalary', String(formData.baseSalary));
  
  if (formData.imageFile) {
    submitData.append('imageFile', formData.imageFile);
  }

  // 선택 항목 (값이 있는 경우에만 추가)
  if (formData.birthDate) submitData.append('birthDate', formData.birthDate);
  if (formData.address) submitData.append('address', formData.address);
  if (formData.departmentName) submitData.append('departmentName', formData.departmentName);
  if (formData.gradeName) submitData.append('gradeName', formData.gradeName);
  if (formData.jobTitleName) submitData.append('jobTitleName', formData.jobTitleName);

  isLoading.value = true;
  try {
    const response = await createEmployee(submitData);
    if (response.data.success) {
      alert('사원이 성공적으로 등록되었습니다.');
      router.push('/personnel/list');
    } else {
      if (hasMessage(response.data)) {
        alert(response.data.message);
      } else {
        alert('사원 등록에 실패했습니다.');
      }
    }
  } catch (error) {
    console.error('사원 등록 오류:', error);
    if (isErrorWithResponse(error)) {
      alert(error.response.data.message);
    } else {
      alert('사원 등록 중 오류가 발생했습니다.');
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #f8fafc;
  overflow: hidden;
}

.page-header {
  width: 100%;
  background: #ffffff;
  border-style: solid;
  border-color: #e2e8f0;
  border-width: 0px 0px 1px 0px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  min-height: 38px;
  justify-content: center;
}

.header-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.back-icon {
  cursor: pointer;
  width: 24px;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172b;
}

.button-group {
  display: flex;
  gap: 10px;
}

.btn-save {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  padding: 6px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-save:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: white;
  color: #62748e;
  padding: 6px 11px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
}

.content {
  width: 100%;
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.form-box {
  width: 100%;
  max-width: 1200px;
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 36px;
  margin: 0 auto;
  height: auto;
}

.registration-type-selector {
  display: flex;
  gap: 10px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 20px;
}

.type-button {
  flex: 1;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  color: #64748b;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-button:hover:not(:disabled) {
  background-color: #eff6ff;
  border-color: #1c398e;
  color: #1c398e;
}

.type-button.active {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  border-color: #1c398e;
}

.type-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.form-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #94a3b8;
  font-size: 16px;
}

.form-content {
  display: flex;
  flex-direction: column;
  margin-top: 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  border-left: 4px solid #1c398e;
  padding-left: 10px;
  margin-bottom: 15px; /* 제목과 그리드 사이의 간격 */
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

/* 인사 정보 섹션의 상단에만 추가적인 여백을 주어 구분을 명확히 합니다. */
.section-title + .form-grid + .section-title {
  margin-top: 40px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item.full-width {
  grid-column: span 2;
}

label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
}

.required::after {
  content: '*';
  color: #ef4444;
  margin-left: 4px;
}

input[type="text"],
input[type="email"],
input[type="tel"],
input[type="date"],
input[type="number"],
input[type="file"],
select {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

input:focus,
select:focus {
  border-color: #1c398e;
}

.input[type="file"]:disabled {
  background-color: #f8fafc;
  cursor: not-allowed;
}

.radio-group {
  display: flex;
  gap: 20px;
  padding: 10px 0;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: normal;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-item.full-width {
    grid-column: span 1;
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  font-weight: 600;
  color: #1c398e;
}

.spinner-large {
  width: 50px;
  height: 50px;
  border: 5px solid #e2e8f0;
  border-top-color: #1c398e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
