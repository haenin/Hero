/**
 * TypeScript Name : personnel.ts
 * Description : 사원 도메인의 타입 정의 (인터페이스)
 *               [Frontend 사원 화면에서 사용하는 모든 DTO 타입 정의]
 *
 * History
 * 2025/12/12 - 승건 최초 작성
 *
 * @module personnel-type
 * @author 승건
 * @version 1.0
 */

// --- Request DTOs (요청 데이터) ---

/**
 * 직원 검색 및 페이징 조건을 담는 인터페이스
 * (Backend: EmployeeSearchDTO)
 */
export interface EmployeeSearchParams {
  departmentName?: string;    // 부서명
  jobTitleName?: string;      // 직책명
  gradeName?: string;         // 직급명
  employeeName?: string;      // 직원 이름
  resigningExpected?: number; // 퇴사 예정자 여부 (0: 포함, 1: 미포함, 2: 퇴사 예정자만)
  page?: number;              // 현재 페이지 (기본값 1)
  size?: number;              // 페이지 당 개수 (기본값 10)
}

/**
 * 직원 본인 정보 수정 요청 인터페이스
 * (Backend: EmployeeSelfUpdateRequestDTO)
 */
export interface EmployeeSelfUpdateParams {
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string; // YYYY-MM-DD
}

/**
 * 직원 회원가입(등록) 요청 인터페이스
 * (Backend: SignupRequestDTO)
 */
export interface EmployeeRegisterParams {
  employeeName: string;       // 직원 이름 (필수)
  employeeNumber: string;     // 사번 (필수)
  email: string;              // 이메일 (필수)
  phone: string;              // 전화번호 (필수)
  contractType: string;       // 고용 형태 (필수)
  gender: string;             // 성별 (M/F) (필수)
  hireDate: string;           // 입사일 (YYYY-MM-DD) (필수)
  imageFile?: File | null;    // 프로필 이미지 파일 (선택)
  baseSalary: number;         // 기본급 (필수)
  birthDate?: string;         // 생년월일 (선택)
  address?: string;           // 주소 (선택)
  departmentName?: string;    // 부서 이름 (선택)
  gradeName?: string;         // 직급 이름 (선택)
  jobTitleName?: string;      // 직책 이름 (선택)
}

// --- Response DTOs (응답 데이터) ---

/**
 * 부서 변경 이력 응답 인터페이스
 * (Backend: DepartmentHistoryResponseDTO)
 */
export interface DepartmentHistoryResponse {
  employeeHistoryId: number;
  employeeId: number;
  changedBy: number;
  changedAt: string;          // LocalDateTime (ISO String)
  changeType: string;         // Enum (ChangeType)
  departmentName: string;
}

/**
 * 직원 상세 정보 응답 인터페이스
 * (Backend: EmployeeDetailResponseDTO)
 */
export interface EmployeeDetailResponse {
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  email: string;
  phone: string;
  contractType: string;
  gender: string;
  hireDate: string;           // LocalDate
  terminationDate?: string;   // LocalDate
  retentionExpireAt?: string; // LocalDate
  birthDate: string;          // LocalDate
  sealImageUrl?: string;
  imagePath?: string;
  address?: string;
  departmentName: string;
  departmentPath: string;     // 부서 전체 경로 (예: 본부 > 개발팀)
  daysOfService: number;      // 근속 연수
  gradeName: string;
  jobTitleName: string;
  evaluationPoint?: number;
  status: string;
}

/**
 * 직원 목록 조회 응답 인터페이스 (요약 정보)
 * (Backend: EmployeeListResponseDTO)
 */
export interface EmployeeListResponse {
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  departmentName: string;
  gradeName: string;
  jobTitleName: string;
}

/**
 * 내 정보 조회 응답 인터페이스
 * (Backend: MyInfoResponseDTO)
 */
export interface MyInfoResponse {
  employeeId: number;
  employeeNumber: string;
  employeeName: string;
  imagePath?: string;       // 프로필 사진 경로
  sealImageUrl?: string;    // 직인 이미지 경로
  birthDate: string;
  contractType: string;
  jobTitleName: string;
  gradeName: string;
  departmentName: string;
  departmentPath: string;   // 부서 경로
  email: string;
  phone: string;
  address?: string;
  hireDate: string;
  terminationDate?: string;
  daysOfService: number;    // 근속 연수
  baseSalary: number;       // 기본급
  status: string;           // 재직 상태
}

/**
 * 검색 필터 옵션(부서, 직급, 직책) 조회 응답 인터페이스
 * (Backend: EmployeeSearchOptionsResponseDTO)
 */
export interface EmployeeSearchOptionsResponse {
  department: string[];
  grade: string[];
  jobTitle: string[];
}
