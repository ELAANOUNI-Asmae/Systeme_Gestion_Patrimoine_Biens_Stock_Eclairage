import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import PermissionGuard from "../common/PermissionGuard";
import { PERMISSIONS } from "../../constants/permissions";

import type { Bien } from "../../types/bien";

type Props = {
  biens: Bien[];
  onDelete: (bien: Bien) => void;
};

function BienTable({
  biens,
  onDelete,
}: Props) {
  const { t, i18n } =
    useTranslation();

  const isArabic =
    i18n.language.startsWith("ar");

  if (biens.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          {t("biens.empty")}
        </p>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t(
            "biens.emptyDescription",
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
              <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                {t(
                  "biens.columns.bien",
                )}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                {t(
                  "biens.columns.type",
                )}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                {t(
                  "biens.columns.assignment",
                )}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                {t(
                  "biens.columns.status",
                )}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                {t(
                  "biens.columns.value",
                )}
              </th>

              <th className="px-5 py-4 text-end text-xs font-semibold uppercase text-slate-500">
                {t(
                  "biens.columns.actions",
                )}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {biens.map((bien) => {
              const designation =
                isArabic
                  ? bien.designationAr
                  : bien.designation;

              const assignment =
                isArabic
                  ? bien.assignmentAr
                  : bien.assignment;

              return (
                <tr
                  key={bien.id}
                  className="transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {designation}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {bien.inventoryId}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {t(
                      `biens.types.${bien.type}`,
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {assignment}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                      {t(
                        `biens.statuses.${bien.assetStatus}`,
                      )}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {bien.purchaseValue.toLocaleString(
                      isArabic
                        ? "ar-MA"
                        : "fr-MA",
                    )}{" "}
                    DH
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1 rtl:justify-start">
                      <PermissionGuard
                        permission={
                          PERMISSIONS.GET_ASSET_INFOS
                        }
                      >
                        <Link
                          to={`/biens/${bien.id}`}
                          title={t("biens.view")}
                          className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={18} />
                        </Link>
                      </PermissionGuard>

                      <PermissionGuard
                        permission={
                          PERMISSIONS.UPDATE_ASSET
                        }
                      >
                        <Link
                          to={`/biens/${bien.id}/modifier`}
                          title={t("biens.edit")}
                          className="rounded-lg p-2 text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Pencil size={18} />
                        </Link>
                      </PermissionGuard>

                      <PermissionGuard
                        permission={
                          PERMISSIONS.DELETE_ASSET
                        }
                      >
                        <button
                          type="button"
                          title={t("biens.delete")}
                          onClick={() =>
                            onDelete(bien)
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={18} />
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

export default BienTable;
