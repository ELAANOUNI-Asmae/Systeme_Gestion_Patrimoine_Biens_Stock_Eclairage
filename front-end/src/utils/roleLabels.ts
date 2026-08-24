import type { TFunction } from "i18next";

export function getRoleLabel(
  roleName: string,
  t: TFunction,
): string {
  const key = roleName
    .trim()
    .toUpperCase();

  const knownRoles: Record<string, string> = {
    ADMIN: "roles.names.ADMIN",
    GESTIONNAIRE: "roles.names.GESTIONNAIRE",
    RESPONSABLE: "roles.names.RESPONSABLE",
    UTILISATEUR: "roles.names.UTILISATEUR",
  };

  const translationKey =
    knownRoles[key];

  if (!translationKey) {
    return roleName;
  }

  return t(translationKey);
}

export function getPermissionLabel(
  permissionCode: string,
  t: TFunction,
): string {
  const knownPermissions: Record<
    string,
    string
  > = {
    USER_READ:
      "roles.permissions.USER_READ",
    USER_CREATE:
      "roles.permissions.USER_CREATE",
    USER_UPDATE:
      "roles.permissions.USER_UPDATE",
    USER_DELETE:
      "roles.permissions.USER_DELETE",

    ROLE_MANAGE:
      "roles.permissions.ROLE_MANAGE",

    BIEN_MANAGE:
      "roles.permissions.BIEN_MANAGE",

    STOCK_MANAGE:
      "roles.permissions.STOCK_MANAGE",

    ECLAIRAGE_MANAGE:
      "roles.permissions.ECLAIRAGE_MANAGE",

    REPORT_GENERATE:
      "roles.permissions.REPORT_GENERATE",
  };

  const translationKey =
    knownPermissions[
      permissionCode
    ];

  if (!translationKey) {
    return permissionCode;
  }

  return t(translationKey);
}