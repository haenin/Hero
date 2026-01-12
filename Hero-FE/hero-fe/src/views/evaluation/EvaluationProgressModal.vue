
<!-- 
  File Name   : EvaluationProgressModal.vue
  Description : 평가 진행상황 모달 페이지
 
  History
  2025/12/14 - 승민 최초 작성
 
  @author 승민
  @version 1.0
-->

<!--template-->
<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal" @click.stop>

      <!-- ===== Header ===== -->
      <header class="modal-header">
        <div class="header-left">
          <img class="header-icon" src="/images/aaaapeople.svg"></img>
          <div class="header-text">
            <h2>평가 진행 현황</h2>
            <p class="subtitle">
              {{ evaluationDetail?.evaluationName }} ·
              {{ evaluationDetail?.evaluationDepartmentName }} ·
              {{ formatPeriod(evaluationDetail) }}
            </p>
          </div>
        </div>

        <button class="close-btn" @click="emit('close')">
          <img class="close-img" src="/images/deletebutton.svg"></img>
        </button>
      </header>

      <!-- ===== Summary ===== -->
      <section class="summary">
        <div class="summary-card dark">
          <span class="label">전체 인원</span>
          <strong>{{ summary.total }} 명</strong>
        </div>

        <div class="summary-card blue">
          <span class="label">제출 완료</span>
          <strong>{{ summary.done }} 명</strong>
        </div>

        <div class="summary-card sky">
          <span class="label">미실시</span>
          <strong>{{ summary.progress }} 명</strong>
        </div>
      </section>

      <!-- ===== Employee Table ===== -->
      <section class="employee-table">

        <div class="table-header">
          <div>번호</div>
          <div>이름</div>
          <div>직급</div>
          <div>평가 상태</div>
          <div>작업</div>
        </div>

        <div
          class="table-row"
          v-for="(emp, index) in evaluatees"
          :key="emp.evaluateeEvaluateeId"
        >
          <div>{{ index + 1 }}</div>
          <div class="name">{{ emp.evaluateeEmployeeName }}</div>
          <div class="muted">{{ emp.evaluateeGrade }}</div>

          <!-- 상태 -->
          <div>
            <span :class="['status', statusClass(emp.evaluateeStatus)]">
              {{ statusText(emp.evaluateeStatus) }}
            </span>
          </div>

          <!-- 액션 버튼 -->
          <div class="action">
            <!-- 미실시 -->
            <button
              v-if="emp.evaluateeStatus === 0 && authEmployeeId === emp.evaluateeEmployeeId"
              class="btn-action primary"
              @click="goWrite(emp)"
            >
              평가서 작성
            </button>

            <!-- 제출 완료 -->
            <button
              v-else-if="emp.evaluateeStatus === 1 && authEmployeeId === emp.evaluateeEmployeeId"
              class="btn-action warning"
              @click="goEdit(emp)"
            >
              수정하기
            </button>

            <button
              v-else-if="
                emp.evaluateeStatus === 1 &&
                authEmployeeId === evaluationDetail?.evaluationEmployeeId
              "
              class="btn-action primary"
              @click="goEvaluate(emp)"
            >
              평가하기
            </button>
            

            <!-- 평가 완료 -->
            <button
              v-else-if="emp.evaluateeStatus === 2 && 
              (authEmployeeId === emp.evaluateeEmployeeId || authEmployeeId === evaluationDetail?.evaluationEmployeeId || authStore.hasAnyRole(['ROLE_HR_MANAGER','ROLE_HR_EVALUATION']))"
              class="btn-action primary"
              @click="goView(emp)"
            >
              평가 확인
            </button>
          </div>
        </div>

      </section>

    </div>
  </div>
</template>

<!--script-->
<script setup lang="ts">
//Import 구문
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api/apiClient";
import { useAuthStore } from '@/stores/auth';

//외부 로직
const router = useRouter();
const authStore = useAuthStore();

// props 데이터
const props = defineProps<{
  evaluation: any; // 부모에서 선택된 evaluation row
}>();


const emit = defineEmits<{
  (e: "close"): void;
}>();

//Reactive 데이터
const evaluationDetail = ref<any>(null);
const employeeId = ref();
const departmentId = ref();
const evaluatees = ref<any[]>([]);

const authEmployeeId = ref();
const authEmployeeName = ref();
const authDepartmentId = ref();
const authDepartmentName = ref();
const authGradeId = ref();
const authGradeName = ref();

authEmployeeId.value = authStore.user?.employeeId
authEmployeeName.value = authStore.user?.employeeName
authDepartmentId.value = authStore.user?.departmentId
authDepartmentName.value = authStore.user?.departmentName
authGradeId.value = authStore.user?.gradeId
authGradeName.value = authStore.user?.gradeName

/**
 * 설명: 평가 세부 데이터 조회
 */
const fetchEvaluationDetail = async () => {
  if (!props.evaluation?.evaluationEvaluationId) return;

  try {
    const res = await apiClient.get(
      `/evaluation/evaluation/${props.evaluation.evaluationEvaluationId}`
    );

    evaluationDetail.value = res.data;
    employeeId.value = res.data.evaluationEmployeeId;
    departmentId.value = res.data.evaluationDepartmentId;
    evaluatees.value = res.data.evaluatees ?? [];
  } catch (e) {
    console.error("평가 상세 조회 실패", e);
  }
};

/**
 * 설명: 평가서 작성
 */
const goWrite = (emp: any) => {
  const evaluationId = evaluationDetail.value?.evaluationEvaluationId;
  if (!evaluationId) return;

  router.push({
    path: `/evaluation/form/create/${evaluationId}`,
    query: {
      employeeId: emp.evaluateeEmployeeId,
      departmentId: departmentId.value,
    },
  });
};

/**
 * 설명: 평가서 수정
 */
const goEdit = (emp: any) => {
  const evaluationId = evaluationDetail.value?.evaluationEvaluationId;
  if (!evaluationId) return;

  router.push({
    path: `/evaluation/form/edit/${evaluationId}`,
    query: {
      employeeId: emp.evaluateeEmployeeId,
      departmentId: departmentId.value,
    },
  });
};

/**
 * 설명: 평가서 확인
 */
const goView = (emp: any) => {
  const evaluationId = evaluationDetail.value?.evaluationEvaluationId;
  if (!evaluationId) return;

  router.push({
    path: `/evaluation/form/${evaluationId}`,
    query: {
      employeeId: emp.evaluateeEmployeeId,
      departmentId: departmentId.value,
    }
  })
};

/**
 * 설명: 평가하기 페이지로 이동하는 메소드
 * @param {any} emp - 평가 데이터 
 */
const goEvaluate = (emp: any) => {
  const evaluationId = evaluationDetail.value?.evaluationEvaluationId;
  if (!evaluationId) return;

  router.push({
    path: `/evaluation/evaluate/${evaluationId}`,
    query: {
      employeeId: emp.evaluateeEmployeeId,
      departmentId: departmentId.value,
    },
  });
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    emit("close");
  }
};

/**
 * 설명: 마운트 시, 평가 세부 데이터 조회
 */
onMounted(() => {
  fetchEvaluationDetail();
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});

/**
 * 설명: 페이지네이션 버튼 계산 메소드
 */
const summary = computed(() => {
  const total = evaluatees.value.length;
  const done = evaluatees.value.filter(e => e.evaluateeStatus === 1 || e.evaluateeStatus === 2).length;
  const progress = evaluatees.value.filter(e => e.evaluateeStatus === 0).length;

  const rate = (v: number) =>
    total === 0 ? 0 : Math.round((v / total) * 100);

  return {
    total,
    done,
    progress,
    doneRate: rate(done),
    progressRate: rate(progress),
  };
});

/**
 * 설명: 피평가자 상태 조회 메소드
 * @param {number} status - 피평가자 상태 값 
 */
const statusText = (status: number) => {
  switch (status) {
    case 0: return "미실시";
    case 1: return "제출 완료";
    case 2: return "평가 완료";
    default: return "-";
  }
};

/**
 * 설명: 평가 상태 메소드
 * @param {number} status - 평가 상태 값 
 */
const statusClass = (status: number) => {
  switch (status) {
    case 0: return "done";
    case 1: return "progress";
    default: return "none";
  }
};

/**
 * 설명: 평가 기간 타입 변환 메소드
 * @param {any} item - 평가 기간 데이터 
 */
const formatPeriod = (item: any) => {
  if (!item?.evaluationEvaluationPeriodStart) return "-";
  const s = new Date(item.evaluationEvaluationPeriodStart).toLocaleDateString("ko-KR");
  const e = new Date(item.evaluationEvaluationPeriodEnd).toLocaleDateString("ko-KR");
  return `${s} ~ ${e}`;
};
</script>

<!--style-->
<style scoped>
/* ===== Overlay ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 43, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

/* ===== Modal ===== */
.modal {
  width: 750px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

/* ===== Header ===== */
.modal-header {
  height: 100px;
  padding: 24px;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom-color: rgb(226, 232, 240);
}

.header-left {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.header-icon {
  margin-top: 21px;
  width: 30px;
  height: 30px;
}

.header-text h2 {
  color: black;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 5px;
}

.subtitle {
  color: black;
  font-size: 15px;
  margin-top: 6px;
}

.close-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.close-img {
  width: 25px;
  height: 25px;
}

/* ===== Summary ===== */
.summary {
  display: flex;
  gap: 16px;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  border-top: 1px solid #e2e8f0;
  justify-content: center;
}

.summary-card {
  flex: 0 0 200px;
  padding: 18px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  color: black;
}

.summary-card strong {
  font-size: 28px;
  display: block;
}

.summary-card .label {
  font-size: 13px;
  opacity: 0.9;
}

.summary-card .unit {
  font-size: 12px;
  opacity: 0.8;
}

.dark  { 
  background: white; 
}
.blue  { 
  background: white; 
}
.sky   { 
  background: white; 
}
.light { background: linear-gradient(180deg, #60a5fa, #3b82f6); }
.score { background: linear-gradient(180deg, #93c5fd, #60a5fa); }

/* ===== Progress ===== */
.total-progress {
  padding: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.progress-header strong {
  color: #1c398e;
}

.progress-bar {
  height: 16px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 43%;
  background: linear-gradient(180deg, #1c398e, #162456);
}

/* ===== Employee Table ===== */
.employee-table {
  padding: 24px;
  max-height: 300px;
  overflow-y: auto;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns:
    60px
    160px
    160px
    120px
    200px
    160px;
  align-items: center;
}

.table-header {
  height: 46px;
  border-bottom: 1px solid #e2e8f0;
  color: #62748e;
  font-size: 14px;
  font-weight: 600;
}

.table-row {
  height: 72px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.name {
  font-weight: 600;
  color: #0f172b;
}

.muted {
  color: #62748e;
}

/* ===== Status Badge ===== */
.status {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
}

.status.done {
  background: #e0e7ff;
  color: #432dd7;
}

.status.progress {
  background: #dbeafe;
  color: #1447e6;
}

.status.none {
  background: #f1f5f9;
  color: #314158;
}

/* ===== Footer ===== */
.modal-footer {
  padding: 24px;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
}

.btn-close {
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  background: #e2e8f0;
  font-weight: 600;
  cursor: pointer;
}

.action {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.btn-action:hover {
  opacity: 0.9;
}

.btn-action.primary {
  background: linear-gradient(180deg, #1c398e, #162456);
  color: white;
}

.btn-action.warning {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.btn-action.gray {
  background: #f1f5f9;
  color: #475569;
}

.table-header > div,
.table-row > div {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

</style>