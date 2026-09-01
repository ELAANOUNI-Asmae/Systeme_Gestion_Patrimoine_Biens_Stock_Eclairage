
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import PermissionGuard from "../common/PermissionGuard";
import { PERMISSIONS } from "../../constants/permissions";
import type { StockArticle } from "../../types/stock";

type Props = {
  articles: StockArticle[];
  loading: boolean;
  onDelete: (article: StockArticle) => void;
  onEntry: (article: StockArticle) => void;
  onExit: (article: StockArticle) => void;
};

function ArticleTable({
  articles,
  loading,
  onDelete,
  onEntry,
  onExit,
}: Props) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/60">
            <tr>
              {[
                tr("Article", "المادة"),
                tr("Catégorie", "الفئة"),
                tr("Quantité", "الكمية"),
                tr("Prix unitaire TTC", "ثمن الوحدة شامل الضريبة"),
                tr("Emplacement", "المكان"),
                tr("Actions", "الإجراءات"),
              ].map((label, index) => (
                <th
                  key={label}
                  className={[
                    "px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500",
                    index === 5 ? "text-end" : "text-start",
                  ].join(" ")}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                  {tr("Chargement", "جارٍ التحميل")}
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                  {tr("Aucun article trouvé", "لم يتم العثور على أي مادة")}
                </td>
              </tr>
            ) : (
              articles.map((article) => {
                const low =
                  article.quantity <= article.minimumQuantity;

                return (
                  <tr
                    key={article.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-700/40"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold">
                        {isArabic
                          ? article.designationAr
                          : article.designation}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {article.reference} · {article.brand}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {tr("Code-barres", "الباركود")}: {article.barcode}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {isArabic
                        ? article.categoryAr
                        : article.category}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          low
                            ? "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300"
                            : "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300"
                        }
                      >
                        {article.quantity} {article.unit}
                      </span>
                      {low && (
                        <p className="mt-1 text-xs font-medium text-red-600">
                          {tr("Stock faible", "مخزون منخفض")}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold">
                      {(
                        article.unitPriceHt *
                        (1 + article.vatRate / 100)
                      ).toFixed(2)}{" "}
                      DH
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {isArabic
                        ? article.locationAr
                        : article.location}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1 rtl:justify-start">
                        <PermissionGuard permission={PERMISSIONS.CREATE_STOCK_ENTRY}>
                          <button
                            type="button"
                            onClick={() => onEntry(article)}
                            title={tr("Entrée", "إدخال")}
                            className="rounded-lg p-2 text-slate-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-500/10"
                          >
                            <ArrowDownToLine size={18} />
                          </button>
                        </PermissionGuard>

                        <PermissionGuard permission={PERMISSIONS.CREATE_STOCK_EXIT}>
                          <button
                            type="button"
                            onClick={() => onExit(article)}
                            title={tr("Sortie", "إخراج")}
                            className="rounded-lg p-2 text-slate-500 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10"
                          >
                            <ArrowUpFromLine size={18} />
                          </button>
                        </PermissionGuard>

                        <Link
                          to={`/stock/articles/${article.id}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10"
                          title={tr("Voir", "عرض")}
                        >
                          <Eye size={18} />
                        </Link>

                        <PermissionGuard permission={PERMISSIONS.UPDATE_ARTICLE}>
                          <Link
                            to={`/stock/articles/${article.id}/modifier`}
                            className="rounded-lg p-2 text-slate-500 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10"
                            title={tr("Modifier", "تعديل")}
                          >
                            <Pencil size={18} />
                          </Link>
                        </PermissionGuard>

                        <PermissionGuard permission={PERMISSIONS.DELETE_ARTICLE}>
                          <button
                            type="button"
                            onClick={() => onDelete(article)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                            title={tr("Supprimer", "حذف")}
                          >
                            <Trash2 size={18} />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ArticleTable;
