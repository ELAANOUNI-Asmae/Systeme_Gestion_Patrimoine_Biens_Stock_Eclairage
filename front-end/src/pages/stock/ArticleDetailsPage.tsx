import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  Barcode,
  Boxes,
  CalendarDays,
  FileText,
  Hash,
  History,
  MapPin,
  Pencil,
  Tag,
  TriangleAlert,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import PermissionGuard from "../../components/common/PermissionGuard";

import {
  PERMISSIONS,
} from "../../constants/permissions";

import {
  ROUTES,
} from "../../constants/routes";

import {
  stockService,
} from "../../services/stockService";

import type {
  StockArticle,
  StockMovement,
} from "../../types/stock";

function ArticleDetailsPage() {
  const { id } =
    useParams();

  const articleId =
    Number(id);

  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith(
      "ar",
    );

  const [
    article,
    setArticle,
  ] =
    useState<StockArticle | null>(
      null,
    );

  const [
    movements,
    setMovements,
  ] = useState<
    StockMovement[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const loadData =
      async () => {
        try {
          setLoading(true);
          setError("");

          if (
            !Number.isFinite(
              articleId,
            )
          ) {
            throw new Error(
              t(
                "stock.details.invalidId",
              ),
            );
          }

          const [
            articleData,
            movementData,
          ] =
            await Promise.all([
              stockService.getArticleById(
                articleId,
              ),

              stockService.getMovementsByArticleId(
                articleId,
              ),
            ]);

          setArticle(
            articleData,
          );

          setMovements(
            movementData,
          );
        } catch (
          caughtError
        ) {
          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : t(
                  "stock.details.notFound",
                ),
          );
        } finally {
          setLoading(false);
        }
      };

    void loadData();
  }, [
    articleId,
    t,
  ]);

  const totalEntries =
    useMemo(
      () =>
        movements
          .filter(
            (movement) =>
              movement.type ===
              "ENTRY",
          )
          .reduce(
            (
              total,
              movement,
            ) =>
              total +
              movement.quantity,
            0,
          ),
      [movements],
    );

  const totalExits =
    useMemo(
      () =>
        movements
          .filter(
            (movement) =>
              movement.type ===
              "EXIT",
          )
          .reduce(
            (
              total,
              movement,
            ) =>
              total +
              movement.quantity,
            0,
          ),
      [movements],
    );

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        {t(
          "stock.details.loading",
        )}
      </div>
    );
  }

  if (!article) {
    return (
      <section className="space-y-4">
        <Link
          to={ROUTES.STOCK}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
        >
          <ArrowLeft
            size={18}
            className={
              isArabic
                ? "rotate-180"
                : ""
            }
          />

          {t(
            "stock.details.back",
          )}
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error ||
            t(
              "stock.details.notFound",
            )}
        </div>
      </section>
    );
  }

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

  const isLowStock =
    article.quantity <=
    article.minimumQuantity;

  const information = [
    {
      label: t(
        "stock.details.reference",
      ),

      value:
        article.reference,

      icon: Tag,
    },

    {
      label: t(
        "stock.details.serialNumber",
      ),

      value:
        article.serialNumber ||
        "-",

      icon: Hash,
    },

    {
      label: t(
        "stock.details.barcode",
      ),

      value:
        article.barcode ||
        "-",

      icon: Barcode,
    },

    {
      label: t(
        "stock.details.category",
      ),

      value:
        category,

      icon: Boxes,
    },

    {
      label: t(
        "stock.details.quantity",
      ),

      value: `${article.quantity} ${t(
        `stock.units.${article.unit}`,
      )}`,

      icon: Boxes,
    },

    {
      label: t(
        "stock.details.minimumQuantity",
      ),

      value: `${article.minimumQuantity} ${t(
        `stock.units.${article.unit}`,
      )}`,

      icon:
        TriangleAlert,
    },

    {
      label: t(
        "stock.details.location",
      ),

      value:
        location,

      icon:
        MapPin,
    },

    {
      label: t(
        "stock.details.updatedAt",
      ),

      value:
        article.updatedAt,

      icon:
        CalendarDays,
    },
  ];

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link
          to={ROUTES.STOCK}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
        >
          <ArrowLeft
            size={18}
            className={
              isArabic
                ? "rotate-180"
                : ""
            }
          />

          {t(
            "stock.details.back",
          )}
        </Link>

        <PermissionGuard
          permission={
            PERMISSIONS.UPDATE_ARTICLE
          }
        >
          <Link
            to={`/stock/articles/${article.id}/modifier`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            <Pencil
              size={18}
            />

            {t(
              "stock.details.edit",
            )}
          </Link>
        </PermissionGuard>
      </div>

      {/* ARTICLE */}

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-700 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {designation}
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {
                article.reference
              }
            </p>
          </div>

          <span
            className={
              isLowStock
                ? "h-fit rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300"
                : "h-fit rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300"
            }
          >
            {isLowStock
              ? t(
                  "stock.details.lowStock",
                )
              : t(
                  "stock.details.available",
                )}
          </span>
        </div>

        <h2 className="mt-6 font-bold text-slate-900 dark:text-white">
          {t(
            "stock.details.information",
          )}
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {information.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <div
                  key={
                    item.label
                  }
                  className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900"
                >
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <Icon
                      size={16}
                      className="text-orange-600 dark:text-orange-400"
                    />

                    {
                      item.label
                    }
                  </p>

                  <p
                    className="mt-2 font-medium text-slate-800 dark:text-slate-100"
                    dir={
                      item.label ===
                        t("stock.details.barcode") ||
                      item.label ===
                        t("stock.details.serialNumber")
                        ? "ltr"
                        : undefined
                    }
                  >
                    {
                      item.value
                    }
                  </p>
                </div>
              );
            },
          )}
        </div>
      </article>

      {/* ARTICLE DOCUMENTS */}

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <div className="flex items-center gap-3">
          <FileText className="text-orange-600 dark:text-orange-400" />

          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              {t(
                "stock.details.documentsTitle",
              )}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t(
                "stock.details.documentsDescription",
              )}
            </p>
          </div>
        </div>

        {article.documents.length ===
        0 ? (
          <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            {t(
              "stock.details.noDocuments",
            )}
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {article.documents.map(
              (
                document,
              ) => (
                <div
                  key={
                    document.id
                  }
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                          {
                            document.name
                          }
                        </p>

                        <span
                          className={
                            document.category ===
                            "OFFICIAL"
                              ? "rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
                              : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          }
                        >
                          {document.category ===
                          "OFFICIAL"
                            ? t(
                                "stock.details.officialDocument",
                              )
                            : t(
                                "stock.details.attachment",
                              )}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {
                          document.fileName
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {t(
                          "stock.details.documentType",
                        )}{" : "}
                        {t(
                          `stock.documentTypes.${document.type}`,
                        )}
                        {" · "}
                        {t(
                          "stock.details.addedOn",
                        )}{" "}
                        {
                          document.uploadDate
                        }
                      </p>

                      {document.category ===
                        "OFFICIAL" &&
                        document.expirationDate && (
                          <div className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                            {t(
                              "stock.details.expiresOn",
                            )}{" "}
                            {
                              document.expirationDate
                            }

                            {document.reminderDaysBefore !==
                              undefined && (
                              <>
                                {" · "}
                                {t(
                                  "stock.details.notificationBefore",
                                  {
                                    days:
                                      document.reminderDaysBefore,
                                  },
                                )}
                              </>
                            )}
                          </div>
                        )}
                    </div>

                    <FileText className="shrink-0 text-slate-400" />
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </article>

      {/* MOVEMENT STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t(
                  "stock.details.movements",
                )}
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {
                  movements.length
                }
              </p>
            </div>

            <History className="text-slate-400" />
          </div>
        </article>

        <article className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm dark:border-green-900/40 dark:bg-green-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                {t(
                  "stock.details.totalEntries",
                )}
              </p>

              <p className="mt-2 text-3xl font-bold text-green-700 dark:text-green-300">
                {
                  totalEntries
                }
              </p>
            </div>

            <ArrowDownToLine className="text-green-600 dark:text-green-400" />
          </div>
        </article>

        <article className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm dark:border-orange-900/40 dark:bg-orange-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                {t(
                  "stock.details.totalExits",
                )}
              </p>

              <p className="mt-2 text-3xl font-bold text-orange-700 dark:text-orange-300">
                {
                  totalExits
                }
              </p>
            </div>

            <ArrowUpFromLine className="text-orange-600 dark:text-orange-400" />
          </div>
        </article>
      </div>

      {/* ARTICLE HISTORY */}

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5 dark:border-slate-700">
          <History className="text-orange-600 dark:text-orange-400" />

          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              {t(
                "stock.details.history",
              )}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t(
                "stock.details.historyDescription",
              )}
            </p>
          </div>
        </div>

        {movements.length ===
        0 ? (
          <div className="p-10 text-center">
            <History
              size={40}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              {t(
                "stock.details.noMovements",
              )}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {movements.map(
              (
                movement,
              ) => {
                const isEntry =
                  movement.type ===
                  "ENTRY";

                return (
                  <div
                    key={
                      movement.id
                    }
                    className="p-5 transition hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        <div
                          className={
                            isEntry
                              ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400"
                              : "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"
                          }
                        >
                          {isEntry ? (
                            <ArrowDownToLine
                              size={20}
                            />
                          ) : (
                            <ArrowUpFromLine
                              size={20}
                            />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={
                                isEntry
                                  ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300"
                                  : "rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
                              }
                            >
                              {isEntry
                                ? t(
                                    "stock.details.entry",
                                  )
                                : t(
                                    "stock.details.exit",
                                  )}
                            </span>

                            <span className="font-bold text-slate-900 dark:text-white">
                              {
                                movement.quantity
                              }{" "}
                              {t(
                                `stock.units.${article.unit}`,
                              )}
                            </span>
                          </div>

                          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                            <span className="font-semibold">
                              {t(
                                "stock.details.reason",
                              )}
                              :
                            </span>{" "}
                            {
                              movement.reason
                            }
                          </p>

                          {movement.supplierOrBeneficiary && (
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                              <span className="font-semibold">
                                {isEntry
                                  ? t(
                                      "stock.details.supplier",
                                    )
                                  : t(
                                      "stock.details.beneficiary",
                                    )}
                                :
                              </span>{" "}
                              {
                                movement.supplierOrBeneficiary
                              }
                            </p>
                          )}

                          {movement.reference && (
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                              <span className="font-semibold">
                                {t(
                                  "stock.details.movementReference",
                                )}
                                :
                              </span>{" "}
                              {
                                movement.reference
                              }
                            </p>
                          )}

                          {movement.documents.length >
                            0 && (
                            <div className="mt-4 space-y-2">
                              {movement.documents.map(
                                (
                                  document,
                                ) => (
                                  <div
                                    key={
                                      document.id
                                    }
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-600 dark:bg-slate-900"
                                  >
                                    <div className="flex flex-wrap items-center gap-2">
                                      <FileText
                                        size={14}
                                        className="text-orange-600"
                                      />

                                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                                        {
                                          document.name
                                        }
                                      </span>

                                      <span className="text-slate-400">
                                        {
                                          document.fileName
                                        }
                                      </span>
                                    </div>

                                    {document.category ===
                                      "OFFICIAL" &&
                                      document.expirationDate && (
                                        <p className="mt-1 text-orange-600 dark:text-orange-400">
                                          {t(
                              "stock.details.expiresOn",
                            )}{" "}
                                          {
                                            document.expirationDate
                                          }
                                        </p>
                                      )}
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-sm text-slate-500 dark:text-slate-400 sm:text-end">
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          {
                            movement.date
                          }
                        </p>

                        <p className="mt-1">
                          {
                            movement.performedBy
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </article>
    </section>
  );
}

export default ArticleDetailsPage;
