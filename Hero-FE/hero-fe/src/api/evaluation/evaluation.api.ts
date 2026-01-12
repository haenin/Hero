/**
 * <pre>
 * File Name   : evaluation.api.ts
 * Description : 평가 관련 API 호출 모듈
 *
 * History
 * 2025/01/02 - (승건) 최초 작성
 * </pre>
 */

import client from '@/api/apiClient';
import type { EmployeeEvaluationListResponseDTO } from '@/types/evaluation/evaluation.types';

// 공통 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: any;
  message?: string;
}

/**
 * 특정 직원의 평가 이력 목록 조회
 */
export const fetchEmployeeEvaluationList = (employeeId: number) => {
  return client.get<ApiResponse<EmployeeEvaluationListResponseDTO[]>>(`/evaluation/evaluation-form/list/${employeeId}`);
};