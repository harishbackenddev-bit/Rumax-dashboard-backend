// utils/default-roles.ts

export interface IPermission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
}

export interface IDefaultRole {
  name: string;
  description: string;
  color: string;
  isDefault: boolean;
  isActive: boolean;
  permissions: IPermission[];
}

export const defaultRoles: IDefaultRole[] = [
  {
    name: "Super Admin",
    description: "Full system access — all modules",
    color: "#DC2626",
    isDefault: true,
    isActive: true,
    permissions: [
      { module: "dashboard", view: true, create: true, edit: true, delete: true, export: true },
      { module: "recruitment_pipeline", view: true, create: true, edit: true, delete: true, export: true },
      { module: "jobs_vacancies", view: true, create: true, edit: true, delete: true, export: true },
      { module: "employees", view: true, create: true, edit: true, delete: true, export: true },
      { module: "reports_analytics", view: true, create: true, edit: true, delete: true, export: true },
      { module: "user_management", view: true, create: true, edit: true, delete: true, export: true },
      { module: "roles_permissions", view: true, create: true, edit: true, delete: true, export: true },
      { module: "settings", view: true, create: true, edit: true, delete: true, export: true }
    ]
  },
  {
    name: "HR Manager",
    description: "Manage recruitment and employees",
    color: "#2563EB",
    isDefault: true,
    isActive: true,
    permissions: [
      { module: "dashboard", view: true, create: false, edit: false, delete: false, export: true },
      { module: "recruitment_pipeline", view: true, create: true, edit: true, delete: true, export: true },
      { module: "jobs_vacancies", view: true, create: true, edit: true, delete: false, export: true },
      { module: "employees", view: true, create: true, edit: true, delete: false, export: true },
      { module: "reports_analytics", view: true, create: false, edit: false, delete: false, export: true },
      { module: "user_management", view: true, create: false, edit: false, delete: false, export: false },
      { module: "roles_permissions", view: false, create: false, edit: false, delete: false, export: false },
      { module: "settings", view: true, create: false, edit: false, delete: false, export: false }
    ]
  },
  {
    name: "Recruiter",
    description: "Post jobs and manage candidates",
    color: "#7C3AED",
    isDefault: true,
    isActive: true,
    permissions: [
      { module: "dashboard", view: true, create: false, edit: false, delete: false, export: false },
      { module: "recruitment_pipeline", view: true, create: true, edit: true, delete: false, export: false },
      { module: "jobs_vacancies", view: true, create: true, edit: true, delete: false, export: false },
      { module: "employees", view: false, create: false, edit: false, delete: false, export: false },
      { module: "reports_analytics", view: true, create: false, edit: false, delete: false, export: false },
      { module: "user_management", view: false, create: false, edit: false, delete: false, export: false },
      { module: "roles_permissions", view: false, create: false, edit: false, delete: false, export: false },
      { module: "settings", view: true, create: false, edit: false, delete: false, export: false }
    ]
  },
  {
    name: "Hiring Manager",
    description: "Review candidates and conduct interviews",
    color: "#16A34A",
    isDefault: true,
    isActive: true,
    permissions: [
      { module: "dashboard", view: true, create: false, edit: false, delete: false, export: false },
      { module: "recruitment_pipeline", view: true, create: false, edit: true, delete: false, export: false },
      { module: "jobs_vacancies", view: true, create: false, edit: false, delete: false, export: false },
      { module: "employees", view: true, create: false, edit: false, delete: false, export: false },
      { module: "reports_analytics", view: true, create: false, edit: false, delete: false, export: false },
      { module: "user_management", view: false, create: false, edit: false, delete: false, export: false },
      { module: "roles_permissions", view: false, create: false, edit: false, delete: false, export: false },
      { module: "settings", view: true, create: false, edit: false, delete: false, export: false }
    ]
  }
];

// Helper function to get default permissions for a module
export const getDefaultPermissionsForModule = (moduleId: string): IPermission => {
  return {
    module: moduleId,
    view: false,
    create: false,
    edit: false,
    delete: false,
    export: false
  };
};

// Helper function to check if a role is default
export const isDefaultRole = (roleName: string): boolean => {
  return defaultRoles.some(role => role.name === roleName);
};

// Helper function to get default role by name
export const getDefaultRoleByName = (roleName: string): IDefaultRole | undefined => {
  return defaultRoles.find(role => role.name === roleName);
};

// Helper function to get all default role names
export const getDefaultRoleNames = (): string[] => {
  return defaultRoles.map(role => role.name);
};