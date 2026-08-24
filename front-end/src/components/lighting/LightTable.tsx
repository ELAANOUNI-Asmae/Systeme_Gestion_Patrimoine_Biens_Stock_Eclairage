import {
  Eye,
  Pencil,
  TriangleAlert,
  Trash2,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import PermissionGuard from "../common/PermissionGuard";

import {
  PERMISSIONS,
} from "../../constants/permissions";

import type {
  Light,
  LightStatus,
} from "../../types/lighting";

type LightTableProps = {
  lights: Light[];

  loading: boolean;

  onDelete: (
    light: Light,
  ) => void;

  onReportFailure: (
    light: Light,
  ) => void;
};

const statusClassNames: Record<
  LightStatus,
  string
> = {
  ACTIVE:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",

  INACTIVE:
    "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",

  DAMAGED:
    "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",

  UNDER_MAINTENANCE:
    "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
};

function LightTable({
  lights,
  loading,
  onDelete,
  onReportFailure,
}: LightTableProps) {
  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith(
      "ar",
    );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t(
                  "lighting.table.equipment",
                )}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t(
                  "lighting.table.zone",
                )}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t(
                  "lighting.table.address",
                )}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t(
                  "lighting.table.power",
                )}
              </th>

              <th className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t(
                  "lighting.table.status",
                )}
              </th>

              <th className="px-5 py-4 text-end text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t(
                  "lighting.table.actions",
                )}
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
                  {t(
                    "lighting.table.loading",
                  )}
                </td>
              </tr>
            ) : lights.length ===
              0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  {t(
                    "lighting.table.empty",
                  )}
                </td>
              </tr>
            ) : (
              lights.map(
                (light) => {
                  const designation =
                    isArabic
                      ? light.designationAr
                      : light.designation;

                  const zone =
                    isArabic
                      ? light.zoneAr
                      : light.zone;

                  const address =
                    isArabic
                      ? light.addressAr
                      : light.address;

                  return (
                    <tr
                      key={
                        light.id
                      }
                      className="transition hover:bg-slate-50 dark:hover:bg-slate-700/40"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                          {
                            designation
                          }
                        </p>

                        <p
                          className="mt-1 text-xs text-slate-500 dark:text-slate-400"
                          dir="ltr"
                        >
                          {
                            light.reference
                          }
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {zone}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {
                          address
                        }
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                        {
                          light.power
                        }{" "}
                        W
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                            statusClassNames[
                              light.status
                            ],
                          ].join(
                            " ",
                          )}
                        >
                          {t(
                            `lighting.statuses.${light.status}`,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1 rtl:justify-start">
                          <PermissionGuard
                            permission={
                              PERMISSIONS.REPORT_FAILURE
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                onReportFailure(
                                  light,
                                )
                              }
                              disabled={
                                light.status ===
                                  "DAMAGED" ||
                                light.status ===
                                  "UNDER_MAINTENANCE"
                              }
                              title={
                                light.status ===
                                  "DAMAGED" ||
                                light.status ===
                                  "UNDER_MAINTENANCE"
                                  ? t(
                                      "lighting.actions.failureAlreadyReported",
                                    )
                                  : t(
                                      "lighting.actions.reportFailure",
                                    )
                              }
                              aria-label={
                                t(
                                  "lighting.actions.reportFailure",
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                            >
                              <TriangleAlert
                                size={
                                  18
                                }
                              />
                            </button>
                          </PermissionGuard>

                          <Link
                            to={`/eclairage/${light.id}`}
                            title={t(
                              "lighting.actions.details",
                            )}
                            aria-label={t(
                              "lighting.actions.details",
                            )}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                          >
                            <Eye
                              size={
                                18
                              }
                            />
                          </Link>

                          <PermissionGuard
                            permission={
                              PERMISSIONS.UPDATE_LIGHT
                            }
                          >
                            <Link
                              to={`/eclairage/${light.id}/modifier`}
                              title={t(
                                "lighting.actions.edit",
                              )}
                              aria-label={t(
                                "lighting.actions.edit",
                              )}
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
                            >
                              <Pencil
                                size={
                                  18
                                }
                              />
                            </Link>
                          </PermissionGuard>

                          <PermissionGuard
                            permission={
                              PERMISSIONS.DELETE_LIGHT
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                onDelete(
                                  light,
                                )
                              }
                              title={t(
                                "lighting.actions.delete",
                              )}
                              aria-label={t(
                                "lighting.actions.delete",
                              )}
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                            >
                              <Trash2
                                size={
                                  18
                                }
                              />
                            </button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  );
                },
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LightTable;