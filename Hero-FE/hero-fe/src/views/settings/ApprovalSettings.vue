<!--
  * <pre>
  * Vue Name        : ApprovalSettings.vue
  * Description     : 결재 관리 탭
  *
  * 컴포넌트 연계
  *  - 부모 컴포넌트: Settings.vue
  *
  * History
  *   2025/12/18 (민철) 결재 관리 탭 UI 구현
  *   2025/12/22 (민철) 설정 API 연동
  * </pre>
  *
  * @module settings
  * @author 민철
  * @version 2.0
-->
<template>
  <div class="approval-page-container">
    <aside class="side-panel">
      <header class="side-header">
        <div class="search-box">
          <input targetType="text" placeholder="서식 검색..." />
          <button class="btn-search">검색</button>
        </div>
      </header>

      <div class="side-body scroll-area">
        <ul class="template-list">
          <li v-for="doc in templateList" :key="doc.templateId" @click="selectDoc(doc)"
            :class="['template-item', selectedDoc?.templateId === doc.templateId ? 'active' : '']">
            <span class="col-category">{{ doc.category }}</span>
            <span class="col-name">{{ doc.templateName }}</span>
            <div class="col-step">
              <span class="step-badge">{{ doc.steps != 0 ? doc.steps : 1 }}단계</span>
            </div>
          </li>
        </ul>

        <div v-if="templateList.length === 0" style="padding: 20px; text-align: center; color: #999; font-size: 13px;">
          등록된 서식이 없습니다.
        </div>
      </div>
    </aside>

    <main class="content-panel">
      <template v-if="selectedDoc">
        <header class="content-header">
          <h2 class="header-title">{{ selectedDoc.templateName }} 서식 설정</h2>
          <div class="header-btns">
            <button class="btn-cancel" @click="resetSelection">취소</button>
            <button class="btn-save" @click="handleSave">저장</button>
          </div>
        </header>

        <div class="content-body scroll-area">
          <div class="content-padding">
            <section class="settings-card">
              <div class="card-title">결재선 지정</div>
              <div class="approval-setup-container">
                <div v-for="(step, index) in lines" :key="index" class="step-wrapper">
                  <div class="step-node" :class="{ 'is-fixed': index === 0 }">
                    <span class="step-number">{{ index + 1 }}단계</span>

                    <div v-if="index === 0" class="node-content">
                      <span class="node-label">기안자 (본인)</span>
                      <span class="node-subtext">DRAFTER</span>
                    </div>

                    <div v-else class="node-content">
                      <select v-model="step.targetType" class="node-select" @change="onTypeChange(step)">
                        <option value="DRAFTER_DEPT">직속부서장</option>
                        <option value="SPECIFIC_DEPT">담당부서</option>
                      </select>

                      <select v-if="step.targetType === 'SPECIFIC_DEPT'" v-model="step.departmentId"
                        class="dept-select">
                        <option :value="null" disabled>부서 선택</option>
                        <option v-for="dept in departmentList" :key="dept.departmentId" :value="dept.departmentId">
                          {{ dept.departmentName }}
                        </option>
                      </select>
                      <button class="btn-remove-step" @click="removeStep(index)">×</button>
                    </div>
                  </div>
                  <div v-if="index < lines.length - 1" class="step-line"></div>
                </div>

                <button v-if="lines.length < 3" class="btn-add-step" @click="addStep">
                  <span class="plus-icon">+</span>
                  <span>단계 추가</span>
                </button>
              </div>
              <p class="guide-text">* 결재선은 최대 3단계이며, 1단계는 기안자 본인으로 자동 설정됩니다.</p>
            </section>

            <section class="settings-card">
              <div class="card-title">참조 지정
                <button class="btn-add-tag" @click="addReference">
                  + 참조 부서 추가
                </button>
              </div>

              <div class="reference-setup-container">
                <div v-for="(refItem, index) in references" :key="index" class="ref-row">
                  <select v-model="refItem.targetType" class="node-select" @change="onTypeChange(refItem)">
                    <option value="DRAFTER_DEPT">직속부서</option>
                    <option value="SPECIFIC_DEPT">특정부서</option>
                  </select>

                  <select v-if="refItem.targetType === 'SPECIFIC_DEPT'" v-model="refItem.departmentId"
                    class="dept-select" placeholder="부서선택">
                    <option v-for="dept in departmentList" :key="dept.departmentId" :value="dept.departmentId">
                      {{ dept.departmentName }}
                    </option>
                  </select>
                  <button class="btn-del-ref" @click="removeReference(index)">삭제</button>
                </div>

                <div v-if="references.length === 0" class="ref-empty">
                  등록된 참조 부서가 없습니다.
                </div>


              </div>
            </section>
          </div>
        </div>
      </template>

      <div v-else class="empty-placeholder">
        <div class="empty-content">
          <span class="empty-icon">📂</span>
          <p>설정할 서식을 왼쪽 목록에서 선택해주세요.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useTemplateStore } from '@/stores/settings/settings-approval.store';
import {
  SettingsApprovalRequestDTO,
  SettingsDefaultLineDTO,
  SettingsDefaultRefDTO,
} from '@/types/settings/settings-approval.types';

const templateStore = useTemplateStore();

const { templateList, departmentList } = storeToRefs(templateStore);

onMounted(async () => {
  await Promise.all([
    templateStore.fetchTemplateList(),
    templateStore.fetchDepartmentList(),
  ]);
});

const drafterLine = ref<SettingsDefaultLineDTO>({
  seq: 1,
  targetType: 'DRAFTER',
  departmentId: 0,
  approverId: 0
});

const selectedDoc = ref<any>(null);

const lines = ref<SettingsDefaultLineDTO[]>([
  {
    seq: 1,
    targetType: 'DRAFTER_DEPT',
    departmentId: 0,
    approverId: 0
  },
]);

const references = ref<SettingsDefaultRefDTO[]>([]);

const selectDoc = async (doc: any) => {
  selectedDoc.value = doc;
  lines.value = [
    {
      seq: 1,
      targetType: 'DRAFTER_DEPT',
      departmentId: 0,
      approverId: 0
    },

  ];
  references.value = [];

  try {
    const data = await templateStore.fetchDefaultSettings(doc.templateId);

    if (data) {
      if (data.lines && data.lines.length > 0) {
        lines.value = data.lines.sort((a, b) => a.seq - b.seq);
      }

      if (data.references && data.references.length > 0) {
        references.value = data.references;
      }
    }
  } catch (error) {
    console.error('설정 조회 중 오류 발생:', error);
  }
};

const resetSelection = () => {
  selectedDoc.value = 0;

  lines.value = [{
    seq: 1,
    targetType: 'DRAFTER_DEPT',
    departmentId: 0,
    approverId: 0
  }];

  references.value = [];
};

const addStep = () => {
  if (lines.value.length < 3) {

    const nextSeq = lines.value[lines.value.length - 1].seq;
    lines.value.push({
      seq: nextSeq + 1,
      targetType: 'DRAFTER_DEPT',
      departmentId: 0,
      approverId: 0
    });

  }
};

const removeStep = (index: number) => {
  console.log('🗑️ removeStep 호출:', index);
  console.log('  - 삭제 전:', JSON.parse(JSON.stringify(lines.value)));

  lines.value.splice(index, 1);

  lines.value.forEach((line, i) => {
    line.seq = i + 1;
  });

  console.log('  - 삭제 후:', JSON.parse(JSON.stringify(lines.value)));
};

const addReference = () => {
  references.value.push({
    targetType: 'DRAFTER_DEPT',
    departmentId: 0,
    // referenceId: 0,
  });
};

const removeReference = (index: number) => {
  references.value.splice(index, 1);
};

const onTypeChange = (item: any) => {
  item.departmentId = item.targetType === 'DRAFTER_DEPT' ? null : 0;
};

const handleSave = () => {
  // ✅ seq 검증
  const hasInvalidSeq = lines.value.some(line => line.seq < 1);
  if (hasInvalidSeq) {
    alert('❌ 잘못된 seq 값이 있습니다. 다시 설정해주세요.');
    return;
  }

  const data = ref<SettingsApprovalRequestDTO>({
    lines: lines.value,
    references: references.value
  });

  const message = templateStore.setDefaultSettings(
    selectedDoc.value.templateId,
    data.value
  );

  alert(`${selectedDoc.value.templateName} ${message}`);
};
</script>

<style scoped>
@import "@/assets/styles/settings/settings-approval.css";
</style>