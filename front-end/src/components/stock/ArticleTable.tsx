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

type ArticleTableProps = {
  articles: StockArticle[];
  loading: boolean;

  onDelete: (
    article: StockArticle,
  ) => void;

  onEntry: (
    article: StockArticle,
  ) => void;

  onExit: (
    article: StockArticle,
  ) => void;
};

function ArticleTable({
  articles,
  loading,
  onDelete,
  onEntry,
  onExit,
}: ArticleTableProps) {
  const { t, i18n } =
    useTranslation();

  const isArabic =
    i18n.language.startsWith("ar");

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/60">
            <tr>
              <th className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("stock.table.article")}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("stock.table.category")}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("stock.table.quantity")}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("stock.table.minimumQuantity")}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("stock.table.location")}
              </th>

              <th className="px-5 py-4 text-end text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("stock.table.actions")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  {t("stock.table.loading")}
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  {t("stock.table.empty")}
                </td>
              </tr>
            ) : (
              articles.map((article) => {
                const isLowStock =
                  article.quantity <=
                  article.minimumQuantity;

                const designation =
                  isArabic
                    ? article.designationAr
                    : article.designation;

                const category =
                  isArabic
                    ? article.categoryAr
                    : article.category;

                const location =
                  isArabic
                    ? article.locationAr
                    : article.location;

                return (
                  <tr
                    key={article.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-700/40"
                  >
                    {/* ARTICLE */}

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {designation}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {article.reference}
                      </p>
                    </td>

                    {/* CATEGORY */}

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {category}
                    </td>

                    {/* QUANTITY */}

                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={
                            isLowStock
                              ? "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300"
                              : "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300"
                          }
                        >
                          {article.quantity}{" "}
                          {t(
                            `stock.units.${article.unit}`,
                          )}
                        </span>

                        {isLowStock && (
                          <span className="text-xs font-medium text-red-600 dark:text-red-400">
                            {t(
                              "stock.table.lowStock",
                            )}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* MINIMUM */}

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {article.minimumQuantity}{" "}
                      {t(
                        `stock.units.${article.unit}`,
                      )}
                    </td>

                    {/* LOCATION */}

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {location}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1 rtl:justify-start">
                        <PermissionGuard
                          permission={
                            PERMISSIONS.CREATE_STOCK_ENTRY
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              onEntry(article)
                            }
                            title={t(
                              "stock.actions.entry",
                            )}
                            aria-label={t(
                              "stock.actions.entry",
                            )}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-green-50 hover:text-green-600 dark:text-slate-400 dark:hover:bg-green-500/10 dark:hover:text-green-400"
                          >
                            <ArrowDownToLine
                              size={18}
                            />
                          </button>
                        </PermissionGuard>

                        <PermissionGuard
                          permission={
                            PERMISSIONS.CREATE_STOCK_EXIT
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              onExit(article)
                            }
                            title={t(
                              "stock.actions.exit",
                            )}
                            aria-label={t(
                              "stock.actions.exit",
                            )}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
                          >
                            <ArrowUpFromLine
                              size={18}
                            />
                          </button>
                        </PermissionGuard>

                        <Link
                          to={`/stock/articles/${article.id}`}
                          title={t(
                            "stock.actions.details",
                          )}
                          aria-label={t(
                            "stock.actions.details",
                          )}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                        >
                          <Eye size={18} />
                        </Link>

                        <PermissionGuard
                          permission={
                            PERMISSIONS.UPDATE_ARTICLE
                          }
                        >
                          <Link
                            to={`/stock/articles/${article.id}/modifier`}
                            title={t(
                              "stock.actions.edit",
                            )}
                            aria-label={t(
                              "stock.actions.edit",
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
                            PERMISSIONS.DELETE_ARTICLE
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              onDelete(article)
                            }
                            title={t(
                              "stock.actions.delete",
                            )}
                            aria-label={t(
                              "stock.actions.delete",
                            )}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
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
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ArticleTable;