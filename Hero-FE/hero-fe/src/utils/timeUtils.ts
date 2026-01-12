/*
  <pre>
  TypeScript Name: timeUtils
  Description: 시간 관련 유틸리티 함수
                - UTC 날짜 문자열을 상대적 시간으로 변환
                - 사용자에게 친숙한 형식으로 시간 표시
                - 예: "방금 전", "5분 전", "2시간 전", "3일 전"
  </pre>

  History
  2026/01/03 (혜원) 최초작성

  @author 혜원
  @version 1.0
  </pre>
*/

/**
 * UTC 시간 문자열을 상대 시간으로 변환
 * 
 * @param {string} utcDateString - UTC 시간 문자열 (ISO 8601 형식)
 * @returns {string} 상대 시간 표시 (예: "방금 전", "3분 전")
 * 
 * @example
 * getRelativeTime('2025-01-03T10:00:00Z') // "5분 전"
 */
export const getRelativeTime = (utcDateString: string): string => {
  // UTC 시간을 Date 객체로 변환 (자동으로 로컬 시간으로 변환됨)
  const utcDate = new Date(utcDateString);
  const now = new Date();
  
  // 현재 시간과의 차이 계산 (밀리초)
  const diffMs = now.getTime() - utcDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;
  
  // 7일 이상 지난 경우 날짜 표시
  return utcDate.toLocaleDateString('ko-KR');
};