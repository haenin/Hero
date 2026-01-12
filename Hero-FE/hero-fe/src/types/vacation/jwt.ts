/**
 * <pre>
 * TypeScript Name : auth-jwt.util.ts
 * Description     : JWT 관련 유틸리티 모듈
 *                   - JWT payload 디코딩
 *                   - JWT 에서 employeeId 추출
 *
 * History
 *   2026/01/01 (이지윤) JWT 유틸 타입/함수 최초 작성
 * </pre>
 *
 * @author 이지윤
 * @version 1.0
 */

/**
 * JWT Payload 타입
 * - key/value 자유로운 구조의 객체
 */
export type JwtPayload = Record<string, unknown>;

/**
 * JWT 토큰에서 payload 부분을 디코딩하여 객체로 반환합니다.
 *
 * @param token JWT 문자열 (header.payload.signature)
 * @returns 디코딩된 payload 객체, 실패 시 null
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payloadBase64Url = token.split('.')[1];
    if (!payloadBase64Url) return null;

    const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(payloadBase64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * JWT 토큰에서 employeeId(숫자)를 추출합니다.
 * - 프로젝트별 Claim 키가 다를 수 있어 여러 후보 키를 순차적으로 검사합니다.
 *
 * @param token JWT 문자열
 * @returns employeeId 숫자, 찾지 못하면 null
 */
export function extractEmployeeIdFromToken(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  // 프로젝트별로 자주 사용하는 Claim 키 후보
  const candidates = ['employeeId', 'employee_id', 'empId', 'id', 'sub'];

  for (const key of candidates) {
    const value = payload[key];
    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(num)) {
      return num;
    }
  }

  return null;
}
