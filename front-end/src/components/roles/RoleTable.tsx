import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import PermissionGuard from "../common/PermissionGuard";

import { PERMISSIONS } from "../../constants/permissions";

import { getRoleLabel } from "../../utils/roleLabels";

import type { Role } from "../../types/role";

type RoleTableProps = {
  roles: Role[];
  onDelete: (role: Role) => void;
};

function RoleTable({
  roles,
  onDelete,
}: RoleTableProps) {
  const { t } =
    useTranslation();

  if (roles.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          {t("roles.empty")}
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t(
                  "roles.columns.role",
                )}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t(
                  "roles.columns.permissions",
                )}
              </th>

              <th className="px-5 py-4 text-end text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t(
                  "roles.columns.actions",
                )}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {roles.map((role) => {
              const roleLabel =
                getRoleLabel(
                  role.name,
                  t,
                );

              return (
                <tr
                  key={role.id}
                  className="transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                        {roleLabel}
                      </span>

                      <p className="text-[11px] font-medium text-slate-400">
                        {role.name}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {t(
                      "roles.pages.permissionsCount",
                      {
                        count:
                          role.permissions
                            .length,
                      },
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1 rtl:justify-start">
                      <PermissionGuard
                        permission={
                          PERMISSIONS.GET_ROLE_INFOS
                        }
                      >
                        <Link
                          to={`/roles/${role.id}`}
                          title={t(
                            "roles.view",
                          )}
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
                          title={t(
                            "roles.edit",
                          )}
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
                              ? t(
                                  "roles.adminProtected",
                                )
                              : t(
                                  "roles.delete",
                                )
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RoleTable;