<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ type === 'GROUP' ? '발송 대상 그룹 선택' : '발송 대상 사원 선택' }}</h3>
        <button type="button" class="close-btn" @click="close">×</button>
      </div>

      <div class="modal-body">
        <!-- 그룹 선택 모드 -->
        <div v-if="type === 'GROUP'" class="group-selection">
          <!-- 1. 부서 선택 (복수 선택) -->
          <div class="selection-section">
            <h4>부서 선택 (복수 선택 가능)</h4>
            <div class="checkbox-list">
              <!-- 전체 선택 -->
              <label class="checkbox-item select-all">
                <input 
                  type="checkbox" 
                  :checked="isAllDepartmentsSelected"
                  @change="toggleAllDepartments"
                />
                <span><strong>전체 부서</strong></span>
              </label>
              <div class="divider"></div>
              <!-- 개별 부서 -->
              <label v-for="dept in departments" :key="dept.id" class="checkbox-item">
                <input type="checkbox" :value="dept.id" v-model="selectedDepartments" />
                <span>{{ dept.name }}</span>
              </label>
            </div>
          </div>

          <!-- 2. 발송 기준 선택 (직급 OR 직책) -->
          <div class="selection-section">
            <h4>발송 기준 선택</h4>
            <div class="criteria-selection">
              <label class="radio-label">
                <input type="radio" name="criteria" value="ALL" v-model="selectedCriteria" />
                <span>전체 (부서 내 모든 직원)</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="criteria" value="GRADE" v-model="selectedCriteria" />
                <span>직급별</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="criteria" value="JOB_TITLE" v-model="selectedCriteria" />
                <span>직책별</span>
              </label>
            </div>

            <!-- 직급 선택 -->
            <div v-if="selectedCriteria === 'GRADE'" class="sub-selection">
              <div class="checkbox-list">
                <label class="checkbox-item select-all">
                  <input 
                    type="checkbox" 
                    :checked="isAllGradesSelected"
                    @change="toggleAllGrades"
                  />
                  <span><strong>전체 직급</strong></span>
                </label>
                <div class="divider"></div>
                <label v-for="grade in filteredGrades" :key="grade.id" class="checkbox-item">
                  <input type="checkbox" :value="grade.id" v-model="selectedGrades" />
                  <span>{{ grade.name }}</span>
                </label>
              </div>
            </div>

            <!-- 직책 선택 -->
            <div v-if="selectedCriteria === 'JOB_TITLE'" class="sub-selection">
              <div class="checkbox-list">
                <label class="checkbox-item select-all">
                  <input 
                    type="checkbox" 
                    :checked="isAllJobTitlesSelected"
                    @change="toggleAllJobTitles"
                  />
                  <span><strong>전체 직책</strong></span>
                </label>
                <div class="divider"></div>
                <label v-for="jobTitle in filteredJobTitles" :key="jobTitle.id" class="checkbox-item">
                  <input type="checkbox" :value="jobTitle.id" v-model="selectedJobTitles" />
                  <span>{{ jobTitle.name }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- 개인 선택 모드 -->
        <div v-if="type === 'INDIVIDUAL'" class="individual-selection">
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="사원명 또는 부서명 검색" 
              @keyup.enter="handleSearch"
            />
            <button type="button" @click="handleSearch">검색</button>
          </div>
          <div class="employee-list">
            <div v-if="employees.length === 0" class="empty-list">
              검색 결과가 없습니다.
            </div>
            <label v-for="emp in employees" :key="emp.id" class="checkbox-item">
              <input type="checkbox" :value="emp.id" v-model="selectedEmployees" />
              <span class="emp-info">
                <span class="emp-name">{{ emp.name }}</span>
                <span class="emp-meta">{{ emp.department }} / {{ emp.grade }}</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="selected-count">
          <span v-if="type === 'GROUP'">
            {{ getSelectedSummary() }}
          </span>
          <span v-else>
            총 {{ selectedEmployees.length }}명 선택됨
          </span>
        </div>
        <div class="button-group">
          <button type="button" class="btn-cancel" @click="close">취소</button>
          <button type="button" class="btn-confirm" @click="confirm">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { getDepartments, getGrades, getJobTitles } from '@/api/settings';
import { fetchEmployees } from '@/api/personnel/personnel';

const props = defineProps<{
  visible: boolean;
  type: 'GROUP' | 'INDIVIDUAL';
  initialData?: any;
}>();

const emit = defineEmits(['close', 'confirm']);

// --- 상태 관리 ---
const selectedDepartments = ref<number[]>([]);
const selectedGrades = ref<number[]>([]);
const selectedJobTitles = ref<number[]>([]);
const selectedEmployees = ref<number[]>([]);
const selectedCriteria = ref<'ALL' | 'GRADE' | 'JOB_TITLE'>('ALL');
const searchQuery = ref('');
const departments = ref<any[]>([]);
const grades = ref<any[]>([]);
const jobTitles = ref<any[]>([]);
const employees = ref<any[]>([]);

// 관리자 ID 상수
const ADMIN_ID = 0;

// --- Computed - 관리자 제외 필터링 ---
const filteredGrades = computed(() => grades.value.filter(g => g.id !== ADMIN_ID));
const filteredJobTitles = computed(() => jobTitles.value.filter(j => j.id !== ADMIN_ID));

// --- Computed - 전체 선택 체크 상태 ---
const isAllDepartmentsSelected = computed(() => {
  return departments.value.length > 0 && 
         selectedDepartments.value.length === departments.value.length;
});

const isAllGradesSelected = computed(() => {
  return filteredGrades.value.length > 0 && 
         selectedGrades.value.length === filteredGrades.value.length;
});

const isAllJobTitlesSelected = computed(() => {
  return filteredJobTitles.value.length > 0 && 
         selectedJobTitles.value.length === filteredJobTitles.value.length;
});

// --- Methods - 전체 선택 토글 ---
const toggleAllDepartments = () => {
  if (isAllDepartmentsSelected.value) {
    selectedDepartments.value = [];
  } else {
    selectedDepartments.value = departments.value.map(d => d.id);
  }
};

const toggleAllGrades = () => {
  if (isAllGradesSelected.value) {
    selectedGrades.value = [];
  } else {
    selectedGrades.value = filteredGrades.value.map(g => g.id);
  }
};

const toggleAllJobTitles = () => {
  if (isAllJobTitlesSelected.value) {
    selectedJobTitles.value = [];
  } else {
    selectedJobTitles.value = filteredJobTitles.value.map(j => j.id);
  }
};

// --- Methods - 선택 요약 텍스트 ---
const getSelectedSummary = () => {
  const deptCount = selectedDepartments.value.length;
  const deptText = deptCount === departments.value.length ? '전체 부서' : `부서 ${deptCount}개`;
  
  if (selectedCriteria.value === 'ALL') {
    return `${deptText} (전체 직원)`;
  } else if (selectedCriteria.value === 'GRADE') {
    const gradeCount = selectedGrades.value.length;
    const gradeText = gradeCount === filteredGrades.value.length ? '전체 직급' : `직급 ${gradeCount}개`;
    return `${deptText}, ${gradeText}`;
  } else {
    const jobTitleCount = selectedJobTitles.value.length;
    const jobTitleText = jobTitleCount === filteredJobTitles.value.length ? '전체 직책' : `직책 ${jobTitleCount}개`;
    return `${deptText}, ${jobTitleText}`;
  }
};

// --- Methods - 데이터 조회 ---
const fetchDepartments = async () => {
  try {
    const response = await getDepartments();
    if (response.success) {
      const flatList: any[] = [];
      const traverse = (nodes: any[]) => {
        nodes.forEach(node => {
          if (node.departmentId !== 0 && node.departmentId !== -1) {
            flatList.push({ id: node.departmentId, name: node.departmentName });
          }
          if (node.children && node.children.length > 0) {
            traverse(node.children);
          }
        });
      };
      traverse(response.data);
      departments.value = flatList;
    }
  } catch (error) {
    console.error('부서 목록 조회 실패:', error);
  }
};

const fetchGrades = async () => {
  try {
    const response = await getGrades();
    if (response.success) {
      grades.value = response.data.map((g: any) => ({
        id: g.gradeId,
        name: g.grade
      }));
    }
  } catch (error) {
    console.error('직급 목록 조회 실패:', error);
  }
};

const fetchJobTitles = async () => {
  try {
    const response = await getJobTitles();
    if (response.success) {
      jobTitles.value = response.data.map((j: any) => ({
        id: j.jobTitleId,
        name: j.jobTitle
      }));
    }
  } catch (error) {
    console.error('직책 목록 조회 실패:', error);
  }
};

const handleSearch = async () => {
  try {
    const response = await fetchEmployees({
      departmentName: '',
      jobTitleName: '',
      gradeName: '',
      employeeName: searchQuery.value || '',
      resigningExpected: 0,
      page: 1,
      size: 100
    });

    if (response.data.success) {
      const list = response.data.data.content;
      employees.value = list.map((e: any) => ({
        id: e.employeeId,
        name: e.employeeName,
        department: e.departmentName || '미지정',
        grade: e.gradeName || '미지정'
      }));
    }
  } catch (error) {
    console.error('사원 검색 실패:', error);
    employees.value = [];
  }
};

const close = () => {
  emit('close');
};

const confirm = () => {
  if (props.type === 'GROUP') {
    const selectedDeptObjects = departments.value.filter(d => selectedDepartments.value.includes(d.id));
    
    // 선택 기준에 따라 직급 또는 직책만 전달
    let selectedGradeObjects: any[] = [];
    let selectedJobTitleObjects: any[] = [];
    
    if (selectedCriteria.value === 'GRADE') {
      selectedGradeObjects = grades.value.filter(g => selectedGrades.value.includes(g.id));
    } else if (selectedCriteria.value === 'JOB_TITLE') {
      selectedJobTitleObjects = jobTitles.value.filter(j => selectedJobTitles.value.includes(j.id));
    }

    emit('confirm', {
      departments: selectedDeptObjects,
      grades: selectedGradeObjects,
      jobTitles: selectedJobTitleObjects
    });
  } else {
    const selectedEmpObjects = employees.value.filter(e => selectedEmployees.value.includes(e.id));
    
    emit('confirm', {
      employees: selectedEmpObjects
    });
  }
};

// 발송 기준 변경 시 다른 선택 초기화
watch(selectedCriteria, (newValue, oldValue) => {
  if (oldValue === 'GRADE') {
    selectedGrades.value = [];
  } else if (oldValue === 'JOB_TITLE') {
    selectedJobTitles.value = [];
  }
});

// 모달이 열릴 때 데이터 로드 및 초기값 설정
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    if (props.type === 'GROUP') {
      await Promise.all([
        fetchDepartments(),
        fetchGrades(),
        fetchJobTitles()
      ]);
      
      if (props.initialData) {
        selectedDepartments.value = props.initialData.departments?.map((d: any) => d.id) || [];
        
        // 초기 데이터에서 직급 또는 직책 판단
        const hasGrades = props.initialData.grades && props.initialData.grades.length > 0;
        const hasJobTitles = props.initialData.jobTitles && props.initialData.jobTitles.length > 0;
        
        if (hasGrades) {
          selectedCriteria.value = 'GRADE';
          selectedGrades.value = props.initialData.grades.map((g: any) => g.id);
        } else if (hasJobTitles) {
          selectedCriteria.value = 'JOB_TITLE';
          selectedJobTitles.value = props.initialData.jobTitles.map((j: any) => j.id);
        } else {
          selectedCriteria.value = 'ALL';
        }
      } else {
        selectedDepartments.value = [];
        selectedGrades.value = [];
        selectedJobTitles.value = [];
        selectedCriteria.value = 'ALL';
      }
    } else {
      await handleSearch();
      
      if (props.initialData) {
        selectedEmployees.value = props.initialData.employees?.map((e: any) => e.id) || [];
      } else {
        selectedEmployees.value = [];
      }
    }
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-container {
  background: white; width: 600px; max-height: 85vh; border-radius: 14px;
  display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
.modal-header {
  padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;
}
.modal-header h3 { font-size: 18px; font-weight: 700; color: #1f2937; margin: 0; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b; }

.modal-body { padding: 24px; overflow-y: auto; flex: 1; }

/* Group Selection Styles */
.group-selection { display: flex; flex-direction: column; gap: 24px; }
.selection-section { display: flex; flex-direction: column; gap: 12px; }
.selection-section h4 { 
  font-size: 15px; font-weight: 600; color: #1c398e; margin: 0; 
  padding-bottom: 8px; border-bottom: 2px solid #1c398e;
}

/* 발송 기준 라디오 버튼 */
.criteria-selection {
  display: flex; flex-direction: column; gap: 10px; padding: 12px; 
  background: #f8fafc; border-radius: 8px;
}
.radio-label {
  display: flex; align-items: center; gap: 8px; cursor: pointer; 
  font-size: 14px; color: #334155; font-weight: 500;
}
.radio-label input[type="radio"] { cursor: pointer; }

/* 하위 선택 영역 */
.sub-selection {
  margin-top: 12px; padding: 12px; background: #ffffff; 
  border: 1px solid #e2e8f0; border-radius: 8px;
}

.checkbox-list { 
  display: flex; flex-direction: column; gap: 8px; max-height: 250px; 
  overflow-y: auto; padding-right: 8px;
}
.checkbox-item { 
  display: flex; align-items: center; gap: 10px; cursor: pointer; 
  padding: 6px 0; font-size: 14px; color: #334155;
}
.checkbox-item:hover { color: #1c398e; }
.checkbox-item.select-all { color: #1c398e; font-weight: 600; }
.divider { height: 1px; background: #e2e8f0; margin: 4px 0; }

/* Individual Selection Styles */
.search-box { display: flex; gap: 10px; margin-bottom: 16px; }
.search-box input { flex: 1; padding: 10px 14px; border: 2px solid #cad5e2; border-radius: 8px; font-size: 14px; }
.search-box input:focus { outline: none; border-color: #155dfc; }
.search-box button { padding: 0 20px; background: #155dfc; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }

.employee-list { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
.empty-list { text-align: center; color: #94a3b8; padding: 20px; }
.emp-info { display: flex; flex-direction: column; }
.emp-name { font-weight: 600; color: #1f2937; }
.emp-meta { font-size: 12px; color: #64748b; }

.modal-footer {
  padding: 20px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;
}
.selected-count { font-size: 14px; color: #1c398e; font-weight: 600; }
.button-group { display: flex; gap: 12px; }
.btn-cancel { padding: 10px 20px; border: 1px solid #cbd5e1; background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: #475569; }
.btn-confirm { padding: 10px 20px; background: #1c398e; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-confirm:hover { background: #162456; }

/* 스크롤바 스타일 */
.checkbox-list::-webkit-scrollbar,
.employee-list::-webkit-scrollbar {
  width: 6px;
}
.checkbox-list::-webkit-scrollbar-thumb,
.employee-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.checkbox-list::-webkit-scrollbar-thumb:hover,
.employee-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>