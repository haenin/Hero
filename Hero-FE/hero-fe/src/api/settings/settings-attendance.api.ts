/**
 * <pre>
 * TypeScript Name : settings-attendance.api.ts
 * Description     : 근태 설정(Work System Template) 관련 API 호출 + 타입 정의(합본)
 *
 * History
 *  2025/12/29 - (지윤) 근태 설정 탭용 API/타입 합본 생성
 * </pre>
 *
 * @module settings-attendance-api
 */

import type { AxiosResponse } from 'axios';

import apiClient from '@/api/apiClient';

/* =========================
   공통 응답 타입 (프로젝트 맞춤)
   ========================= */
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  result?: T;
}

/**
 * payroll 쪽에서 사용하던 unwrap 패턴
 * - 서버 응답 구조(data / result / data.data 등)가 혼재된 경우를 공통 처리
 */
const unwrap = <T>(res: AxiosResponse<ApiResponse<T> | T>): T => {
  const body = res?.data as ApiResponse<T> | T | undefined;

  // ApiResponse 형태인 경우
  if (body && typeof body === 'object' && 'success' in body) {
    const apiBody = body as ApiResponse<T>;

    if (apiBody.data !== undefined) {
      return apiBody.data;
    }
    if (apiBody.result !== undefined) {
      return apiBody.result;
    }
    if (apiBody.data && (apiBody.data as any).data !== undefined) {
      return (apiBody.data as any).data as T;
    }

    console.error('[unwrap] 예상치 못한 ApiResponse 구조:', apiBody);
    return undefined as unknown as T;
  }

  // 이미 T 형태라고 간주
  return body as T;
};

/* =========================
   타입(합본)
   ========================= */

/** "HH:mm:ss" 형식의 시간 문자열 */
export type Hms = string;

export interface WorkSystemTemplateResponse {
  workSystemTemplateId: number;
  startTime: Hms;
  endTime: Hms;
  breakMinMinutes: number;
  reason: string;
  workSystemTypeId: number;
}

export interface WorkSystemTemplateUpsertRequest {
  /** 신규는 null, 수정은 기존 ID */
  workSystemTemplateId: number | null;
  startTime: Hms;
  endTime: Hms;
  breakMinMinutes: number;
  reason: string;
  workSystemTypeId: number;
}

/* =========================
   API
   =========================
   ※ 엔드포인트는 백엔드에 맞게 조정 필요
   - 현재는 settings 도메인 하위 예시
   ========================= */

const BASE_URL = '/settings/attendance/work-system-templates';

export const settingsAttendanceApi = {
  /**
   * 근무제 템플릿 목록 조회
   */
  async listWorkSystemTemplates(): Promise<WorkSystemTemplateResponse[]> {
    const res = await apiClient.get<ApiResponse<WorkSystemTemplateResponse[]>>(BASE_URL);
    return unwrap<WorkSystemTemplateResponse[]>(res);
  },

  /**
   * 근무제 템플릿 저장(업서트)
   * - 신규: workSystemTemplateId = null
   * - 수정: workSystemTemplateId = 기존 ID
   */
  async upsertWorkSystemTemplates(
    body: WorkSystemTemplateUpsertRequest[],
  ): Promise<void> {
    await apiClient.put<ApiResponse<null>>(BASE_URL, body);
  },
};
