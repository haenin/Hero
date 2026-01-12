<!--
 * <pre>
 * Vue Name : ManualAdjustmentTab.vue
 * Description     : 급여 조정(관리자) - 수기 조정 탭 페이지
 *
 * History
 *   2025/12/31 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-adjust-manual-tab
 * @author 동근
 * @version 1.0
-->
<!-- <template>
  <div class="approval-tab">
    <div class="form-card">
          <div class="form-grid">
        <div class="form-row">
          <div class="label">사원 검색</div>
          <div class="search-wrap">
            <input
              v-model="form.employeeQuery"
              class="input"
              placeholder="사번 또는 사원명 검색"
              @focus="openSuggest()"
              @input="openSuggest()"
              @keydown.down.prevent="moveActive(1)"
              @keydown.up.prevent="moveActive(-1)"
              @keydown.enter.prevent="pickActive()"
              @blur="closeSuggestWithDelay()"
            />
            <div v-if="showSuggest && suggestions.length" class="suggest">
              <button
                v-for="(e, idx) in suggestions"
                :key="e.employeeNumber"
                class="suggest-item"
                :class="{ active: idx === activeIndex }"
                type="button"
                @mousedown.prevent="selectEmployee(e)"
              >
                <span class="mono">{{ e.employeeNumber }}</span>
                <span class="dot">·</span>
                <span class="suggest-name">{{ e.employeeName }}</span>
                <span class="suggest-sub">{{ e.jobTitle }} · {{ e.departmentName }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="label">직급</div>
          <input class="input input-readonly" :value="selectedEmployee?.jobTitle || '-'" disabled />
        </div>

        <div class="form-row">
          <div class="label">부서</div>
          <input class="input input-readonly" :value="selectedEmployee?.departmentName || '-'" disabled />
        </div>

        <div class="form-row">
        <div class="label">금액</div>
        <div class="amount-row">
        <select v-model="form.sign" class="select select-sign">
          <option value="+">+</option>
          <option value="-">-</option>
        </select>
      <input
        v-model.number="form.amount"
        type="number"
        class="input"
        placeholder="예) 650000"
        min="0"
      />
    </div>
  </div>

        <div class="form-row form-row-wide">
          <div class="label">사유</div>
          <textarea v-model="form.reason" class="textarea" rows="2" placeholder="사유를 입력하세요." />
        </div>
      </div>

      <div class="form-actions">
        <div v-if="formError" class="form-error">{{ formError }}</div>
        <button class="btn-primary" type="button" @click="submitManual">
          등록
        </button>
      </div>
    </div>

    <div class="toolbar">
      <div class="toolbar-right">
        <select v-model="statusFilter" class="select">
          <option value="">전체 상태</option>
          <option value="PENDING">대기</option>
          <option value="DONE">완료</option>
          <option value="CANCELED">취소</option>
        </select>
      </div>
    </div>

    <div class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th class="col-empno">사번</th>
            <th class="col-emp">사원명(직급)</th>
            <th class="col-dept">부서</th>
            <th>사유</th>
            <th class="col-amount" >금액</th>
            <th class="col-date">적용월</th>
            <th class="col-created">작성일</th>
            <th class="col-status">상태</th>
            <th class="col-action">작업</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in pagedRows" :key="row.manualId">
            <td class="mono">{{ row.employeeNumber }}</td>

            <td class="emp">
              <span class="emp-name">{{ row.employeeName }}</span>
              <span class="emp-sub">({{ row.jobTitle }})</span>
            </td>

            <td class="dept">{{ row.departmentName }}</td>

            <td class="reason">{{ row.reason }}</td>

            <td class="amount" :class="row.sign === '+' ? 'plus' : 'minus'">
              {{ formatSignedAmount(row.sign, row.amount) }}
            </td>

            <td>
              <div class="date-only">{{ row.applyMonth }}</div>
            </td>

            <td>
              <div class="date-only">{{ row.createdAt.slice(0, 10) }}</div>
            </td>

            <td class="td-center">
              <span class="badge" :class="badgeClass(row.status)">
                {{ statusLabel(row.status) }}
              </span>
            </td>

            <td class="td-center">
              <button
                class="link link-danger"
                :disabled="row.status !== 'PENDING'"
                :title="row.status !== 'PENDING' ? '대기 상태만 삭제할 수 있어요.' : '삭제'"
                @click="removeRow(row)"
              >
                삭제
              </button>
            </td>
          </tr>

          <tr v-if="filtered.length === 0">
            <td colspan="8" class="empty">
              조건에 해당하는 수기 조정 이력이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pager">
      <button class="pbtn" type="button" :disabled="page <= 1" @click="goPage(page - 1)">
        이전
      </button>

      <button
        v-for="p in pageNumbers"
        :key="p"
        class="pnum"
        type="button"
        :class="{ active: p === page }"
        @click="goPage(p)"
      >
        {{ p }}
      </button>

      <button class="pbtn" type="button" :disabled="page >= totalPages" @click="goPage(page + 1)">
        다음
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

type ManualStatus = 'PENDING' | 'DONE' | 'CANCELED';

interface EmployeeDirectoryRow {
  employeeNumber: string;
  employeeName: string;
  jobTitle: string;
  departmentName: string;
}

interface ManualRow {
  manualId: number;
  employeeNumber: string;
  employeeName: string;
  jobTitle: string;
  departmentName: string;

  reason: string;
  sign: '+' | '-';
  amount: number;

  applyMonth: string;
  status: ManualStatus;

  createdAt: string;
}

const statusFilter = ref<string>('');
const formError = ref<string>('');

const employees = ref<EmployeeDirectoryRow[]>([
  { employeeNumber: 'D2-MGR',  employeeName: '김인사', jobTitle: '팀장', departmentName: '인사팀' },
  { employeeNumber: 'D2-EMP1', employeeName: '박지윤', jobTitle: '팀원', departmentName: '인사팀' },
  { employeeNumber: 'D2-EMP2', employeeName: '이준호', jobTitle: '팀원', departmentName: '인사팀' },
  { employeeNumber: 'D2-EMP3', employeeName: '최은비', jobTitle: '팀원', departmentName: '인사팀' },
  { employeeNumber: 'D2-EMP4', employeeName: '장민석', jobTitle: '팀원', departmentName: '인사팀' },
  { employeeNumber: 'D2-EMP5', employeeName: '유승민', jobTitle: '팀원', departmentName: '인사팀' },
  { employeeNumber: 'D3-MGR',  employeeName: '박총무', jobTitle: '팀장', departmentName: '총무팀' },
  { employeeNumber: 'D3-EMP1', employeeName: '홍지훈', jobTitle: '팀원', departmentName: '총무팀' },
  { employeeNumber: 'D3-EMP2', employeeName: '서민지', jobTitle: '팀원', departmentName: '총무팀' },
  { employeeNumber: 'D3-EMP3', employeeName: '정우빈', jobTitle: '팀원', departmentName: '총무팀' },
  { employeeNumber: 'D3-EMP4', employeeName: '한수아', jobTitle: '팀원', departmentName: '총무팀' },
  { employeeNumber: 'D3-EMP5', employeeName: '오상혁', jobTitle: '팀원', departmentName: '총무팀' },
  { employeeNumber: 'D4-MGR',  employeeName: '이재무', jobTitle: '팀장', departmentName: '재무팀' },
  { employeeNumber: 'D4-EMP1', employeeName: '김세무', jobTitle: '팀원', departmentName: '재무팀' },
  { employeeNumber: 'D4-EMP2', employeeName: '박회계', jobTitle: '팀원', departmentName: '재무팀' },
]);

const form = ref({
  employeeQuery: '',
  employeeNumber: '',
  employeeName: '',
  sign: '+' as '+' | '-',
  amount: 0,
  reason: '',
});

const selectedEmployee = computed(() => {
  const no = form.value.employeeNumber.trim();
  if (no) return employees.value.find((e) => e.employeeNumber === no) || null;
  return null;
});

const showSuggest = ref(false);
const activeIndex = ref(0);
let closeTimer: any = null;

const suggestions = computed(() => {
    const q = form.value.employeeQuery.trim();
  if (!q) return employees.value.slice(0, 6);
  const qq = q.toLowerCase();
  return employees.value
    .filter((e) => {
      return (
        e.employeeNumber.toLowerCase().includes(qq) ||
        e.employeeName.toLowerCase().includes(qq)
      );
    })
    .slice(0, 8);
});

const openSuggest = () => {
  showSuggest.value = true;
  activeIndex.value = 0;
  if (closeTimer) clearTimeout(closeTimer);
};

const closeSuggestWithDelay = () => {
  closeTimer = setTimeout(() => {
    showSuggest.value = false;
  }, 120);
};

const moveActive = (delta: number) => {
  if (!showSuggest.value || suggestions.value.length === 0) return;
  const next = activeIndex.value + delta;
  if (next < 0) activeIndex.value = suggestions.value.length - 1;
  else if (next >= suggestions.value.length) activeIndex.value = 0;
  else activeIndex.value = next;
};

const pickActive = () => {
  if (!showSuggest.value || suggestions.value.length === 0) return;
  selectEmployee(suggestions.value[activeIndex.value]);
};

const selectEmployee = (e: EmployeeDirectoryRow) => {
  form.value.employeeNumber = e.employeeNumber;
  form.value.employeeName = e.employeeName;
  form.value.employeeQuery = `${e.employeeNumber} · ${e.employeeName}`;
  showSuggest.value = false;
};

watch(
  () => form.value.employeeQuery,
  (v) => {
    if (v.trim() === '') {
      form.value.employeeNumber = '';
      form.value.employeeName = '';
    }
  }
);

const rows = ref<ManualRow[]>([
    {
    manualId: 201,
    employeeNumber: 'D2-EMP1',
    employeeName: '박지윤',
    jobTitle: '팀원',
    departmentName: '인사팀',
    reason: '연장근무 수기 반영',
    sign: '+',
    amount: 80000,
    applyMonth: '2025-12',
    status: 'DONE',
    createdAt: '2025-12-12 10:20:00',
  },
  {
    manualId: 202,
    employeeNumber: 'D3-EMP2',
    employeeName: '서민지',
    jobTitle: '팀원',
    departmentName: '총무팀',
    reason: '식대 공제 정정',
    sign: '-',
    amount: 30000,
    applyMonth: '2025-12',
    status: 'PENDING',
    createdAt: '2025-12-13 14:05:00',
  },
  {
    manualId: 203,
    employeeNumber: 'D4-MGR',
    employeeName: '이재무',
    jobTitle: '팀장',
    departmentName: '재무팀',
    reason: '성과급 일부 수기 반영',
    sign: '+',
    amount: 150000,
    applyMonth: '2025-12',
    status: 'DONE',
    createdAt: '2025-12-14 09:00:00',
  },
]);

const filtered = computed(() => {
  if (!statusFilter.value) return rows.value;
  return rows.value.filter((r) => r.status === statusFilter.value);
});

const page = ref(1);
const size = ref(10);

const totalPages = computed(() => {
  const total = filtered.value.length;
  return Math.max(1, Math.ceil(total / size.value));
});

const pagedRows = computed(() => {
  const start = (page.value - 1) * size.value;
  return filtered.value.slice(start, start + size.value);
});

const pageNumbers = computed(() => {
  const tp = totalPages.value;
  const pages: number[] = [];
  for (let i = 1; i <= tp; i++) pages.push(i);
  return pages;
});

const goPage = (p: number) => {
  if (p < 1) p = 1;
  if (p > totalPages.value) p = totalPages.value;
  page.value = p;
};

watch(statusFilter, () => {
  page.value = 1;
});

const statusLabel = (s: ManualStatus) => {
  switch (s) {
    case 'PENDING': return '대기';
    case 'DONE': return '완료';
    case 'CANCELED': return '취소';
  }
};

const badgeClass = (s: ManualStatus) => {
  switch (s) {
    case 'PENDING': return 'badge-yellow';
    case 'DONE': return 'badge-green';
    case 'CANCELED': return 'badge-gray';
  }
};

const formatSignedAmount = (sign: '+' | '-', amount: number) => {
  const formatted = Math.abs(amount).toLocaleString('ko-KR');
  return `${sign}${formatted}`;
};

const nowString = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
};


const validateForm = () => {
  if (!selectedEmployee.value) return '사원 검색 후 선택해주세요.';
  if (!form.value.reason.trim()) return '사유를 입력해주세요.';
  if (!form.value.amount || form.value.amount <= 0) return '금액은 1원 이상 입력해주세요.';
  return null;
};

const submitManual = () => {
  const msg = validateForm();
  if (msg) {
    formError.value = msg;
    return;
  }
  formError.value = '';

  const e = selectedEmployee.value!;
  const newId = Math.max(0, ...rows.value.map((r) => r.manualId)) + 1;

  rows.value.unshift({
    manualId: newId,
    employeeNumber: e.employeeNumber,
    employeeName: e.employeeName,
    jobTitle: e.jobTitle,
    departmentName: e.departmentName,
    reason: form.value.reason.trim(),
    sign: form.value.sign,
    amount: form.value.amount,
    applyMonth: nextApplyMonth(nowString()),
    status: 'PENDING',
    createdAt: nowString(),
  });

  form.value.reason = '';
  form.value.amount = 0;
  page.value = 1;
};

const removeRow = (row: ManualRow) => {
  if (row.status !== 'PENDING') return;
  const idx = rows.value.findIndex((r) => r.manualId === row.manualId);
  if (idx >= 0) rows.value.splice(idx, 1);
};

const nextApplyMonth = (createdAt: string) => {
  const d = new Date(createdAt.replace(' ', 'T'));
  d.setMonth(d.getMonth() + 1);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};
</script>

<style scoped>
.approval-tab { padding: 0; margin: 0; }

.form-card {
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 20px;
  margin: 0;
  background: #fff;
}

.form-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.form-title {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}

.form-sub {
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row-wide { grid-column: 1 / -1; }

.label {
  font-size: 12px;
  font-weight: 800;
  color: #334155;
}

.input {
  height: 34px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 13px;
  color: #0f172a;
  width: 100%;
 min-width: 0;
}

.input-readonly {
  background: #f8fafc;
  color: #475569;
}

.textarea {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 13px;
  color: #0f172a;
  resize: vertical;
}

.search-wrap { position: relative; width: 100%;}
.suggest {
  position: absolute;
  top: 38px;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  z-index: 20;
}

.suggest-item {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  background: #fff;
  border: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #0f172a;
}

.suggest-item:hover,
.suggest-item.active {
  background: #f8fafc;
}

.suggest-name { font-weight: 900; }
.suggest-sub { margin-left: auto; color: #64748b; font-weight: 700; font-size: 11px; }

.form-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.form-error {
  margin-right: auto;
  color: #dc2626;
  font-size: 12px;
  font-weight: 800;
}

.btn-primary {
  height: 34px;
  padding: 0 14px;
  border-radius: 10px;
  border: 0;
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
  padding-right: 20px;
}

.toolbar-right { display: inline-flex; align-items: center; gap: 8px; }

.select {
  height: 34px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 13px;
  color: #0f172a;
}

.table-card {
  border: 1px solid #eef2f7;
  overflow: hidden;
  margin: 0;
}

.table { width: 100%; border-collapse: collapse; }

.table thead th {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  text-align: left;
  padding: 12px 20px;
}

.table tbody td {
  font-size: 13px;
  color: #0f172a;
  padding: 20px;
  border-top: 1px solid #eef2f7;
  vertical-align: middle;
}

.table tbody tr:hover { background: #f8fafc; }

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  color: #334155;
}

.reason { color: #0f172a; }

.col-empno { width: 90px; }
.col-emp { width: 140px; }
.col-dept { width: 180px; }
.col-amount { width: 140px; }
.col-date { width: 100px; }
.col-created { width: 120px; }
.col-status { width: 100px; text-align: right; }
.col-action { width: 100px; text-align: right; }
.td-center { text-align: left; }

.amount { text-align: right; font-weight: 800; }
.amount.plus { color: #16a34a; }
.amount.minus { color: #dc2626; }

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.badge-green { background: #eaf7ee; color: #15803d; border: 1px solid #bfe6cc; }
.badge-yellow { background: #fff7e6; color: #a16207; border: 1px solid #fde68a; }
.badge-gray { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

.link {
  border: 0;
  background: transparent;
  color: #2563eb;
  font-weight: 800;
  cursor: pointer;
  padding: 0;
}
.link:hover { text-decoration: underline; }
.link-danger { color: #dc2626; }

.dot { margin: 0 6px; color: #cbd5e1; font-weight: 900; }

.empty { padding: 26px 12px; text-align: center; color: #94a3b8; }

.pager {
  padding: 14px 0 10px;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.pbtn, .pnum {
  height: 30px;
  min-width: 32px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #334155;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
}

.pnum.active {
  background: #2855ff;
  color: #fff;
  border-color: #2855ff;
}

.pbtn:disabled, .pnum:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.emp .emp-name { font-weight: 800; color: #0f172a; }
.emp .emp-sub { font-size: 12px; color: #64748b; font-weight: 600; margin-left: 6px;}
.dept { color: #334155; }
.date-only { font-size: 13px; color: #475569; }

@media (max-width: 1100px) {
  .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.amount-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.select-sign {
  width: 60px;
  text-align: center;
  font-weight: 900;
}

.amount-row .input {
  flex: 1;
  min-width: 0;
}

.table thead th.col-amount {
  text-align: center;
}
</style> -->