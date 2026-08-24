import {
  ArrowLeft,
  CalendarDays,
  Gauge,
  Lightbulb,
  MapPin,
  Navigation,
  Pencil,
  Tag,
} from "lucide-react";

import {
  useEffect,
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
  lightingService,
} from "../../services/lightingService";

import type {
  Light,
  LightStatus,
} from "../../types/lighting";

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

function LightDetailsPage() {
  const { id } =
    useParams();

  const lightId =
    Number(id);

  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith("ar");

  const [
    light,
    setLight,
  ] =
    useState<Light | null>(
      null,
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
    const loadLight =
      async () => {
        try {
          if (
            !Number.isFinite(
              lightId,
            )
          ) {
            throw new Error(
              t(
                "lighting.details.invalidId",
              ),
            );
          }

          const data =
            await lightingService.getLightById(
              lightId,
            );

          setLight(
            data,
          );
        } catch (
          caughtError
        ) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : t(
                  "lighting.details.notFound",
                ),
          );
        } finally {
          setLoading(false);
        }
      };

    void loadLight();
  }, [
    lightId,
    t,
  ]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        {t(
          "lighting.details.loading",
        )}
      </div>
    );
  }

  if (!light) {
    return (
      <section className="space-y-4">
        <Link
          to={
            ROUTES.LIGHTING
          }
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
            "lighting.details.back",
          )}
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error ||
            t(
              "lighting.details.notFound",
            )}
        </div>
      </section>
    );
  }

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

  const information = [
    {
      label: t(
        "lighting.details.reference",
      ),
      value:
        light.reference,
      icon: Tag,
    },

    {
      label: t(
        "lighting.details.zone",
      ),
      value: zone,
      icon: MapPin,
    },

    {
      label: t(
        "lighting.details.address",
      ),
      value: address,
      icon: MapPin,
    },

    {
      label: t(
        "lighting.details.power",
      ),
      value: `${light.power} W`,
      icon: Gauge,
    },

    {
      label: t(
        "lighting.details.installationDate",
      ),
      value:
        light.installationDate,
      icon: CalendarDays,
    },

    {
      label: t(
        "lighting.details.status",
      ),
      value: t(
        `lighting.statuses.${light.status}`,
      ),
      icon: Lightbulb,
    },

    {
      label: t(
        "lighting.details.latitude",
      ),
      value:
        light.latitude.toString(),
      icon: Navigation,
    },

    {
      label: t(
        "lighting.details.longitude",
      ),
      value:
        light.longitude.toString(),
      icon: Navigation,
    },
  ];

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link
          to={
            ROUTES.LIGHTING
          }
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
            "lighting.details.back",
          )}
        </Link>

        <PermissionGuard
          permission={
            PERMISSIONS.UPDATE_LIGHT
          }
        >
          <Link
            to={`/eclairage/${light.id}/modifier`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            <Pencil
              size={18}
            />

            {t(
              "lighting.details.edit",
            )}
          </Link>
        </PermissionGuard>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-700 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {designation}
            </h1>

            <p
              className="mt-2 text-sm text-slate-500 dark:text-slate-400"
              dir="ltr"
            >
              {
                light.reference
              }
            </p>
          </div>

          <span
            className={[
              "h-fit rounded-full px-3 py-1.5 text-xs font-semibold",
              statusClassNames[
                light.status
              ],
            ].join(" ")}
          >
            {t(
              `lighting.statuses.${light.status}`,
            )}
          </span>
        </div>

        <h2 className="mt-6 font-bold text-slate-900 dark:text-white">
          {t(
            "lighting.details.information",
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

                  <p className="mt-2 font-medium text-slate-800 dark:text-slate-100">
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
    </section>
  );
}

export default LightDetailsPage;