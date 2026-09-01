import {
  Eye,
  Pencil,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type {
  Light,
  LightStatus,
} from "../../types/lighting";

type Props = {
  lights: Light[];
  loading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canReportFailure?: boolean;
  openFailureLightIds?: Set<number>;
  onDelete: (light: Light) => void;
  onReportFailure: (light: Light) => void;
};

const statusClasses: Record<LightStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  INACTIVE: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  DAMAGED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  UNDER_MAINTENANCE:
    "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
};

function LightTable({
  lights,
  loading = false,
  canEdit = false,
  canDelete = false,
  canReportFailure = false,
  openFailureLightIds = new Set(),
  onDelete,
  onReportFailure,
}: Props) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800">
        {tr("Chargement...", "جارٍ التحميل...")}
      </div>
    );
  }

  if (lights.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800">
        {tr("Aucun point lumineux trouvé.", "لم يتم العثور على نقاط إنارة.")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <table className="min-w-full">
        <thead className="bg-slate-50 dark:bg-slate-900/60">
          <tr className="text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 text-start">
              {tr("Point lumineux", "نقطة الإنارة")}
            </th>
            <th className="px-4 py-3 text-start">
              {tr("Localisation", "الموقع")}
            </th>
            <th className="px-4 py-3 text-start">
              {tr("Puissance", "القدرة")}
            </th>
            <th className="px-4 py-3 text-start">
              {tr("Statut", "الحالة")}
            </th>
            <th className="px-4 py-3 text-end">
              {tr("Actions", "الإجراءات")}
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {lights.map((light) => {
            const hasOpenFailure = openFailureLightIds.has(light.id);

            return (
              <tr key={light.id}>
                <td className="px-4 py-4">
                  <p className="font-semibold">
                    {isArabic ? light.designationAr : light.designation}
                  </p>
                  <p className="text-xs text-slate-500">{light.reference}</p>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                  {light.localisation}
                </td>
                <td className="px-4 py-4 text-sm">{light.power} W</td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[light.status]}`}
                  >
                    {t(`lighting.statuses.${light.status}`)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-1">
                    {canReportFailure && !hasOpenFailure && (
                      <button
                        type="button"
                        title={tr("Déclarer une panne", "التبليغ عن عطل")}
                        onClick={() => onReportFailure(light)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <TriangleAlert size={18} />
                      </button>
                    )}

                    <Link
                      to={`/eclairage/${light.id}`}
                      title={tr("Détails", "التفاصيل")}
                      className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                    >
                      <Eye size={18} />
                    </Link>

                    {canEdit && (
                      <Link
                        to={`/eclairage/${light.id}/modifier`}
                        title={tr("Modifier", "تعديل")}
                        className="rounded-lg p-2 text-orange-600 hover:bg-orange-50"
                      >
                        <Pencil size={18} />
                      </Link>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        title={tr("Supprimer", "حذف")}
                        onClick={() => onDelete(light)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default LightTable;
