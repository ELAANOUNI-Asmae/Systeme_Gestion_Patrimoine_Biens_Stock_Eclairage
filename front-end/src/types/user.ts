import type { Role } from "./role";

export type Gender =
  | "HOMME"
  | "FEMME";

export interface User {
  id: number;

  firstname: string;
  lastname: string;

  firstnameAr: string;
  lastnameAr: string;

  email: string;
  gender: Gender;
  phone: string;
  cin: string;
  role: Role;
  active: boolean;
}

export interface UserFormData {
  firstname: string;
  lastname: string;

  firstnameAr: string;
  lastnameAr: string;

  email: string;
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
