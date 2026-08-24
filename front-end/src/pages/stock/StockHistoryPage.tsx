import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  CalendarDays,
  FileText,
  History,
  Search,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { ROUTES } from "../../constants/routes";

import { stockService } from "../../services/stockService";

import type {
  StockMovement,
  StockMovementType,
} from "../../types/stock";

type MovementFilter =
  | "ALL"
  | StockMovementType;

function StockHistoryPage() {
  const { t, i18n } =
    useTranslation();

  const isArabic =
    i18n.language.startsWith("ar");

  const [
    movements,
    setMovements,
  ] = useState<StockMovement[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState<MovementFilter>(
      "ALL",
    );

  const [
    dateFilter,
    setDateFilter,
  ] = useState("");

  useEffect(() => {
    const loadMovements =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await stockService.getMovements();

          setMovements(data);
        } catch {
          setError(
            t(
              "stock.historyPage.loadError",
            ),
          );
        } finally {
          setLoading(false);
        }
      };

    void loadMovements();
  }, [t]);

  const filteredMovements =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return movements.filter(
        (movement) => {
          const designation =
            isArabic
              ? movement.articleDesignationAr
              : movement.articleDesignation;

          const matchesSearch =
            !normalizedSearch ||
            designation
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            movement.articleDesignation
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            movement.articleDesignationAr
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            movement.reason
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            movement.performedBy
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            (
              movement.reference ??
              ""
            )
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            (
              movement.supplierOrBeneficiary ??
              ""
            )
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesType =
            typeFilter ===
              "ALL" ||
            movement.type ===
              typeFilter;

          const matchesDate =
            !dateFilter ||
            movement.date ===
              dateFilter;

          return (
            matchesSearch &&
            matchesType &&
            matchesDate
          );
        },
      );
    }, [
      movements,
      search,
      typeFilter,
      dateFilter,
      isArabic,
    ]);

  const entryCount =
    movements.filter(
      (movement) =>
        movement.type ===
        "ENTRY",
    ).length;

  const exitCount =
    movements.filter(
      (movement) =>
        movement.type ===
        "EXIT",
    ).length;

  return (
    <section className="space-y-6">
      {/* HEADER */}

      <div>
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
            "stock.historyPage.back",
          )}
        </Link>

        <div className="mt-4">
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            <History className="text-orange-600 dark:text-orange-400" />

            {t(
              "stock.historyPage.title",
            )}
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {t(
              "stock.historyPage.description",
            )}
          </p>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {t(
              "stock.historyPage.total",
            )}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {movements.length}
          </p>
        </article>

        <article className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm dark:border-green-900/40 dark:bg-green-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                {t(
                  "stock.historyPage.entries",
                )}
              </p>

              <p className="mt-2 text-3xl font-bold text-green-700 dark:text-green-300">
                {entryCount}
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
                  "stock.historyPage.exits",
                )}
              </p>

              <p className="mt-2 text-3xl font-bold text-orange-700 dark:text-orange-300">
                {exitCount}
              </p>
            </div>

            <ArrowUpFromLine className="text-orange-600 dark:text-orange-400" />
          </div>
        </article>
      </div>

      {/* FILTERS */}

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:grid-cols-[1fr_220px_220px]">
        <div className="relative">
          <Search
            size={19}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-3"
          />

          <input
            type="search"
            value={search}
            onChange={(
              event,
            ) =>
              setSearch(
                event.target
                  .value,
              )
            }
            placeholder={t(
              "stock.historyPage.searchPlaceholder",
            )}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-orange-500 dark:focus:ring-orange-500/10 rtl:pl-4 rtl:pr-10"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(
            event,
          ) =>
            setTypeFilter(
              event.target
                .value as MovementFilter,
            )
          }
          className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="ALL">
            {t(
              "stock.historyPage.allTypes",
            )}
          </option>

          <option value="ENTRY">
            {t(
              "stock.historyPage.entry",
            )}
          </option>

          <option value="EXIT">
            {t(
              "stock.historyPage.exit",
            )}
          </option>
        </select>

        <div className="relative">
          <CalendarDays
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-3"
          />

          <input
            type="date"
            value={dateFilter}
            onChange={(
              event,
            ) =>
              setDateFilter(
                event.target
                  .value,
              )
            }
            className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rtl:pl-3 rtl:pr-10"
          />
        </div>
      </div>

      {/* COUNT */}

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t(
          "stock.historyPage.results",
          {
            count:
              filteredMovements.length,
          },
        )}
      </p>

      {/* HISTORY */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            {t(
              "stock.historyPage.loading",
            )}
          </div>
        ) : filteredMovements.length ===
          0 ? (
          <div className="p-12 text-center">
            <History
              size={42}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <p className="mt-4 font-semibold text-slate-700 dark:text-slate-200">
              {t(
                "stock.historyPage.empty",
              )}
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t(
                "stock.historyPage.emptyDescription",
              )}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredMovements.map(
              (movement) => {
                const isEntry =
                  movement.type ===
                  "ENTRY";

                const designation =
                  isArabic
                    ? movement.articleDesignationAr
                    : movement.articleDesignation;

                return (
                  <article
                    key={
                      movement.id
                    }
                    className="p-5 transition hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div
                          className={
                            isEntry
                              ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400"
                              : "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"
                          }
                        >
                          {isEntry ? (
                            <ArrowDownToLine
                              size={
                                21
                              }
                            />
                          ) : (
                            <ArrowUpFromLine
                              size={
                                21
                              }
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-semibold text-slate-900 dark:text-white">
                              {
                                designation
                              }
                            </h2>

                            <span
                              className={
                                isEntry
                                  ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300"
                                  : "rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
                              }
                            >
                              {isEntry
                                ? t(
                                    "stock.historyPage.entry",
                                  )
                                : t(
                                    "stock.historyPage.exit",
                                  )}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            <span className="font-semibold">
                              {t(
                                "stock.historyPage.quantity",
                              )}
                              :
                            </span>{" "}
                            {
                              movement.quantity
                            }
                          </p>

                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            <span className="font-semibold">
                              {t(
                                "stock.historyPage.reason",
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
                                      "stock.historyPage.supplier",
                                    )
                                  : t(
                                      "stock.historyPage.beneficiary",
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
                                  "stock.historyPage.reference",
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
                            <div className="mt-3 flex flex-wrap gap-2">
                              {movement.documents.map(
                                (
                                  document,
                                ) => (
                                  <span
                                    key={
                                      document.id
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                  >
                                    <FileText
                                      size={
                                        14
                                      }
                                    />

                                    {
                                      document.fileName
                                    }
                                  </span>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-sm text-slate-500 dark:text-slate-400 lg:text-end">
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
                  </article>
                );
              },
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default StockHistoryPage;