import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getDepartments,
  getGrades,
  getJobTitles,
  getRoles,
  saveOrUpdateDepartments,
  getPermissions,
  updatePermissions,
} from '@/api/settings';

import type {
  SettingsDepartmentResponseDTO,
  Grade,
  JobTitle,
  Role,
  SettingsDepartmentRequestDTO,
  SettingsPermissionsRequestDTO,
} from '@/types/settings';

// ✅ 합본 버전: 타입도 API 파일에서 같이 import
import {
  settingsAttendanceApi,
  type WorkSystemTemplateResponse,
  type WorkSystemTemplateUpsertRequest,
} from '@/api/settings/settings-attendance.api';

export const useSettingsStore = defineStore('settings', () => {
  // ======================
  // State
  // ======================
  const departments = ref<SettingsDepartmentResponseDTO[]>([]);
  const grades = ref<Grade[]>([]);
  const jobTitles = ref<JobTitle[]>([]);
  const roles = ref<Role[]>([]);
  const isLoading = ref(false);

  // ✅ 근태 설정(근무제 템플릿)
  const workSystemTemplates = ref<WorkSystemTemplateResponse[]>([]);

  // ======================
  // Actions
  // ======================
  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      if (res.success) {
        departments.value = res.data;
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchGrades = async () => {
    const res = await getGrades();
    if (res.success) grades.value = res.data;
  };

  const fetchJobTitles = async () => {
    const res = await getJobTitles();
    if (res.success) jobTitles.value = res.data;
  };

  const fetchRoles = async () => {
    const res = await getRoles();
    if (res.success) roles.value = res.data;
  };

  // API Wrapper Actions
  const saveDepartments = async (data: SettingsDepartmentRequestDTO[]) => {
    return await saveOrUpdateDepartments(data);
  };

  const fetchPermissions = async (page: number, size: number, query?: string) => {
    return await getPermissions(page, size, query);
  };

  const modifyPermissions = async (dto: SettingsPermissionsRequestDTO) => {
    return await updatePermissions(dto);
  };

  const loadAllSettings = async () => {
    isLoading.value = true;
    await Promise.all([fetchDepartments(), fetchGrades(), fetchJobTitles(), fetchRoles()]);
    isLoading.value = false;
  };

  // ======================
  // ✅ Attendance Policy Actions
  // ======================

  /**
   * 근무제 템플릿 조회
   */
  const fetchWorkSystemTemplates = async () => {
    try {
      const list = await settingsAttendanceApi.listWorkSystemTemplates();
      workSystemTemplates.value = list ?? [];
    } catch (error) {
      console.error('Failed to fetch work system templates:', error);
      workSystemTemplates.value = [];
    }
  };

  /**
   * 근무제 템플릿 저장(업서트)
   */
  const saveWorkSystemTemplates = async (payload: WorkSystemTemplateUpsertRequest[]) => {
    return await settingsAttendanceApi.upsertWorkSystemTemplates(payload);
  };

  return {
    // state
    departments,
    grades,
    jobTitles,
    roles,
    isLoading,

    // ✅ attendance state
    workSystemTemplates,

    // actions
    fetchDepartments,
    fetchGrades,
    fetchJobTitles,
    fetchRoles,
    saveDepartments,
    fetchPermissions,
    modifyPermissions,
    loadAllSettings,

    // ✅ attendance actions
    fetchWorkSystemTemplates,
    saveWorkSystemTemplates,
  };
});
