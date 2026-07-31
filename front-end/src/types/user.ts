import type { Role } from "./role";

export type Gender = "HOMME" | "FEMME";

export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  gender: Gender;
  phone: string;
  cin: string;
  role: Role;
}

export interface UserFormData {
  email: string;
  firstname: string;
  lastname: string;
  gender: Gender;
  phone: string;
  cin: string;
  pwd: string;
  roleId: number;
}

export interface UserFilters {
  search: string;
  role: string;
}