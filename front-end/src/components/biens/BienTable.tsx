import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import PermissionGuard from "../common/PermissionGuard";
import { PERMISSIONS } from "../../constants/permissions";
import type { BienApiListItem } from "../../services/bienApiService";

type Props = {
  biens: BienApiListItem[];
  deletingId?: number;
  onDelete: (
    bien: BienApiListItem,
  ) => Promise<void> | void;
};

function BienTable({
  biens,
  deletingId,
  onDelete,
}: Props) {
  const { t, i18n } = useTranslation();

  const isArabic =
    i18n.language.startsWith("ar");

  const tr = (
    fr: string,
    ar: string,
  ) => (isArabic ? ar : fr);

  if (biens.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          {t("biens.empty")}
        </p>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {tr(
            "Aucun bien n’est actuellement enregistré dans la base de données.",
            "لا يوجد حالياً أي ممتلك مسجل في قاعدة البيانات.",
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
                {tr("Bien", "الممتلك")}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                {tr("Type", "النوع")}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                {tr(
                  "Affectation",
                  "الجهة المستعملة",
                )}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                {tr("Statut", "الحالة")}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                {tr("Valeur", "القيمة")}
              </th>

              <th className="px-5 py-4 text-end text-xs font-semibold uppercase text-slate-500">
                {tr("Actions", "الإجراءات")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {biens.map((bien) => {
              const usable =
                bien.id !== undefined &&
                bien.type !== undefined;

              return (
                <tr
                  key={bien.key}
                  className="transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {bien.designation}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {bien.inventoryNumber}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {bien.type
                      ? t(
                          `biens.types.${bien.type}`,
                        )
                      : "—"}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {bien.assignment ?? "—"}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                      {t(
                        `biens.statuses.${bien.assetStatus}`,
                      )}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {bien.purchaseValue !== undefined
                      ? `${bien.purchaseValue.toLocaleString(
                          isArabic
                            ? "ar-MA"
                            : "fr-MA",
                        )} DH`
                      : "—"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1 rtl:justify-start">
                      <PermissionGuard
                        permission={
                          PERMISSIONS.GET_ASSET_INFOS
                        }
                      >
                        {bien.id !== undefined && (
                          <Link
                            to={`/biens/${bien.id}?type=${bien.type ?? ""}`}
                            title={tr(
                              "Voir",
                              "عرض",
                            )}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                          >
                            <Eye size={18} />
                          </Link>
                        )}
                      </PermissionGuard>

                      <PermissionGuard
                        permission={
                          PERMISSIONS.UPDATE_ASSET
                        }
                      >
                        {usable && (
                          <Link
                            to={`/biens/${bien.id}/modifier?type=${bien.type}`}
                            title={tr(
                              "Modifier",
                              "تعديل",
                            )}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
                          >
                            <Pencil size={18} />
                          </Link>
                        )}
                      </PermissionGuard>

                      <PermissionGuard
                        permission={
                          PERMISSIONS.DELETE_ASSET
                        }
                      >
                        <button
                          type="button"
                          disabled={
                            !usable ||
                            (bien.id !== undefined &&
                              deletingId === bien.id)
                          }
                          onClick={() =>
                            void onDelete(bien)
                          }
                          title={tr(
                            "Supprimer",
                            "حذف",
                          )}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
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
