import {
  PERMISSIONS,
} from "../constants/permissions";

import type {
  Permission,
  Role,
} from "../types/role";

const permissionDefinitions = [
  [PERMISSIONS.GET_ALL_USERS, "Consulter les utilisateurs"],
  [PERMISSIONS.GET_USER_INFOS, "Consulter les détails d’un utilisateur"],
  [PERMISSIONS.CREATE_USER, "Ajouter un utilisateur"],
  [PERMISSIONS.UPDATE_USER, "Modifier un utilisateur"],
  [PERMISSIONS.DELETE_USER, "Supprimer un utilisateur"],

  [PERMISSIONS.GET_ALL_ROLES, "Consulter les rôles"],
  [PERMISSIONS.GET_ROLE_INFOS, "Consulter les détails d’un rôle"],
  [PERMISSIONS.CREATE_ROLE, "Ajouter un rôle"],
  [PERMISSIONS.UPDATE_ROLE, "Modifier un rôle"],
  [PERMISSIONS.DELETE_ROLE, "Supprimer un rôle"],

  [PERMISSIONS.GET_ALL_ASSETS, "Consulter les biens"],
  [PERMISSIONS.GET_ASSET_INFOS, "Consulter les détails d’un bien"],
  [PERMISSIONS.CREATE_ASSET, "Ajouter un bien"],
  [PERMISSIONS.UPDATE_ASSET, "Modifier un bien"],
  [PERMISSIONS.DELETE_ASSET, "Supprimer un bien"],
  [PERMISSIONS.ASSIGN_ASSET, "Affecter un bien"],

  [PERMISSIONS.GET_ALL_ARTICLES, "Consulter les articles"],
  [PERMISSIONS.CREATE_ARTICLE, "Ajouter un article"],
  [PERMISSIONS.UPDATE_ARTICLE, "Modifier un article"],
  [PERMISSIONS.DELETE_ARTICLE, "Supprimer un article"],
  [PERMISSIONS.CREATE_STOCK_ENTRY, "Enregistrer une entrée de stock"],
  [PERMISSIONS.CREATE_STOCK_EXIT, "Enregistrer une sortie de stock"],
  [PERMISSIONS.CREATE_SUPPLY_REQUEST, "Créer une demande de fourniture"],
  [PERMISSIONS.VALIDATE_SUPPLY_REQUEST, "Valider une demande de fourniture"],
  [PERMISSIONS.REJECT_SUPPLY_REQUEST, "Refuser une demande de fourniture"],
  [PERMISSIONS.GET_STOCK_HISTORY, "Consulter l’historique du stock"],
  [PERMISSIONS.GET_STOCK_ALERTS, "Consulter les alertes de stock"],

  [PERMISSIONS.GET_ALL_LIGHTS, "Consulter les points lumineux"],
  [PERMISSIONS.CREATE_LIGHT, "Ajouter un point lumineux"],
  [PERMISSIONS.UPDATE_LIGHT, "Modifier un point lumineux"],
  [PERMISSIONS.DELETE_LIGHT, "Supprimer un point lumineux"],
  [PERMISSIONS.REPORT_FAILURE, "Déclarer une panne"],
  [PERMISSIONS.CREATE_INTERVENTION, "Planifier une intervention"],
  [PERMISSIONS.UPDATE_INTERVENTION, "Modifier une intervention"],

  [PERMISSIONS.GENERATE_REPORT, "Générer un rapport"],
  [PERMISSIONS.EXPORT_PDF, "Exporter un rapport en PDF"],
  [PERMISSIONS.EXPORT_EXCEL, "Exporter un rapport en Excel"],

  [PERMISSIONS.UPDATE_PROFILE, "Modifier le profil"],
  [PERMISSIONS.CHANGE_PASSWORD, "Changer le mot de passe"],
  [PERMISSIONS.MANAGE_SETTINGS, "Gérer les paramètres"],
] as const;

export const mockPermissions: Permission[] =
  permissionDefinitions.map(
    ([permission, name], index) => ({
      id: index + 1,
      name,
      permission,
    }),
  );

const permissionsByCode =
  new Map(
    mockPermissions.map(
      (permission) => [
        permission.permission,
        permission,
      ],
    ),
  );

const selectPermissions = (
  codes: string[],
) =>
  codes
    .map(
      (code) =>
        permissionsByCode.get(
          code,
        ),
    )
    .filter(
      (
        permission,
      ): permission is Permission =>
        permission !== undefined,
    );

export const initialMockRoles: Role[] = [
  {
    id: 1,
    name: "ADMIN",
    permissions: [
      ...mockPermissions,
    ],
  },
  {
    id: 2,
    name: "GESTIONNAIRE",
    permissions: selectPermissions([
      PERMISSIONS.GET_ALL_ASSETS,
      PERMISSIONS.GET_ASSET_INFOS,
      PERMISSIONS.CREATE_ASSET,
      PERMISSIONS.UPDATE_ASSET,
      PERMISSIONS.ASSIGN_ASSET,
      PERMISSIONS.GET_ALL_ARTICLES,
      PERMISSIONS.CREATE_ARTICLE,
      PERMISSIONS.UPDATE_ARTICLE,
      PERMISSIONS.CREATE_STOCK_ENTRY,
      PERMISSIONS.CREATE_STOCK_EXIT,
      PERMISSIONS.CREATE_SUPPLY_REQUEST,
      PERMISSIONS.GET_STOCK_HISTORY,
      PERMISSIONS.GET_STOCK_ALERTS,
      PERMISSIONS.GET_ALL_LIGHTS,
      PERMISSIONS.CREATE_LIGHT,
      PERMISSIONS.UPDATE_LIGHT,
      PERMISSIONS.REPORT_FAILURE,
      PERMISSIONS.CREATE_INTERVENTION,
      PERMISSIONS.UPDATE_INTERVENTION,
      PERMISSIONS.GENERATE_REPORT,
      PERMISSIONS.EXPORT_PDF,
      PERMISSIONS.EXPORT_EXCEL,
      PERMISSIONS.UPDATE_PROFILE,
      PERMISSIONS.CHANGE_PASSWORD,
    ]),
  },
  {
    id: 3,
    name: "RESPONSABLE",
    permissions: selectPermissions([
      PERMISSIONS.GET_ALL_USERS,
      PERMISSIONS.GET_USER_INFOS,
      PERMISSIONS.GET_ALL_ASSETS,
      PERMISSIONS.GET_ASSET_INFOS,
      PERMISSIONS.GET_ALL_ARTICLES,
      PERMISSIONS.VALIDATE_SUPPLY_REQUEST,
      PERMISSIONS.REJECT_SUPPLY_REQUEST,
      PERMISSIONS.GET_STOCK_HISTORY,
      PERMISSIONS.GET_STOCK_ALERTS,
      PERMISSIONS.GET_ALL_LIGHTS,
      PERMISSIONS.GENERATE_REPORT,
      PERMISSIONS.EXPORT_PDF,
      PERMISSIONS.EXPORT_EXCEL,
      PERMISSIONS.UPDATE_PROFILE,
      PERMISSIONS.CHANGE_PASSWORD,
    ]),
  },
  {
    id: 4,
    name: "UTILISATEUR",
    permissions: selectPermissions([
      PERMISSIONS.GET_ALL_ASSETS,
      PERMISSIONS.GET_ASSET_INFOS,
      PERMISSIONS.GET_ALL_ARTICLES,
      PERMISSIONS.GET_STOCK_HISTORY,
      PERMISSIONS.GET_ALL_LIGHTS,
      PERMISSIONS.REPORT_FAILURE,
      PERMISSIONS.GENERATE_REPORT,
      PERMISSIONS.UPDATE_PROFILE,
      PERMISSIONS.CHANGE_PASSWORD,
    ]),
  },
];
