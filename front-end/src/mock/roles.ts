import type { Permission, Role } from "../types/role";

export const mockPermissions: Permission[] = [
  {
    id: 1,
    name: "Consulter les utilisateurs",
    permission: "USER_READ",
  },
  {
    id: 2,
    name: "Ajouter un utilisateur",
    permission: "USER_CREATE",
  },
  {
    id: 3,
    name: "Modifier un utilisateur",
    permission: "USER_UPDATE",
  },
  {
    id: 4,
    name: "Supprimer un utilisateur",
    permission: "USER_DELETE",
  },
  {
    id: 5,
    name: "Gérer les rôles",
    permission: "ROLE_MANAGE",
  },
  {
    id: 6,
    name: "Gérer les biens",
    permission: "BIEN_MANAGE",
  },
  {
    id: 7,
    name: "Gérer le stock",
    permission: "STOCK_MANAGE",
  },
  {
    id: 8,
    name: "Gérer l’éclairage public",
    permission: "ECLAIRAGE_MANAGE",
  },
  {
    id: 9,
    name: "Générer les rapports",
    permission: "REPORT_GENERATE",
  },
];

export const initialMockRoles: Role[] = [
  {
    id: 1,
    name: "ADMIN",
    permissions: [...mockPermissions],
  },
  {
    id: 2,
    name: "GESTIONNAIRE",
    permissions: mockPermissions.filter((permission) =>
      [1, 6, 7, 9].includes(permission.id),
    ),
  },
  {
    id: 3,
    name: "RESPONSABLE",
    permissions: mockPermissions.filter((permission) =>
      [1, 7, 8, 9].includes(permission.id),
    ),
  },
  {
    id: 4,
    name: "UTILISATEUR",
    permissions: mockPermissions.filter((permission) =>
      [1].includes(permission.id),
    ),
  },
];