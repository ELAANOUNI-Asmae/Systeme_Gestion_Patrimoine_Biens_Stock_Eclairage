import type {
  Permission,
} from "../constants/permissions";

export interface Role {
  id: number;
  name: string;
  permissions: string[];
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

export interface ApiPermission {
  id: number;
  name: string;
  permission: string;
}

export interface CurrentUserResponse {
  id: number;
  email: string;
  fullname_fr: string | null;
  fullname_ar: string | null;
  gender: string | null;
  phone: string | null;
  cin: string | null;

  role: {
    id: number;
    name: string;
    permissions: ApiPermission[];
  };
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