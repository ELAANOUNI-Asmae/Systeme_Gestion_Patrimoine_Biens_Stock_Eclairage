import type { Permission } from "../constants/permissions";

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: AuthUser | null;

  isAuthenticated: boolean;

  login: (
    credentials: LoginRequest,
  ) => Promise<boolean>;

  logout: () => void;

  hasPermission: (
    permission: Permission,
  ) => boolean;
}