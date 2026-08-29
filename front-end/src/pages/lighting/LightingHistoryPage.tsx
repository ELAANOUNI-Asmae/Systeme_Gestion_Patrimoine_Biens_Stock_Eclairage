import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  Search,
  TriangleAlert,
  UserRound,
  Wrench,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import {
  ROUTES,
} from "../../constants/routes";

import {
  lightingService,
} from "../../services/lightingService";

import type {
  Failure,
  FailureStatus,
  Intervention,
} from "../../types/lighting";

type FailureStatusFilter =
  FailureStatus | "";

function LightingHistoryPage() {
  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith("ar");

  const [
    failures,
    setFailures,
  ] = useState<Failure[]>([]);

  const [
    interventions,
    setInterventions,
  ] = useState<Intervention[]>([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<FailureStatusFilter>(
      "",
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const loadHistory =
      async () => {
        try {
          setLoading(true);
          setError("");

          const [
            failuresData,
            interventionsData,
          ] =
            await Promise.all([
              lightingService.getFailures(),
              lightingService.getInterventions(),
            ]);

          setFailures(
            failuresData,
          );

          setInterventions(
            interventionsData,
          );
        } catch {
          setError(
            t(
              "lighting.history.loadError",
            ),
          );
        } finally {
          setLoading(false);
        }
      };

    void loadHistory();
  }, [t]);

  const filteredFailures =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return failures.filter(
        (failure) => {
          const failureInterventions =
            interventions.filter(
              (intervention) =>
                intervention.failureId ===
                failure.id,
            );

          const matchesSearch =
            !normalizedSearch ||
            failure.lightReference
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            failure.lightDesignation
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            failure.lightDesignationAr
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            failure.description
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            failure.reportedBy
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            failureInterventions.some(
              (intervention) =>
                intervention.technician
                  .toLowerCase()
                  .includes(
                    normalizedSearch,
                  ) ||
                intervention.description
                  .toLowerCase()
                  .includes(
                    normalizedSearch,
                  ),
            );

          const matchesStatus =
            !statusFilter ||
            failure.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      failures,
      interventions,
      search,
      statusFilter,
    ]);

  const getFailureStatusClassName = (
    status: FailureStatus,
  ) => {
    switch (status) {
      case "REPORTED":
        return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";

      case "IN_PROGRESS":
        return "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300";

      case "RESOLVED":
        return "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300";

      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
    }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <div>
        <Link
          to={ROUTES.LIGHTING}
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
            "lighting.history.back",
          )}
        </Link>

        <div className="mt-4">
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            <Wrench className="text-orange-600 dark:text-orange-400" />

            {t(
              "lighting.history.title",
            )}
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {t(
              "lighting.history.description",
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t(
              "lighting.history.totalFailures",
            )}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {failures.length}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t(
              "lighting.history.totalInterventions",
            )}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {
              interventions.length
            }
          </p>
        </article>

        <article className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm dark:border-green-900/40 dark:bg-green-950/20">
          <p className="text-sm text-green-600 dark:text-green-400">
            {t(
              "lighting.history.resolvedFailures",
            )}
          </p>

          <p className="mt-2 text-3xl font-bold text-green-700 dark:text-green-300">
            {
              failures.filter(
                (failure) =>
                  failure.status ===
                  "RESOLVED",
              ).length
            }
          </p>
        </article>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:grid-cols-[1fr_240px]">
        <div className="relative">
          <Search
            size={19}
            className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder={t(
              "lighting.history.search",
            )}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-orange-500/20"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target
                .value as FailureStatusFilter,
            )
          }
          className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-orange-500/20"
        >
          <option value="">
            {t(
              "lighting.history.allStatuses",
            )}
          </option>

          {(
            [
              "REPORTED",
              "IN_PROGRESS",
              "RESOLVED",
            ] as FailureStatus[]
          ).map((status) => (
            <option
              key={status}
              value={status}
            >
              {t(
                `lighting.failureStatuses.${status}`,
              )}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          {t(
            "lighting.history.loading",
          )}
        </div>
      ) : filteredFailures.length ===
        0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <TriangleAlert
            size={38}
            className="mx-auto text-slate-300 dark:text-slate-600"
          />

          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {t(
              "lighting.history.empty",
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFailures.map(
            (failure) => {
              const failureInterventions =
                interventions.filter(
                  (intervention) =>
                    intervention.failureId ===
                    failure.id,
                );

              return (
                <article
                  key={failure.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="p-5">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2
                            className="font-bold text-slate-900 dark:text-white"
                            dir="ltr"
                          >
                            {
                              failure.lightReference
                            }
                          </h2>

                          <span
                            className={[
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              getFailureStatusClassName(
                                failure.status,
                              ),
                            ].join(" ")}
                          >
                            {t(
                              `lighting.failureStatuses.${failure.status}`,
                            )}
                          </span>
                        </div>

                        <p className="mt-2 font-medium text-slate-700 dark:text-slate-200">
                          {isArabic
                            ? failure.lightDesignationAr
                            : failure.lightDesignation}
                        </p>

                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                          {
                            failure.description
                          }
                        </p>

                        {failure.documents.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {failure.documents.map(
                              (document) => (
                                <span
                                  key={document.id}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
                                >
                                  <FileText
                                    size={14}
                                  />

                                  {document.fileName}
                                </span>
                              ),
                            )}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                        <p className="flex items-center gap-2">
                          <CalendarDays
                            size={15}
                          />

                          {
                            failure.reportedAt
                          }
                        </p>

                        <p className="flex items-center gap-2">
                          <UserRound
                            size={15}
                          />

                          {failure.reportedBy ===
                          "PUBLIC"
                            ? t(
                                "lighting.publicFailure.reporter",
                              )
                            : failure.reportedBy}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/50">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <Wrench
                        size={17}
                        className="text-orange-600 dark:text-orange-400"
                      />

                      {t(
                        "lighting.history.associatedInterventions",
                      )}

                      <span className="text-xs font-normal text-slate-400">
                        (
                        {
                          failureInterventions.length
                        }
                        )
                      </span>
                    </h3>

                    {failureInterventions.length ===
                    0 ? (
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        {t(
                          "lighting.history.noIntervention",
                        )}
                      </p>
                    ) : (
                      <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        {failureInterventions.map(
                          (intervention) => (
                            <div
                              key={intervention.id}
                              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="font-semibold text-slate-800 dark:text-slate-100">
                                  {t(
                                    "lighting.interventions.number",
                                    {
                                      id:
                                        intervention.id,
                                    },
                                  )}
                                </p>

                                <span
                                  className={
                                    intervention.completed
                                      ? "inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300"
                                      : "rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
                                  }
                                >
                                  {intervention.completed && (
                                    <CheckCircle2
                                      size={13}
                                    />
                                  )}

                                  {intervention.completed
                                    ? t(
                                        "lighting.interventions.completed",
                                      )
                                    : t(
                                        "lighting.interventions.planned",
                                      )}
                                </span>
                              </div>

                              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                                {
                                  intervention.description
                                }
                              </p>

                              {intervention.documents.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {intervention.documents.map(
                                    (document) => (
                                      <span
                                        key={document.id}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 dark:border-slate-600 dark:text-slate-300"
                                      >
                                        <FileText
                                          size={14}
                                        />

                                        {document.fileName}
                                      </span>
                                    ),
                                  )}
                                </div>
                              )}

                              <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                                <p>
                                  {t(
                                    "lighting.interventions.technician",
                                  )}
                                  {" : "}
                                  {
                                    intervention.technician
                                  }
                                </p>

                                <p>
                                  {t(
                                    "lighting.interventions.date",
                                  )}
                                  {" : "}
                                  {
                                    intervention.interventionDate
                                  }
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}

export default LightingHistoryPage;
