import {
  BarChart3,
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Package,
  Search,
  Users,
  Warehouse,
  Zap,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useTranslation,
} from "react-i18next";

import {
  reportService,
} from "../../services/reportService";

import type {
  ReportMetric,
  ReportSection,
  ReportType,
} from "../../types/report";

type ReportOption = {
  type: ReportType;
  icon: typeof Users;
};

const reportOptions: ReportOption[] = [
  {
    type: "USERS",
    icon: Users,
  },
  {
    type: "ASSETS",
    icon: Package,
  },
  {
    type: "STOCK",
    icon: Warehouse,
  },
  {
    type: "LIGHTING",
    icon: Zap,
  },
];

function ReportsPage() {
  const {
    t,
    i18n,
  } = useTranslation();

  const [
    reportType,
    setReportType,
  ] =
    useState<ReportType>(
      "ASSETS",
    );

  const [
    startDate,
    setStartDate,
  ] =
    useState(
      "2026-08-01",
    );

  const [
    endDate,
    setEndDate,
  ] =
    useState(
      "2026-08-31",
    );

  const [
    report,
    setReport,
  ] =
    useState<
      Awaited<
        ReturnType<
          typeof reportService.generate
        >
      > | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    exportingPdf,
    setExportingPdf,
  ] =
    useState(false);

  const [
    exportingExcel,
    setExportingExcel,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const selectedOption =
    reportOptions.find(
      (option) =>
        option.type ===
        reportType,
    );

  const SelectedIcon =
    selectedOption?.icon ??
    BarChart3;

  const language =
    i18n.language.startsWith(
      "ar",
    )
      ? "ar"
      : "fr";

  /* =====================================================
     LABELS
  ===================================================== */

  const getMetricLabel = (
    metric: ReportMetric,
  ) => {
    return t(
      metric.labelKey,
      {
        defaultValue:
          metric.labelKey,
      },
    );
  };

  const getSectionLabel = (
    section: ReportSection,
  ) => {
    return t(
      section.titleKey,
      {
        defaultValue:
          section.titleKey,
      },
    );
  };

  const getColumnLabel = (
    labelKey: string,
  ) => {
    return t(
      labelKey,
      {
        defaultValue:
          labelKey,
      },
    );
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredSections =
    useMemo(() => {
      if (!report) {
        return [];
      }

      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      if (
        !normalizedSearch
      ) {
        return report.sections;
      }

      return report.sections.map(
        (section) => ({
          ...section,

          rows:
            section.rows.filter(
              (row) =>
                Object.values(
                  row.values,
                ).some(
                  (value) =>
                    String(
                      value,
                    )
                      .toLowerCase()
                      .includes(
                        normalizedSearch,
                      ),
                ),
            ),
        }),
      );
    }, [
      report,
      search,
    ]);

  const filteredRowsCount =
    useMemo(() => {
      return filteredSections.reduce(
        (
          total,
          section,
        ) =>
          total +
          section.rows.length,
        0,
      );
    }, [
      filteredSections,
    ]);

  /* =====================================================
     ERRORS
  ===================================================== */

  const getErrorMessage = (
    caughtError: unknown,
  ) => {
    if (
      caughtError instanceof
      Error
    ) {
      if (
        caughtError.message ===
        "REPORT_DATES_REQUIRED"
      ) {
        return t(
          "reports.errors.datesRequired",
        );
      }

      if (
        caughtError.message ===
        "REPORT_INVALID_PERIOD"
      ) {
        return t(
          "reports.errors.invalidPeriod",
        );
      }
    }

    return t(
      "reports.errors.generate",
    );
  };

  /* =====================================================
     GENERATE
  ===================================================== */

  const handleGenerate =
    async () => {
      if (
        !startDate ||
        !endDate
      ) {
        setError(
          t(
            "reports.errors.datesRequired",
          ),
        );

        return;
      }

      if (
        startDate >
        endDate
      ) {
        setError(
          t(
            "reports.errors.invalidPeriod",
          ),
        );

        return;
      }

      try {
        setLoading(true);
        setError("");
        setSearch("");

        const data =
          await reportService.generate(
            {
              type:
                reportType,
              startDate,
              endDate,
            },
          );

        setReport(
          data,
        );
      } catch (
        caughtError
      ) {
        setError(
          getErrorMessage(
            caughtError,
          ),
        );
      } finally {
        setLoading(
          false,
        );
      }
    };

  /* =====================================================
     PDF
  ===================================================== */

  const handlePdfExport =
    async () => {
      if (!report) {
        return;
      }

      try {
        setExportingPdf(
          true,
        );

        await reportService.exportPdf(
          report,
          language,
        );
      } catch (
        caughtError
      ) {
        console.error(
          caughtError,
        );

        setError(
          t(
            "reports.errors.generate",
          ),
        );
      } finally {
        setExportingPdf(
          false,
        );
      }
    };

  /* =====================================================
     EXCEL
  ===================================================== */

  const handleExcelExport =
    async () => {
      if (!report) {
        return;
      }

      try {
        setExportingExcel(
          true,
        );

        await reportService.exportExcel(
          report,
          language,
        );
      } catch (
        caughtError
      ) {
        console.error(
          caughtError,
        );

        setError(
          t(
            "reports.errors.generate",
          ),
        );
      } finally {
        setExportingExcel(
          false,
        );
      }
    };

  return (
    <section className="space-y-6">
      {/* ================= HEADER ================= */}

      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          <BarChart3 className="text-orange-600 dark:text-orange-400" />

          {t(
            "reports.page.title",
          )}
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {t(
            "reports.page.description",
          )}
        </p>
      </div>

      {/* ================= REPORT TYPES ================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reportOptions.map(
          (option) => {
            const Icon =
              option.icon;

            const selected =
              reportType ===
              option.type;

            return (
              <button
                key={
                  option.type
                }
                type="button"
                onClick={() => {
                  setReportType(
                    option.type,
                  );

                  setReport(
                    null,
                  );

                  setSearch(
                    "",
                  );

                  setError(
                    "",
                  );
                }}
                className={[
                  "rounded-2xl border p-5 text-start shadow-sm transition",
                  selected
                    ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100 dark:border-orange-500 dark:bg-orange-500/10 dark:ring-orange-500/10"
                    : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-orange-500/50 dark:hover:bg-orange-500/5",
                ].join(
                  " ",
                )}
              >
                <div
                  className={[
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    selected
                      ? "bg-orange-600 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
                  ].join(
                    " ",
                  )}
                >
                  <Icon
                    size={
                      22
                    }
                  />
                </div>

                <p className="mt-4 font-semibold text-slate-900 dark:text-white">
                  {t(
                    `reports.types.${option.type}.title`,
                  )}
                </p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t(
                    `reports.types.${option.type}.description`,
                  )}
                </p>
              </button>
            );
          },
        )}
      </div>

      {/* ================= GENERATOR ================= */}

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
            <SelectedIcon
              size={
                22
              }
            />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              {t(
                "reports.generator.title",
              )}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t(
                `reports.types.${reportType}.title`,
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {/* START DATE */}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t(
                "reports.generator.startDate",
              )}
            </span>

            <div className="relative">
              <CalendarDays
                size={
                  18
                }
                className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                value={
                  startDate
                }
                onChange={(
                  event,
                ) => {
                  setStartDate(
                    event
                      .target
                      .value,
                  );

                  setReport(
                    null,
                  );

                  setError(
                    "",
                  );
                }}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-orange-500/20"
              />
            </div>
          </label>

          {/* END DATE */}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t(
                "reports.generator.endDate",
              )}
            </span>

            <div className="relative">
              <CalendarDays
                size={
                  18
                }
                className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                value={
                  endDate
                }
                onChange={(
                  event,
                ) => {
                  setEndDate(
                    event
                      .target
                      .value,
                  );

                  setReport(
                    null,
                  );

                  setError(
                    "",
                  );
                }}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-orange-500/20"
              />
            </div>
          </label>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={
            loading
          }
          onClick={() => {
            void handleGenerate();
          }}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2
              size={
                18
              }
              className="animate-spin"
            />
          ) : (
            <FileText
              size={
                18
              }
            />
          )}

          {loading
            ? t(
                "reports.generator.generating",
              )
            : t(
                "reports.generator.generate",
              )}
        </button>
      </article>

      {/* ================= REPORT ================= */}

      {report && (
        <>
          {/* STATISTICS */}

          <div
            className={[
              "grid gap-4",
              report.statistics
                .length >=
              4
                ? "sm:grid-cols-2 xl:grid-cols-4"
                : "sm:grid-cols-2 xl:grid-cols-3",
            ].join(
              " ",
            )}
          >
            {report.statistics.map(
              (
                metric,
                index,
              ) => (
                <article
                  key={
                    metric.id
                  }
                  className={[
                    "rounded-2xl border p-5 shadow-sm",
                    index ===
                    0
                      ? "border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/20"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800",
                  ].join(
                    " ",
                  )}
                >
                  <p
                    className={[
                      "text-sm",
                      index ===
                      0
                        ? "text-orange-700 dark:text-orange-400"
                        : "text-slate-500 dark:text-slate-400",
                    ].join(
                      " ",
                    )}
                  >
                    {getMetricLabel(
                      metric,
                    )}
                  </p>

                  <div className="mt-2 flex items-baseline gap-2">
                    <p
                      className={[
                        "text-3xl font-bold",
                        index ===
                        0
                          ? "text-orange-700 dark:text-orange-300"
                          : "text-slate-900 dark:text-white",
                      ].join(
                        " ",
                      )}
                    >
                      {
                        metric.value
                      }
                    </p>

                    {metric.unit && (
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {
                          metric.unit
                        }
                      </span>
                    )}
                  </div>
                </article>
              ),
            )}
          </div>

          {/* PREVIEW CONTAINER */}

          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            {/* PREVIEW HEADER */}

            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-700 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  {t(
                    "reports.preview.title",
                  )}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t(
                    "reports.preview.period",
                    {
                      start:
                        report.startDate,
                      end:
                        report.endDate,
                    },
                  )}
                </p>
              </div>

              {/* EXPORT */}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={
                    exportingPdf
                  }
                  onClick={() => {
                    void handlePdfExport();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                >
                  {exportingPdf ? (
                    <Loader2
                      size={
                        17
                      }
                      className="animate-spin"
                    />
                  ) : (
                    <Download
                      size={
                        17
                      }
                    />
                  )}

                  {t(
                    "reports.actions.pdf",
                  )}
                </button>

                <button
                  type="button"
                  disabled={
                    exportingExcel
                  }
                  onClick={() => {
                    void handleExcelExport();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300 dark:hover:bg-green-500/20"
                >
                  {exportingExcel ? (
                    <Loader2
                      size={
                        17
                      }
                      className="animate-spin"
                    />
                  ) : (
                    <FileSpreadsheet
                      size={
                        17
                      }
                    />
                  )}

                  {t(
                    "reports.actions.excel",
                  )}
                </button>
              </div>
            </div>

            {/* SEARCH */}

            <div className="border-b border-slate-200 p-4 dark:border-slate-700">
              <div className="relative max-w-xl">
                <Search
                  size={
                    18
                  }
                  className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={
                    search
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearch(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder={t(
                    "reports.preview.search",
                  )}
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-orange-500/20"
                />
              </div>
            </div>

            {/* ================= SECTIONS ================= */}

            <div className="space-y-8 p-5 sm:p-6">
              {filteredSections.map(
                (
                  section,
                  sectionIndex,
                ) => (
                  <section
                    key={
                      section.id
                    }
                  >
                    {/* SECTION TITLE */}

                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-6 w-1 rounded-full bg-orange-500" />

                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          {getSectionLabel(
                            section,
                          )}
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {
                            section
                              .rows
                              .length
                          }{" "}
                          {t(
                            "reports.preview.results",
                            {
                              count:
                                section
                                  .rows
                                  .length,
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    {/* TABLE */}

                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-slate-900">
                            <tr>
                              {section.columns.map(
                                (
                                  column,
                                ) => (
                                  <th
                                    key={
                                      column.key
                                    }
                                    className="whitespace-nowrap px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-white"
                                  >
                                    {getColumnLabel(
                                      column.labelKey,
                                    )}
                                  </th>
                                ),
                              )}
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {section
                              .rows
                              .length ===
                            0 ? (
                              <tr>
                                <td
                                  colSpan={
                                    section
                                      .columns
                                      .length
                                  }
                                  className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                                >
                                  {t(
                                    "reports.preview.empty",
                                  )}
                                </td>
                              </tr>
                            ) : (
                              section.rows.map(
                                (
                                  row,
                                ) => (
                                  <tr
                                    key={
                                      `${sectionIndex}-${row.id}`
                                    }
                                    className="transition hover:bg-slate-50 dark:hover:bg-slate-700/40"
                                  >
                                    {section.columns.map(
                                      (
                                        column,
                                      ) => {
                                        const value =
                                          row
                                            .values[
                                            column
                                              .key
                                          ];

                                        return (
                                          <td
                                            key={
                                              column.key
                                            }
                                            className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-700 dark:text-slate-200"
                                          >
                                            {value ??
                                              "-"}
                                          </td>
                                        );
                                      },
                                    )}
                                  </tr>
                                ),
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>
                ),
              )}

              {/* NO RESULTS AFTER SEARCH */}

              {filteredRowsCount ===
                0 && (
                <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
                  {t(
                    "reports.preview.empty",
                  )}
                </div>
              )}
            </div>

            {/* TOTAL */}

            <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              {t(
                "reports.preview.results",
                {
                  count:
                    filteredRowsCount,
                },
              )}
            </div>
          </article>
        </>
      )}
    </section>
  );
}

export default ReportsPage;