/**
 * <pre>
 * TypeScript Name: notificationSettings.store
 * Description: 사용자 알림 설정 상태 및 관리를 위한 Pinia 스토어
 * - JWT 토큰 기반으로 백엔드와 통신 (employeeId 파라미터 제거)
 * - 브라우저 알림 권한 변경 시 자동으로 DB 동기화 기능 포함
 *
 * History
 * 2025/12/16 - (혜원) 최초 작성
 * 2025/12/17 - (혜원) API 연동, 브라우저 권한 자동 동기화 추가
 * 2025/12/21 - (혜원) 백엔드 컨트롤러 변경에 따른 로직 개선
 * </pre>
 * * @author 혜원
 * @version 2.0
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { NotificationSettingsDTO } from '@/types/notification/notification.types';
import { notificationApi } from '@/api/notification/notification.api';
import { useAuthStore } from '@/stores/auth';

export const useNotificationSettingsStore = defineStore('notificationSettings', () => {
  
  const authStore = useAuthStore();
  
  const settings = ref<NotificationSettingsDTO>({
    employeeId: 0,
    attendanceEnabled: true,
    payrollEnabled: true,
    approvalEnabled: true,
    leaveEnabled: true,
    evaluationEnabled: true,
    systemEnabled: true,
    browserNotification: true,
    emailNotification: true,
    smsNotification: true,
  });

  const isSaving = ref(false);
  const isLoading = ref(false);

  const allNotificationsEnabled = computed({
    get: () => {
      return (
        settings.value.attendanceEnabled &&
        settings.value.payrollEnabled &&
        settings.value.approvalEnabled &&
        settings.value.leaveEnabled &&
        settings.value.evaluationEnabled &&
        settings.value.systemEnabled
      );
    },
    set: (value: boolean) => {
      settings.value.attendanceEnabled = value;
      settings.value.payrollEnabled = value;
      settings.value.approvalEnabled = value;
      settings.value.leaveEnabled = value;
      settings.value.evaluationEnabled = value;
      settings.value.systemEnabled = value;
    }
  });

  const loadSettings = async (): Promise<void> => {
    try {
      isLoading.value = true;
      const response = await notificationApi.findSettings();
      settings.value = response;
      
      checkBrowserPermissionMatch();
    } catch (error) {
      console.error('[SettingsStore] 설정 불러오기 실패:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const syncBrowserPermissionToDB = async (permissionGranted: boolean): Promise<void> => {
    try {
      const updatedSettings: NotificationSettingsDTO = {
        ...settings.value,
        browserNotification: permissionGranted,
      };

      await notificationApi.modifySettings(updatedSettings);
      settings.value.browserNotification = permissionGranted;
    } catch (error) {
      console.error('[SettingsStore] 브라우저 권한 동기화 실패:', error);
    }
  };

  const saveSettings = async () => {
    try {
      isSaving.value = true;
      const response = await notificationApi.modifySettings(settings.value);
      settings.value = response;
      return { success: true };
    } catch (error) {
      console.error('[SettingsStore] 설정 저장 실패:', error);
      return { success: false, error };
    } finally {
      isSaving.value = false;
    }
  };

  const checkBrowserPermissionMatch = () => {
    if ('Notification' in window) {
      const actualPermission = Notification.permission === 'granted';
      if (settings.value.browserNotification && !actualPermission) {
        console.warn('[SettingsStore] 브라우저 알림 권한이 거부되어 있습니다.');
      }
    }
  };

  const resetSettings = () => {
    const currentEmpId = authStore.employeeId || 0;
    settings.value = {
      employeeId: currentEmpId,
      attendanceEnabled: true,
      payrollEnabled: true,
      approvalEnabled: true,
      leaveEnabled: true,
      evaluationEnabled: true,
      systemEnabled: true,
      browserNotification: true,
      emailNotification: true,
      smsNotification: true,
    };
  };

  return {
    settings,
    isSaving,
    isLoading,
    allNotificationsEnabled,
    loadSettings,
    saveSettings,
    resetSettings,
    syncBrowserPermissionToDB
  };
});