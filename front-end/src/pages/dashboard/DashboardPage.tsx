import {
  Activity,
  AlertTriangle,
  Building2,
  Boxes,
  Lightbulb,
  PackageOpen,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useTranslation } from "react-i18next";

import { useAuth } from "../../hooks/useAuth";
import { PERMISSIONS } from "../../constants/permissions";

import { initialMockBiens } from "../../mock/biens";

import {
  initialMockArticles,
  initialMockMovements,
} from "../../mock/stock";

import {
  initialMockFailures,
  initialMockLights,
} from "../../mock/lighting";

function DashboardPage() {
  const {
    user,
    hasPermission,
  } = useAuth();

  const { t } = useTranslation();

  const lowStockArticles =
    initialMockArticles.filter(
      (article) =>
        article.quantity <=
        article.minimumQuantity,
    );

  const activeLights =
    initialMockLights.filter(
      (light) =>
        light.status === "ACTIVE",
    );

  const damagedLights =
    initialMockLights.filter(
      (light) =>
        light.status === "DAMAGED",
    );

  const maintenanceLights =
    initialMockLights.filter(
      (light) =>
        light.status ===
        "UNDER_MAINTENANCE",
    );

  const maintenanceBiens =
    initialMockBiens.filter(
      (bien) =>
        bien.assetStatus ===
        "UNDER_MAINTENANCE",
    );

  const unresolvedFailures =
    initialMockFailures.filter(
      (failure) =>
        failure.status !==
        "RESOLVED",
    );

  const statistics = [
    {
      id: 1,
      label: t(
        "dashboard.statistics.users",
      ),
      value: 2,
      description: t(
        "dashboard.statistics.usersDescription",
      ),
      icon: Users,
      permission:
        PERMISSIONS.GET_ALL_USERS,
    },

    {
      id: 2,
      label: t(
        "dashboard.statistics.assets",
      ),
      value:
        initialMockBiens.length,
      description: t(
        "dashboard.statistics.assetsDescription",
      ),
      icon: Building2,
      permission:
        PERMISSIONS.GET_ALL_ASSETS,
    },

    {
      id: 3,
      label: t(
        "dashboard.statistics.articles",
      ),
      value:
        initialMockArticles.length,
      description: t(
        "dashboard.statistics.articlesDescription",
      ),
      icon: Boxes,
      permission:
        PERMISSIONS.GET_ALL_ARTICLES,
    },

    {
      id: 4,
      label: t(
        "dashboard.statistics.lighting",
      ),
      value:
        initialMockLights.length,
      description: t(
        "dashboard.statistics.lightingDescription",
      ),
      icon: Lightbulb,
      permission:
        PERMISSIONS.GET_ALL_LIGHTS,
    },
  ];

  const visibleStatistics =
    statistics.filter(
      (statistic) =>
        hasPermission(
          statistic.permission,
        ),
    );

  const assetStatusData = [
    {
      name: t(
        "dashboard.assets.inUse",
      ),
      value:
        initialMockBiens.filter(
          (bien) =>
            bien.assetStatus ===
            "IN_USE",
        ).length,
    },

    {
      name: t(
        "dashboard.assets.available",
      ),
      value:
        initialMockBiens.filter(
          (bien) =>
            bien.assetStatus ===
            "AVAILABLE",
        ).length,
    },

    {
      name: t(
        "dashboard.assets.maintenance",
      ),
      value:
        maintenanceBiens.length,
    },

    {
      name: t(
        "dashboard.assets.others",
      ),
      value:
        initialMockBiens.filter(
          (bien) =>
            ![
              "IN_USE",
              "AVAILABLE",
              "UNDER_MAINTENANCE",
            ].includes(
              bien.assetStatus,
            ),
        ).length,
    },
  ];

  const lightingStatusData = [
    {
      name: t(
        "dashboard.lighting.active",
      ),
      value:
        activeLights.length,
    },

    {
      name: t(
        "dashboard.lighting.damaged",
      ),
      value:
        damagedLights.length,
    },

    {
      name: t(
        "dashboard.lighting.maintenance",
      ),
      value:
        maintenanceLights.length,
    },
  ];

  const movementChartData =
    initialMockMovements.map(
      (movement) => ({
        date:
          movement.date.slice(5),

        entries:
          movement.type ===
          "ENTRY"
            ? movement.quantity
            : 0,

        exits:
          movement.type ===
          "EXIT"
            ? movement.quantity
            : 0,
      }),
    );

  const alerts = [
    ...lowStockArticles.map(
      (article) => ({
        id: `stock-${article.id}`,
        title: t(
          "dashboard.alerts.lowStock",
        ),
        message:
          `${article.designation} : ${article.quantity} ${article.unit}`,
        type: "stock",
      }),
    ),

    ...unresolvedFailures.map(
      (failure) => ({
        id: `failure-${failure.id}`,
        title: t(
          "dashboard.alerts.lightingFailure",
        ),
        message:
          `${failure.lightReference} — ${failure.description}`,
        type: "lighting",
      }),
    ),

    ...maintenanceBiens.map(
      (bien) => ({
        id: `asset-${bien.id}`,
        title: t(
          "dashboard.alerts.assetMaintenance",
        ),
        message:
          bien.designation,
        type: "asset",
      }),
    ),
  ];

  return (
    <section className="space-y-6">
      {/* ================= WELCOME ================= */}

      <div className="moroccan-pattern relative overflow-hidden rounded-3xl border border-orange-100 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800 sm:p-7">
        <div className="relative z-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">
                SGPBSE
              </p>

              <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                {t(
                  "dashboard.welcome",
                  {
                    name:
                      user?.firstName ??
                      "",
                  },
                )}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                {t(
                  "dashboard.description",
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-white/80 px-5 py-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t(
                  "dashboard.connectedAs",
                )}
              </p>

              <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">
                {user?.role.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STATISTICS ================= */}

      {visibleStatistics.length >
        0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibleStatistics.map(
            (statistic) => {
              const Icon =
                statistic.icon;

              return (
                <article
                  key={
                    statistic.id
                  }
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-orange-500/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {
                          statistic.label
                        }
                      </p>

                      <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                        {
                          statistic.value
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {
                          statistic.description
                        }
                      </p>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white dark:bg-orange-500/15 dark:text-orange-400">
                      <Icon
                        size={23}
                      />
                    </div>
                  </div>
                </article>
              );
            },
          )}
        </div>
      )}

      {/* ================= ALERT STATS ================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {hasPermission(
          PERMISSIONS.GET_STOCK_ALERTS,
        ) && (
          <article className="rounded-2xl border border-red-200 bg-red-50 p-5 transition-colors dark:border-red-900/50 dark:bg-red-950/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {t(
                    "dashboard.alerts.stock",
                  )}
                </p>

                <p className="mt-2 text-3xl font-bold text-red-700 dark:text-red-300">
                  {
                    lowStockArticles.length
                  }
                </p>
              </div>

              <AlertTriangle className="text-red-500" />
            </div>
          </article>
        )}

        {hasPermission(
          PERMISSIONS.GET_ALL_LIGHTS,
        ) && (
          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-5 transition-colors dark:border-orange-900/50 dark:bg-orange-950/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  {t(
                    "dashboard.alerts.failures",
                  )}
                </p>

                <p className="mt-2 text-3xl font-bold text-orange-700 dark:text-orange-300">
                  {
                    unresolvedFailures.length
                  }
                </p>
              </div>

              <Lightbulb className="text-orange-500" />
            </div>
          </article>
        )}

        {hasPermission(
          PERMISSIONS.GET_ALL_ASSETS,
        ) && (
          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 transition-colors dark:border-amber-900/50 dark:bg-amber-950/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                  {t(
                    "dashboard.alerts.maintenance",
                  )}
                </p>

                <p className="mt-2 text-3xl font-bold text-amber-800 dark:text-amber-300">
                  {
                    maintenanceBiens.length
                  }
                </p>
              </div>

              <PackageOpen className="text-amber-600" />
            </div>
          </article>
        )}

        {hasPermission(
          PERMISSIONS.GET_STOCK_HISTORY,
        ) && (
          <article className="rounded-2xl border border-teal-200 bg-teal-50 p-5 transition-colors dark:border-teal-900/50 dark:bg-teal-950/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">
                  {t(
                    "dashboard.alerts.movements",
                  )}
                </p>

                <p className="mt-2 text-3xl font-bold text-teal-800 dark:text-teal-300">
                  {
                    initialMockMovements.length
                  }
                </p>
              </div>

              <TrendingUp className="text-teal-600" />
            </div>
          </article>
        )}
      </div>

      {/* ================= CHARTS ================= */}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {hasPermission(
          PERMISSIONS.GET_STOCK_HISTORY,
        ) && (
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t(
                    "dashboard.stock.title",
                  )}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t(
                    "dashboard.stock.subtitle",
                  )}
                </p>
              </div>

              <Activity className="text-orange-600 dark:text-orange-400" />
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    movementChartData
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#cbd5e1"
                    opacity={0.35}
                  />

                  <XAxis
                    dataKey="date"
                    tickLine={false}
                  />

                  <YAxis
                    tickLine={false}
                    allowDecimals={
                      false
                    }
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    name={t(
                      "dashboard.stock.entries",
                    )}
                    dataKey="entries"
                    fill="#0f766e"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />

                  <Bar
                    name={t(
                      "dashboard.stock.exits",
                    )}
                    dataKey="exits"
                    fill="#f59e0b"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        )}

        {hasPermission(
          PERMISSIONS.GET_ALL_LIGHTS,
        ) && (
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t(
                "dashboard.lighting.title",
              )}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t(
                "dashboard.lighting.subtitle",
              )}
            </p>

            <div className="mt-4 h-64">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={
                      lightingStatusData
                    }
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    <Cell fill="#16a34a" />
                    <Cell fill="#dc2626" />
                    <Cell fill="#f59e0b" />
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {lightingStatusData.map(
                (
                  item,
                  index,
                ) => {
                  const dotClass =
                    index === 0
                      ? "bg-green-600"
                      : index === 1
                        ? "bg-red-600"
                        : "bg-amber-500";

                  return (
                    <div
                      key={
                        item.name
                      }
                    >
                      <span
                        className={`mx-auto block h-2.5 w-2.5 rounded-full ${dotClass}`}
                      />

                      <p className="mt-1 text-slate-500 dark:text-slate-400">
                        {
                          item.name
                        }
                      </p>
                    </div>
                  );
                },
              )}
            </div>
          </article>
        )}
      </div>

      {/* ================= BOTTOM ================= */}

      <div className="grid gap-6 xl:grid-cols-2">
        {hasPermission(
          PERMISSIONS.GET_ALL_ASSETS,
        ) && (
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t(
                "dashboard.assets.title",
              )}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t(
                "dashboard.assets.subtitle",
              )}
            </p>

            <div className="mt-5 h-64">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    assetStatusData
                  }
                  layout="vertical"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={
                      false
                    }
                    stroke="#cbd5e1"
                    opacity={0.35}
                  />

                  <XAxis
                    type="number"
                    allowDecimals={
                      false
                    }
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={105}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#d97706"
                    radius={[
                      0,
                      6,
                      6,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        )}

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t(
                  "dashboard.alerts.recent",
                )}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t(
                  "dashboard.alerts.recentDescription",
                )}
              </p>
            </div>

            <AlertTriangle className="shrink-0 text-orange-600 dark:text-orange-400" />
          </div>

          <div className="mt-5 space-y-3">
            {alerts.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                {t(
                  "dashboard.alerts.empty",
                )}
              </p>
            ) : (
              alerts
                .slice(
                  0,
                  5,
                )
                .map(
                  (alert) => (
                    <div
                      key={
                        alert.id
                      }
                      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-orange-100 hover:bg-orange-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-orange-500/30 dark:hover:bg-slate-900"
                    >
                      <div
                        className={[
                          "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                          alert.type ===
                          "lighting"
                            ? "bg-red-500"
                            : alert.type ===
                                "stock"
                              ? "bg-orange-500"
                              : "bg-amber-500",
                        ].join(
                          " ",
                        )}
                      />

                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {
                            alert.title
                          }
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          {
                            alert.message
                          }
                        </p>
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

export default DashboardPage;