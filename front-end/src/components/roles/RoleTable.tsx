import {
  Eye,
  Pencil,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import PermissionGuard from "../common/PermissionGuard";

import {
  PERMISSIONS,
} from "../../constants/permissions";

import {
  getRoleLabel,
} from "../../utils/roleLabels";

import type {
  Role,
} from "../../types/role";

type RoleTableProps = {
  roles: Role[];
  onDelete: (
    role: Role,
  ) => void;
};

function RoleTable({
  roles,
  onDelete,
}: RoleTableProps) {
  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith(
      "ar",
    );

  if (
    roles.length === 0
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          {t(
            "roles.empty",
          )}
        </p>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t(
            "roles.emptyDescription",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {roles.map(
        (role) => (
          <article
            key={role.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                <ShieldCheck
                  size={22}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">
                  {getRoleLabel(
                    role.name,
                    t,
                  )}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {isArabic
                    ? `${role.permissions.length} صلاحية`
                    : `${role.permissions.length} permission(s)`}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-1 border-t border-slate-100 pt-4 dark:border-slate-700 rtl:justify-start">
              <PermissionGuard
                permission={
                  PERMISSIONS.GET_ROLE_INFOS
                }
              >
                <Link
                  to={`/roles/${role.id}`}
                  title={
                    isArabic
                      ? "عرض"
                      : "Voir"
                  }
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                >
                  <Eye
                    size={18}
                  />
                </Link>
              </PermissionGuard>

              <PermissionGuard
                permission={
                  PERMISSIONS.UPDATE_ROLE
                }
              >
                <Link
                  to={`/roles/${role.id}/modifier`}
                  title={
                    isArabic
                      ? "تعديل"
                      : "Modifier"
                  }
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
                >
                  <Pencil
                    size={18}
                  />
                </Link>
              </PermissionGuard>

              <PermissionGuard
                permission={
                  PERMISSIONS.DELETE_ROLE
                }
              >
                <button
                  type="button"
                  title={
                    role.name ===
                    "ADMIN"
                      ? isArabic
                        ? "لا يمكن حذف دور مدير النظام"
                        : "Le rôle ADMIN ne peut pas être supprimé"
                      : isArabic
                        ? "حذف"
                        : "Supprimer"
                  }
                  onClick={() =>
                    onDelete(
                      role,
                    )
                  }
                  disabled={
                    role.name ===
                    "ADMIN"
                  }
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                  <Trash2
                    size={18}
                  />
                </button>
              </PermissionGuard>
            </div>
          </article>
        ),
      )}
    </div>
  );
}

export default RoleTable;
