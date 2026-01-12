<!--
 * <pre>
 * Vue Name        : PayslipModal.vue
 * Description     : 급여 명세서 모달창
 *
 * 기능
 *  - 선택한 급여월의 급여 명세서를 모달로 표시
 *  - html2pdf.js 사용, 현재 명세서 화면을 PDF로 저장
 *
 * History
 *   2025/12/09 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-payslip-modal
 * @author 동근
 * @version 1.0
-->
<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-backdrop"
      :class="{ 'modal-backdrop--silent': props.silent }"
      @click.self="!props.silent && handleClose()"
    >
      <div class="modal" :class="{ 'modal--silent': props.silent }" ref="modalRef">
        <header class="modal-header">
          <h2>급여 명세서</h2>
           <button
   class="modal-close"
   :class="{ 'pdf-only': props.silent }"
   type="button"
   @click="handleClose"
 >
            ✕
          </button>
        </header>
        <!-- 
        명세서 본문
        후에 추가할 내용 : 회사명, 지급일, 사번, 직급 // (근로일수+시간은 고민중) 
        -->
        <section v-if="payslip" class="payslip-body">
          <div class="payslip-header">
            <div>
              <p class="payslip-month">
                {{ payslip.salaryMonth }}월 급여명세서
              </p>
            </div>
            <div class="payslip-meta">
              <p>사원명: {{ payslip.employeeName }}</p>
              <p>부서: {{ payslip.departmentName }}</p>
            </div>
          </div>

          <div class="payslip-section">
            <h3>지급 내역</h3>
            <div class="payslip-table">
              <div class="payslip-row">
                <span>기본급</span>
                <span>{{ formatMoney(payslip.baseSalary) }}</span>
              </div>
              <div
                v-for="item in payslip.allowances"
                :key="item.name"
                class="payslip-row"
              >
                <span>{{ item.name }}</span>
                <span>{{ formatMoney(item.amount) }}</span>
              </div>
              <div class="payslip-row payslip-row--total">
                <span>지급 총액</span>
                <span>{{ formatMoney(payslip.grossPay) }}</span>
              </div>
            </div>
          </div>

          <div class="payslip-section payslip-section--deduction">
            <h3>공제 내역</h3>
            <div class="payslip-table">
              <div
                v-for="item in payslip.deductions"
                :key="item.name"
                class="payslip-row payslip-row--deduction"
              >
                <span>{{ item.name }}</span>
                <span>-{{ formatMoney(item.amount) }}</span>
              </div>
              <div class="payslip-row payslip-row--total">
                <span>공제 총액</span>
                <span>{{ formatMoney(payslip.totalDeduction) }}</span>
              </div>
            </div>
          </div>

          <div class="payslip-section payslip-section--net">
            <span>실수령액</span>
            <span class="payslip-net">
              {{ formatMoney(payslip.netPay) }}
            </span>
          </div>
                    <div class="payslip-thanks pdf-only">
            귀하의 노고에 감사드립니다.
          </div>
        </section>

        <footer class="modal-footer" v-if="!props.silent">
          <button class="btn-secondary" type="button" @click="handleClose">
            닫기
          </button>
          <button class="btn-primary" type="button" @click="downloadPdf">
            PDF 다운로드
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import html2pdf from 'html2pdf.js';

//급여 명세서 지급 항목
interface PayslipItem {
  name: string;
  amount: number;
}

//급여 명세서 전체 데이터
interface Payslip {
  salaryMonth: string;
  employeeName: string;
  departmentName: string;
  baseSalary: number;
  allowances: PayslipItem[];
  deductions: PayslipItem[];
  grossPay: number;
  totalDeduction: number;
  netPay: number;
}

/**
 * open - 모달 열림 여부
 * payslip - 급여 명세서 데이터
 * month - 급여월 (PDF 파일명에 사용)
 * autoDownloadKey - 자동 다운로드 트리거 키 (값이 바뀔 때마다 PDF 자동 다운로드 실행)
 */
const props = defineProps<{
  open: boolean;
  payslip: Payslip | null;
  month: string;
  autoDownloadKey: number;
  silent?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
}>();

const modalRef = ref<HTMLElement | null>(null);

const handleClose = () => {
  emit('update:open', false);
};

const formatMoney = (value: number) => `₩${value.toLocaleString()}`;

/**
 * 급여 명세서 PDF 다운로드 (html2pdf.js 사용)
 * 
 * 동작 방식 순서
 * 1.모달/본문의 스타일을 PDF 캡처에 적합하게 일시 수정
 * 2.닫기 버튼/푸터 영역 숨기고 html2pdf.js로 PDF 생성
 * 3.PDF 저장 후, 스타일을 원래 상태로 복원
 */
const downloadPdf = async () => {
  if (!modalRef.value || !props.payslip) return;

  //DOM 업데이트 완료 후 캡처
  await nextTick();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  const modalEl = modalRef.value;
  const bodyEl = modalEl.querySelector('.payslip-body') as HTMLElement | null;
  const closeBtn = modalEl.querySelector('.modal-close') as HTMLElement | null;
  const footerEl = modalEl.querySelector('.modal-footer') as HTMLElement | null;

  const captureEl = bodyEl ?? modalEl;

  // 기존 스타일 백업
  const prevModalMaxHeight = modalEl.style.maxHeight;
  const prevModalHeight = modalEl.style.height;
  const prevModalOverflow = modalEl.style.overflow;
  const prevModalWidth = modalEl.style.width;
  const prevModalMargin = modalEl.style.margin;
    const prevModalOpacity = modalEl.style.opacity;
  const prevModalZIndex = modalEl.style.zIndex;
  const prevModalLeft = modalEl.style.left;
  const prevModalTop = modalEl.style.top;
  const prevModalPosition = modalEl.style.position;
  const prevBodyMaxHeight = bodyEl?.style.maxHeight ?? '';
  const prevBodyOverflow = bodyEl?.style.overflow ?? '';
  const prevCloseDisplay = closeBtn?.style.display ?? '';
  const prevFooterDisplay = footerEl?.style.display ?? '';
    const prevCaptureMaxHeight = captureEl.style.maxHeight;
  const prevCaptureOverflow = captureEl.style.overflow;
  const prevCaptureHeight = captureEl.style.height;
  const prevCaptureWidth = captureEl.style.width;

  try {
    // PDF용 스타일 세팅
    modalEl.classList.add('pdf-mode');
    captureEl.classList.add('pdf-mode');
    modalEl.style.maxHeight = 'none';
    modalEl.style.height = 'auto';
    modalEl.style.overflow = 'visible';
    modalEl.style.width = '720px';
    modalEl.style.margin = '0 auto';

        if (props.silent) {
      modalEl.style.position = 'fixed';
      modalEl.style.left = '0';
      modalEl.style.top = '0';
      modalEl.style.zIndex = '1';
      modalEl.style.opacity = '0.01';
    }

    if (bodyEl) {
      bodyEl.style.maxHeight = 'none';
      bodyEl.style.overflow = 'visible';
    }
    captureEl.style.maxHeight = 'none';
    captureEl.style.overflow = 'visible';
    captureEl.style.height = 'auto';
    captureEl.style.width = '720px';

    await nextTick();
    await new Promise<void>((r) => requestAnimationFrame(() => r()));

    // PDF에는 닫기/버튼 영역 숨김처리
    if (closeBtn) closeBtn.style.display = 'none';
    if (footerEl) footerEl.style.display = 'none';

    // 화면 중앙으로 스크롤처리 (캡처 대상이 화면에 보여야 해서 처리해둠)
    if (!props.silent) {
      modalEl.scrollIntoView({ block: 'center' });
    }

    const opt = {
      margin: 10,
      filename: `payslip-${props.month}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    await html2pdf().set(opt).from(captureEl).save();
  } finally {
    // 스타일 원복 (위에 try에서 에러 나도 실행되도록 finally에 둠)
    modalEl.classList.remove('pdf-mode');
    captureEl.classList.remove('pdf-mode');
    modalEl.style.maxHeight = prevModalMaxHeight;
    modalEl.style.height = prevModalHeight;
    modalEl.style.overflow = prevModalOverflow;
    modalEl.style.width = prevModalWidth;
    modalEl.style.margin = prevModalMargin;
        modalEl.style.opacity = prevModalOpacity;
    modalEl.style.zIndex = prevModalZIndex;
    modalEl.style.left = prevModalLeft;
    modalEl.style.top = prevModalTop;
    modalEl.style.position = prevModalPosition;

        captureEl.style.maxHeight = prevCaptureMaxHeight;
    captureEl.style.overflow = prevCaptureOverflow;
    captureEl.style.height = prevCaptureHeight;
    captureEl.style.width = prevCaptureWidth;

    if (bodyEl) {
      bodyEl.style.maxHeight = prevBodyMaxHeight;
      bodyEl.style.overflow = prevBodyOverflow;
    }

    if (closeBtn) closeBtn.style.display = prevCloseDisplay;
    if (footerEl) footerEl.style.display = prevFooterDisplay;
  }
};

// 헤더에서 autoDownloadKey를 증가시키면 자동 다운로드 실행
watch(
  () => props.autoDownloadKey,
  async () => {
    await nextTick();
    if (props.open && props.payslip) {
      await downloadPdf();
      if (props.silent) {
        emit('update:open', false);}
    }
  }
);
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 40;
}

.modal {
  background-color: #ffffff;
  border-radius: 16px;
  width: 520px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
}

.payslip-body {
  padding: 16px 20px;
  overflow-y: auto;
}

.payslip-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.payslip-month {
  font-weight: 600;
}

.payslip-section {
  margin-top: 12px;
}

.payslip-table {
  margin-top: 8px;
  border-radius: 8px;
}

.payslip-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 2px;
  font-size: 13px;
}

.payslip-row--deduction span:last-child {
  color: #b91c1c;
}

.payslip-row--total {
  border-top: 1px dashed #e5e7eb;
  margin-top: 4px;
  padding-top: 6px;
  font-weight: 600;
}

.payslip-section--net {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 10px;
  border-top: 1px solid #e5e7eb;
}

.payslip-net {
  color: #1d4ed8;
  font-weight: 700;
}

.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-primary,
.btn-secondary {
  border-radius: 999px;
  font-size: 13px;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #06336f, #123c9c);
  color: white;
}

.btn-secondary {
  background-color: #eef2ff;
  color: #374151;
}
.pdf-only {
  display: none;
}

.pdf-mode .pdf-only {
  display: block;
  margin-top: 24px;
  padding-top: 12px;
  border-top: 1px dashed #e5e7eb;
  text-align: center;
  font-size: 16px;
  color: #374151;
  font-weight: 600;
}
.modal-backdrop--silent {
  background-color: transparent;
  pointer-events: none;
}

.modal--silent {
  position: fixed;
  left: 0;
  top: 0;
  z-index: -1;
  pointer-events: none;
  box-shadow: none;
}

.pdf-mode .payslip-section--deduction {
  margin-top: 40px;   
  padding-top: 16px;
  border-top: 1px dashed #e5e7eb;
}
</style>
