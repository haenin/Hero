<!--
  * <pre>
  * Vue Name        : ApprovalTemplates.vue
  * Description     : 결재 서식 목록
  *
  * 컴포넌트 연계
  * - ApprovalCreate.vue: 서식 선택 시 작성화면으로 라우팅
  *
  * History
  * 2025/12/10 (민철) 최초 작성
  * 2025/12/23 (민철) 파일명 변경
  * 2026/01/06 (민철) 주석 제거
  * </pre>
  *
  * @module approval
  * @author 민철
  * @version 2.1
-->
<template>
  <div class="formtpl-container">
    <div class="formtpl-page">
      <div class="formtpl-panel">

        <div class="formtpl-search-bar">
          <input class="formtpl-search-input" type="text" v-model="searchKeyword" placeholder="검색..." />
          <button class="formtpl-search-button">검색</button>
        </div>

        <div v-if="filteredList.length === 0" class="no-data-msg" style="text-align:center; padding: 20px; color:#666;">
          표시할 서식이 없습니다.
        </div>

        <section v-if="bookmarkedForms.length > 0" class="formtpl-section">
          <div class="formtpl-section-header">
            <h2 class="formtpl-section-title">즐겨찾기</h2>
            <span class="formtpl-section-count">({{ bookmarkedForms.length }})</span>
          </div>

          <div class="formtpl-list">
            <button v-for="form in bookmarkedForms" :key="'bm-' + form.templateId" class="formtpl-card is-favorite"
              @click="handleCardClick(form)">
              <div class="formtpl-meta">
                <div class="formtpl-icon">
                  <img :src="getCategoryIcon(form.category)" :alt="form.category">
                </div>
                <div>
                  <div class="formtpl-name">{{ form.templateName }}</div>
                  <div class="formtpl-category">{{ form.category }}</div>
                </div>
              </div>
              <div class="formtpl-action" @click.stop="toggleBookmark(form.templateId)">
                ★
              </div>
            </button>
          </div>
        </section>

        <section v-for="(forms, category) in groupedForms" :key="category" class="formtpl-section">
          <div class="formtpl-section-header">
            <h2 class="formtpl-section-title">{{ category }}</h2>
            <span class="formtpl-section-count">({{ forms.length }})</span>
          </div>

          <div class="formtpl-list">
            <button v-for="form in forms" :key="form.templateId" class="formtpl-card"
              :class="{ 'is-favorite': form.bookmarking }" @click="handleCardClick(form)">
              <div class="formtpl-meta">
                <div class="formtpl-icon">
                  <img :src="getCategoryIcon(form.category)" :alt="form.category">
                </div>
                <div>
                  <div class="formtpl-name">{{ form.templateName }}</div>
                  <div class="formtpl-category">{{ form.category }}</div>
                </div>
              </div>
              <div class="formtpl-action" @click.stop="toggleBookmark(form.templateId)">
                {{ form.bookmarking ? '★' : '☆' }}
              </div>
            </button>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useApprovalTemplateStore } from '@/stores/approval/approval.store';
import { ApprovalTemplateResponseDTO } from '@/types/approval/template.types';


const router = useRouter();
const templateStore = useApprovalTemplateStore();

const { templates } = storeToRefs(templateStore);

const searchKeyword = ref<string>('');


onMounted(() => {
  templateStore.fetchTemplates();
});


const toggleBookmark = async (templateId: number) => {

  templateStore.toggleBookmark(templateId);

  const target = rawForms.value.find(f => f.templateId === templateId);
  if (target) {
    target.bookmarking = !target.bookmarking;
  }
};

const rawForms = templates;

const filteredList = computed(() => {
  const keyword = searchKeyword.value.trim();
  if (!keyword) return rawForms.value;

  return rawForms.value.filter(item =>
    item.templateKey.includes(keyword) ||
    item.category.includes(keyword) ||
    item.templateName.includes(keyword)
  );
});

const bookmarkedForms = computed(() => {
  return filteredList.value.filter(item => item.bookmarking);
});

const groupedForms = computed(() => {
  const groups: Record<string, ApprovalTemplateResponseDTO[]> = {};
  filteredList.value.forEach(item => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  });
  return groups;
});

const getCategoryIcon = (category: string): string => {
  switch (category) {
    case '인사': return '/images/personnel.svg';
    case '휴가': return '/images/vacation.svg';
    case '근태': return '/images/attendance.svg';
    case '급여': return '/images/payroll.svg';
    default: return '/images/payroll.svg';
  }
};

const handleCardClick = async (form: ApprovalTemplateResponseDTO) => {

  await router.push({
    name: 'ApprovalCreate',
    params: {
      formName: form.templateKey,
    },
    query: {
      templateId: form.templateId
    }
  });
};
</script>

<style scoped>
@import "@/assets/styles/approval/templateList.css";
</style>