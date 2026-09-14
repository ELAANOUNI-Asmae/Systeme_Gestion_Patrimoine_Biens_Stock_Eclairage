import type { Role } from "../types/role";
import type { User } from "../types/user";

export const mockRoles: Role[] = [
  {
    id: 1,
    name: "ADMIN",
    permissions: [
      {
        id: 1,
        name: "Gestion des utilisateurs",
        permission: "USER_MANAGE",
      },
      {
        id: 2,
        name: "Gestion des rôles",
        permission: "ROLE_MANAGE",
      },
    ],
  },
  {
    id: 2,
    name: "GESTIONNAIRE",
    permissions: [
      {
        id: 3,
        name: "Gestion du patrimoine",
        permission: "PATRIMOINE_MANAGE",
      },
      {
        id: 4,
        name: "Gestion du stock",
        permission: "STOCK_MANAGE",
      },
    ],
  },
  {
    id: 3,
    name: "RESPONSABLE",
    permissions: [
      {
        id: 5,
        name: "Validation des demandes",
        permission: "REQUEST_VALIDATE",
      },
    ],
  },
  {
    id: 4,
    name: "UTILISATEUR",
    permissions: [
      {
        id: 6,
        name: "Consultation",
        permission: "READ_ONLY",
      },
    ],
  },
];

export const mockUsers: User[] = [
  {
    id: 1,
    firstname: "Mohamed",
    lastname: "Alaoui",
    firstnameAr: "محمد",
    lastnameAr: "العلوي",
    email: "mohamed.alaoui@sgpbse.ma",
    gender: "HOMME",
    phone: "0612345678",
    cin: "AB123456",
    role: mockRoles[0],
    active: true,
  },
  {
    id: 2,
    firstname: "Salma",
    lastname: "Bennani",
    firstnameAr: "سلمى",
    lastnameAr: "بناني",
    email: "salma.bennani@sgpbse.ma",
    gender: "FEMME",
    phone: "0623456789",
    cin: "CD234567",
    role: mockRoles[1],
    active: true,
  },
  {
    id: 3,
    firstname: "Youssef",
    lastname: "Idrissi",
    firstnameAr: "يوسف",
    lastnameAr: "الإدريسي",
    email: "youssef.idrissi@sgpbse.ma",
    gender: "HOMME",
    phone: "0634567890",
    cin: "EF345678",
    role: mockRoles[2],
    active: false,
  },
  {
    id: 4,
    firstname: "Imane",
    lastname: "Amrani",
    firstnameAr: "إيمان",
    lastnameAr: "العمراني",
    email: "imane.amrani@sgpbse.ma",
    gender: "FEMME",
    phone: "0645678901",
    cin: "GH456789",
    role: mockRoles[3],
    active: true,
  },
];
