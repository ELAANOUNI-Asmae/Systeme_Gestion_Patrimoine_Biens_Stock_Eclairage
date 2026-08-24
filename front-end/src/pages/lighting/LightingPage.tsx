import {
  Activity,
  History,
  Lightbulb,
  Plus,
  Search,
  TriangleAlert,
  Wrench,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import LightTable from "../../components/lighting/LightTable";
import FailureReportModal from "../../components/lighting/FailureReportModal";
import InterventionModal from "../../components/lighting/InterventionModal";
import LightingMap from "../../components/lighting/LightingMap";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PermissionGuard from "../../components/common/PermissionGuard";
import Toast from "../../components/common/Toast";

import {
  PERMISSIONS,
} from "../../constants/permissions";

import {
  ROUTES,
} from "../../constants/routes";

import {
  lightingService,
} from "../../services/lightingService";

import {
  useAuth,
} from "../../hooks/useAuth";

import type {
  Failure,
  FailureStatus,
  Intervention,
  Light,
  LightStatus,
} from "../../types/lighting";

type StatusFilter =
  LightStatus | "";

const failureStatusClassNames: Record<
  FailureStatus,
  string
> = {
  REPORTED:
    "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",

  IN_PROGRESS:
    "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",

  RESOLVED:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
};

function LightingPage() {
  const { user } = useAuth();

  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith("ar");

  const [
    lights,
    setLights,
  ] = useState<Light[]>([]);

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
  ] = useState<StatusFilter>("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    lightToDelete,
    setLightToDelete,
  ] = useState<Light | null>(null);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    selectedFailureLight,
    setSelectedFailureLight,
  ] = useState<Light | null>(null);

  const [
    failureModalOpen,
    setFailureModalOpen,
  ] = useState(false);

  const [
    failureLoading,
    setFailureLoading,
  ] = useState(false);

  const [
    interventionModalOpen,
    setInterventionModalOpen,
  ] = useState(false);

  const [
    selectedInterventionFailure,
    setSelectedInterventionFailure,
  ] = useState<Failure | null>(null);

  const [
    interventionLoading,
    setInterventionLoading,
  ] = useState(false);

  const [
    completingInterventionId,
    setCompletingInterventionId,
  ] = useState<number | null>(null);

  const [
    toast,
    setToast,
  ] = useState<{
    open: boolean;
    message: string;
    type:
      | "success"
      | "error"
      | "info";
  }>({
    open: false,
    message: "",
    type: "success",
  });

  const showToast = (
    message: string,
    type:
      | "success"
      | "error"
      | "info" = "success",
  ) => {
    setToast({
      open: true,
      message,
      type,
    });
  };

  const loadData =
    async () => {
      try {
        setLoading(true);
        setError("");

        const [
          lightsData,
          failuresData,
          interventionsData,
        ] = await Promise.all([
          lightingService.getLights(),
          lightingService.getFailures(),
          lightingService.getInterventions(),
        ]);

        setLights(lightsData);
        setFailures(failuresData);
        setInterventions(
          interventionsData,
        );
      } catch {
        setError(
          t(
            "lighting.page.loadError",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredLights =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return lights.filter(
        (light) => {
          const matchesSearch =
            !normalizedSearch ||
            light.reference
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            light.designation
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            light.designationAr
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            light.zone
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            light.zoneAr
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            light.address
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            light.addressAr
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesStatus =
            !statusFilter ||
            light.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      lights,
      search,
      statusFilter,
    ]);

  const activeCount =
    lights.filter(
      (light) =>
        light.status ===
        "ACTIVE",
    ).length;

  const damagedCount =
    lights.filter(
      (light) =>
        light.status ===
        "DAMAGED",
    ).length;

  const maintenanceCount =
    lights.filter(
      (light) =>
        light.status ===
        "UNDER_MAINTENANCE",
    ).length;

  const unresolvedFailuresCount =
    failures.filter(
      (failure) =>
        failure.status !==
        "RESOLVED",
    ).length;

  const requestDelete = (
    light: Light,
  ) => {
    setLightToDelete(light);
  };

  const handleDelete =
    async () => {
      if (!lightToDelete) {
        return;
      }

      try {
        setDeleting(true);
        setError("");

        await lightingService.removeLight(
          lightToDelete.id,
        );

        setLightToDelete(null);

        showToast(
          t(
            "lighting.delete.success",
          ),
        );

        await loadData();
      } catch (caughtError) {
        showToast(
          caughtError instanceof Error
            ? caughtError.message
            : t(
                "lighting.delete.error",
              ),
          "error",
        );
      } finally {
        setDeleting(false);
      }
    };

  const openFailureModal = (
    light: Light,
  ) => {
    setSelectedFailureLight(light);
    setFailureModalOpen(true);
  };

  const handleReportFailure =
    async (
      description: string,
    ) => {
      if (
        !selectedFailureLight
      ) {
        return;
      }

      try {
        setFailureLoading(true);
        setError("");

        await lightingService.createFailure(
          {
            lightId:
              selectedFailureLight.id,

            description,

            reportedBy:
              user
                ? `${user.firstName} ${user.lastName}`
                : t(
                    "lighting.page.defaultUser",
                  ),
          },
        );

        setFailureModalOpen(false);
        setSelectedFailureLight(null);

        showToast(
          t(
            "lighting.failure.success",
          ),
        );

        await loadData();
      } catch (caughtError) {
        showToast(
          caughtError instanceof Error
            ? caughtError.message
            : t(
                "lighting.failure.error",
              ),
          "error",
        );
      } finally {
        setFailureLoading(false);
      }
    };

  const openInterventionModal = (
    failure: Failure,
  ) => {
    setSelectedInterventionFailure(
      failure,
    );

    setInterventionModalOpen(true);
  };

  const handleCreateIntervention =
    async (data: {
      technician: string;
      interventionDate: string;
      description: string;
    }) => {
      if (
        !selectedInterventionFailure
      ) {
        return;
      }

      try {
        setInterventionLoading(true);
        setError("");

        await lightingService.createIntervention(
          {
            failureId:
              selectedInterventionFailure.id,

            technician:
              data.technician,

            interventionDate:
              data.interventionDate,

            description:
              data.description,
          },
        );

        setInterventionModalOpen(false);
        setSelectedInterventionFailure(
          null,
        );

        showToast(
          t(
            "lighting.interventions.createSuccess",
          ),
        );

        await loadData();
      } catch (caughtError) {
        showToast(
          caughtError instanceof Error
            ? caughtError.message
            : t(
                "lighting.interventions.createError",
              ),
          "error",
        );
      } finally {
        setInterventionLoading(false);
      }
    };

  const handleCompleteIntervention =
    async (
      interventionId: number,
    ) => {
      try {
        setCompletingInterventionId(
          interventionId,
        );

        setError("");

        await lightingService.completeIntervention(
          interventionId,
        );

        showToast(
          t(
            "lighting.interventions.completeSuccess",
          ),
        );

        await loadData();
      } catch (caughtError) {
        showToast(
          caughtError instanceof Error
            ? caughtError.message
            : t(
                "lighting.interventions.completeError",
              ),
          "error",
        );
      } finally {
        setCompletingInterventionId(null);
      }
    };

  return (
    <section className="space-y-6">
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() =>
          setToast(
            (previous) => ({
              ...previous,
              open: false,
            }),
          )
        }
      />

      <FailureReportModal
        open={failureModalOpen}
        light={selectedFailureLight}
        loading={failureLoading}
        onClose={() => {
          if (!failureLoading) {
            setFailureModalOpen(false);
            setSelectedFailureLight(null);
          }
        }}
        onSubmit={handleReportFailure}
      />

      <InterventionModal
        open={interventionModalOpen}
        failure={
          selectedInterventionFailure
        }
        loading={interventionLoading}
        onClose={() => {
          if (!interventionLoading) {
            setInterventionModalOpen(false);
            setSelectedInterventionFailure(
              null,
            );
          }
        }}
        onSubmit={
          handleCreateIntervention
        }
      />

      <ConfirmDialog
        open={lightToDelete !== null}
        title={t(
          "lighting.delete.title",
        )}
        message={
          lightToDelete
            ? t(
                "lighting.delete.message",
                {
                  name: isArabic
                    ? lightToDelete.designationAr
                    : lightToDelete.designation,
                },
              )
            : ""
        }
        confirmLabel={t(
          "lighting.actions.delete",
        )}
        loading={deleting}
        onConfirm={() => {
          void handleDelete();
        }}
        onCancel={() =>
          setLightToDelete(null)
        }
      />

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            <Lightbulb className="text-orange-600 dark:text-orange-400" />

            {t(
              "lighting.page.title",
            )}
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {t(
              "lighting.page.description",
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={ROUTES.LIGHTING_HISTORY}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
          >
            <History size={19} />

            {t(
              "lighting.page.history",
            )}
          </Link>

          <PermissionGuard
            permission={
              PERMISSIONS.CREATE_LIGHT
            }
          >
            <Link
              to={ROUTES.ADD_LIGHT}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              <Plus size={19} />

              {t(
                "lighting.page.add",
              )}
            </Link>
          </PermissionGuard>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t(
                  "lighting.stats.active",
                )}
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {activeCount}
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400">
              <Activity size={24} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm dark:border-red-900/40 dark:bg-red-950/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {t(
                  "lighting.stats.damaged",
                )}
              </p>

              <p className="mt-2 text-3xl font-bold text-red-700 dark:text-red-300">
                {damagedCount}
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <TriangleAlert
                size={24}
              />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm dark:border-orange-900/40 dark:bg-orange-950/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {t(
                  "lighting.stats.maintenance",
                )}
              </p>

              <p className="mt-2 text-3xl font-bold text-orange-700 dark:text-orange-300">
                {maintenanceCount}
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
              <Wrench size={24} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t(
                  "lighting.stats.unresolved",
                )}
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {
                  unresolvedFailuresCount
                }
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              <TriangleAlert
                size={24}
              />
            </div>
          </div>
        </article>
      </div>

      {/* FILTERS */}

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
              "lighting.filters.search",
            )}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-orange-500/20"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target
                .value as StatusFilter,
            )
          }
          className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-orange-500/20"
        >
          <option value="">
            {t(
              "lighting.filters.allStatuses",
            )}
          </option>

          {(
            [
              "ACTIVE",
              "INACTIVE",
              "DAMAGED",
              "UNDER_MAINTENANCE",
            ] as LightStatus[]
          ).map((status) => (
            <option
              key={status}
              value={status}
            >
              {t(
                `lighting.statuses.${status}`,
              )}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t(
          "lighting.page.count",
          {
            count:
              filteredLights.length,
          },
        )}
      </p>

      {/* TABLE */}

      <LightTable
        lights={filteredLights}
        loading={loading}
        onDelete={requestDelete}
        onReportFailure={
          openFailureModal
        }
      />

      {/* MAP */}

      <LightingMap
        lights={filteredLights}
      />

      {/* FAILURES + INTERVENTIONS */}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* FAILURES */}

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t(
                "lighting.failures.title",
              )}
            </h2>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                "lighting.failures.count",
                {
                  count:
                    failures.length,
                },
              )}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {failures.length ===
            0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                {t(
                  "lighting.failures.empty",
                )}
              </p>
            ) : (
              failures.map(
                (failure) => (
                  <div
                    key={failure.id}
                    className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row">
                      <div>
                        <p
                          className="font-semibold text-slate-800 dark:text-slate-100"
                          dir="ltr"
                        >
                          {
                            failure.lightReference
                          }
                        </p>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {
                            failure.description
                          }
                        </p>

                        <p className="mt-2 text-xs text-slate-400">
                          {t(
                            "lighting.failures.reportedInfo",
                            {
                              date:
                                failure.reportedAt,
                              user:
                                failure.reportedBy,
                            },
                          )}
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-2 sm:items-end rtl:sm:items-start">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            failureStatusClassNames[
                              failure.status
                            ],
                          ].join(" ")}
                        >
                          {t(
                            `lighting.failureStatuses.${failure.status}`,
                          )}
                        </span>

                        {failure.status ===
                          "REPORTED" && (
                          <PermissionGuard
                            permission={
                              PERMISSIONS.CREATE_INTERVENTION
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                openInterventionModal(
                                  failure,
                                )
                              }
                              className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20"
                            >
                              {t(
                                "lighting.failures.startTreatment",
                              )}
                            </button>
                          </PermissionGuard>
                        )}
                      </div>
                    </div>
                  </div>
                ),
              )
            )}
          </div>
        </article>

        {/* INTERVENTIONS */}

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t(
                "lighting.interventions.title",
              )}
            </h2>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                "lighting.interventions.count",
                {
                  count:
                    interventions.length,
                },
              )}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {interventions.length ===
            0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                {t(
                  "lighting.interventions.empty",
                )}
              </p>
            ) : (
              interventions.map(
                (
                  intervention,
                ) => (
                  <div
                    key={
                      intervention.id
                    }
                    className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900"
                  >
                    <div className="flex items-start gap-3">
                      <Wrench className="mt-0.5 shrink-0 text-orange-600 dark:text-orange-400" />

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                          {t(
                            "lighting.interventions.number",
                            {
                              id:
                                intervention.id,
                            },
                          )}
                        </p>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {
                            intervention.description
                          }
                        </p>

                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {t(
                            "lighting.interventions.technician",
                          )}
                          {" : "}
                          {
                            intervention.technician
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {t(
                            "lighting.interventions.date",
                          )}
                          {" : "}
                          {
                            intervention.interventionDate
                          }
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className={
                              intervention.completed
                                ? "inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300"
                                : "inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
                            }
                          >
                            {intervention.completed
                              ? t(
                                  "lighting.interventions.completed",
                                )
                              : t(
                                  "lighting.interventions.planned",
                                )}
                          </span>

                          {!intervention.completed && (
                            <PermissionGuard
                              permission={
                                PERMISSIONS.UPDATE_INTERVENTION
                              }
                            >
                              <button
                                type="button"
                                disabled={
                                  completingInterventionId ===
                                  intervention.id
                                }
                                onClick={() => {
                                  void handleCompleteIntervention(
                                    intervention.id,
                                  );
                                }}
                                className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300 dark:hover:bg-green-500/20"
                              >
                                {completingInterventionId ===
                                intervention.id
                                  ? "..."
                                  : t(
                                      "lighting.interventions.complete",
                                    )}
                              </button>
                            </PermissionGuard>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

export default LightingPage;