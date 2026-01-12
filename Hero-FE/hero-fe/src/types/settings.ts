export interface SettingsDepartmentRequestDTO {
  departmentId: number;
  departmentName: string;
  departmentPhone: string;
  depth: number;
  parentDepartmentId: number | null;
  managerId: number | null;
  children: SettingsDepartmentRequestDTO[];
}

export interface SettingsGradeRequestDTO {
  gradeId: number;
  gradeName: string;
  requiredPoint: number;
}

export interface SettingsJobTitleRequestDTO {
  jobTitleId: number;
  jobTitleName: string;
}

export interface SettingsLoginPolicyRequestDTO {
  value: number;
}

export interface SettingsPermissionsRequestDTO {
  employeeId: number;
  roleIds: number[];
}

export interface SettingsDepartmentManagerDTO {
  employeeId: number;
  employeeNumber: string;
  employeeName: string;
  jobTitle: string;
  grade: string;
}

export interface SettingsDepartmentResponseDTO {
  departmentId: number;
  departmentName: string;
  departmentPhone: string;
  depth: number;
  parentDepartmentId: number | null;
  manager: SettingsDepartmentManagerDTO | null;
  children: SettingsDepartmentResponseDTO[];
}

export interface SettingsPermissionsResponseDTO {
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  department: string;
  grade: string;
  jobTitle: string;
  role: string[];
}

export interface Grade {
  gradeId: number;
  grade: string;
  requiredPoint: number;
}

export interface JobTitle {
  jobTitleId: number;
  jobTitle: string;
}

export interface Role {
  roleId: number;
  role: string;
}