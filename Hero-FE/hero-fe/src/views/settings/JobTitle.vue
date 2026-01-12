<template>
  <div class="page-content">
    <div class="page-header">
      <button @click="saveJobTitles" class="btn-save">
        저장
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>직책명</th>
            <th class="w-100">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(job, index) in localJobTitles" :key="index">
            <td>
              <input
                v-model="job.jobTitle"
                type="text"
                class="input-text"
                placeholder="직책명 입력"
              />
            </td>
            <td class="text-center">
              <button @click="removeJobTitle(index)" class="btn-delete">
                삭제
              </button>
            </td>
          </tr>
          <tr v-if="localJobTitles.length === 0">
            <td colspan="2" class="no-data">
              등록된 직책이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <button @click="addJobTitle" class="btn-add">
        + 직책 추가
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { updateJobTitles } from '@/api/settings';
import type { JobTitle } from '@/types/settings';

const settingsStore = useSettingsStore();
const localJobTitles = ref<JobTitle[]>([]);

watch(() => settingsStore.jobTitles, (newVal: any) => {
  console.log('JobTitle watch newVal:', newVal);
  const data = (newVal && !Array.isArray(newVal) && newVal.data) ? newVal.data : newVal;
  localJobTitles.value = data ? JSON.parse(JSON.stringify(data)) : [];
}, { immediate: true, deep: true });

onMounted(async () => {
  await settingsStore.fetchJobTitles();
  console.log('JobTitle onMounted store data:', settingsStore.jobTitles);
});

const addJobTitle = () => {
const minId = localJobTitles.value.reduce((min, item) => Math.min(min, item.jobTitleId), 0);
  localJobTitles.value.push({ jobTitleId: minId - 1, jobTitle: '' });

};

const removeJobTitle = (index: number) => {
  localJobTitles.value.splice(index, 1);
};

const saveJobTitles = async () => {
  try {
    const payload = localJobTitles.value
    .filter(item => item.jobTitleId !== 0)
    .map(item => ({
      jobTitleId: item.jobTitleId < 0 ? null : item.jobTitleId,
      jobTitleName: item.jobTitle
    }));
    const res = await updateJobTitles(payload);
    if (res.success) {
      alert('직책 정보가 저장되었습니다.');
      settingsStore.fetchJobTitles();
    }
  } catch (e) {
    alert('저장 실패');
  }
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 20px;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172b;
}

.btn-save {
  padding: 0 15px;
  height: 40px;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}

.btn-save:hover {
  background-color: #162456;
}

.page-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
  overflow-y: auto;
  height: calc(100vh - 300px);
  border: 1px solid #e2e8f0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  background: white;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  table-layout: fixed;
}

.data-table th, .data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.input-text {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  border: 2px solid #cad5e2;
  background: #ffffff;
  box-sizing: border-box;
  margin: 0;
  vertical-align: middle;
}

.text-center {
  text-align: center;
}

.btn-delete {
  color: #ef4444;
  font-weight: 500;
  font-size: 0.875rem;
}

.no-data {
  padding: 40px 0;
  text-align: center;
  color: #94a3b8;
}

.btn-add {
  width: 100%;
  width: calc(100% - 48px);
  margin: 0 24px 24px;
  padding: 12px;
  border: 2px dashed #e2e8f0;
  color: #64748b;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-add:hover {
  background-color: #f8fafc;
}

.w-100 {
  width: 100px;
  text-align: center;
}
</style>
