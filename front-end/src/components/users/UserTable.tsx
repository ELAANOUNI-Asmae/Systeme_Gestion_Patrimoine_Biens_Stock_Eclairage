import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import PermissionGuard from "../common/PermissionGuard";

import { PERMISSIONS } from "../../constants/permissions";

import type { User } from "../../types/user";

import { getRoleLabel } from "../../utils/roleLabels";

type UserTableProps = {
  users: User[];
  onDelete: (user: User) => void;
};

function UserTable({
  users,
  onDelete,
}: UserTableProps) {
  const { t, i18n } =
    useTranslation();

  const isArabic =
    i18n.language.startsWith("ar");

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          {t("users.empty")}
        </p>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("users.emptyDescription")}
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
                {t("users.columns.user")}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("users.columns.phone")}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("users.columns.cin")}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("users.columns.role")}
              </th>

              <th className="px-5 py-4 text-end text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("users.columns.actions")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {users.map((user) => {
              const displayFirstName =
                isArabic
                  ? user.firstnameAr
                  : user.firstname;

              const displayLastName =
                isArabic
                  ? user.lastnameAr
                  : user.lastname;

              return (
                <tr
                  key={user.id}
                  className="transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                      {displayFirstName.charAt(0)}
                      {displayLastName.charAt(0)}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {displayFirstName} {displayLastName}
                      </p>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                  {user.phone}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                  {user.cin}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                    {getRoleLabel(
                      user.role.name,
                      t,
                    )}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex justify-end gap-1 rtl:justify-start">
                    <PermissionGuard
                      permission={
                        PERMISSIONS.GET_USER_INFOS
                      }
                    >
                      <Link
                        to={`/utilisateurs/${user.id}`}
                        title={t("users.view")}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                      >
                        <Eye size={18} />
                      </Link>
                    </PermissionGuard>

                    <PermissionGuard
                      permission={
                        PERMISSIONS.UPDATE_USER
                      }
                    >
                      <Link
                        to={`/utilisateurs/${user.id}/modifier`}
                        title={t("users.modify")}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
                      >
                        <Pencil size={18} />
                      </Link>
                    </PermissionGuard>

                    <PermissionGuard
                      permission={
                        PERMISSIONS.DELETE_USER
                      }
                    >
                      <button
                        type="button"
                        title={t("users.delete")}
                        onClick={() => onDelete(user)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </PermissionGuard>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserTable;