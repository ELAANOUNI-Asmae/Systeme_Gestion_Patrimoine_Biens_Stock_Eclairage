export interface Permission {
  id: number;
  name: string;
  permission: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface RoleFormData {
  name: string;
  permissionIds: number[];
}