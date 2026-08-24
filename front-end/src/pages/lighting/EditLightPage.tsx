import { ArrowLeft } from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import LightForm from "../../components/lighting/LightForm";

import {
  ROUTES,
} from "../../constants/routes";

import {
  lightingService,
} from "../../services/lightingService";

import type {
  Light,
  LightFormData,
} from "../../types/lighting";

function EditLightPage() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith("ar");

  const lightId =
    Number(id);

  const [
    light,
    setLight,
  ] =
    useState<
      Light | null
    >(null);

  const [
    loadingPage,
    setLoadingPage,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

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
                "lighting.pages.invalidId",
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
                  "lighting.pages.notFound",
                ),
          );
        } finally {
          setLoadingPage(
            false,
          );
        }
      };

    void loadLight();
  }, [
    lightId,
    t,
  ]);

  const handleSubmit =
    async (
      data: LightFormData,
    ) => {
      try {
        setSaving(true);
        setError("");

        await lightingService.updateLight(
          lightId,
          data,
        );

        navigate(
          ROUTES.LIGHTING,
        );
      } catch (
        caughtError
      ) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : t(
                "lighting.pages.genericError",
              ),
        );
      } finally {
        setSaving(false);
      }
    };

  if (loadingPage) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        {t(
          "lighting.pages.loading",
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
            "lighting.pages.back",
          )}
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error ||
            t(
              "lighting.pages.notFound",
            )}
        </div>
      </section>
    );
  }

  const initialValues:
    LightFormData = {
      reference:
        light.reference,

      designation:
        light.designation,

      designationAr:
        light.designationAr,

      zone:
        light.zone,

      zoneAr:
        light.zoneAr,

      address:
        light.address,

      addressAr:
        light.addressAr,

      latitude:
        light.latitude,

      longitude:
        light.longitude,

      status:
        light.status,

      installationDate:
        light.installationDate,

      power:
        light.power,
    };

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
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
            "lighting.pages.back",
          )}
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          {t(
            "lighting.pages.editTitle",
          )}
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {t(
            "lighting.pages.editDescription",
          )}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <LightForm
        initialValues={
          initialValues
        }
        submitLabel={t(
          "lighting.pages.save",
        )}
        loading={
          saving
        }
        onSubmit={
          handleSubmit
        }
      />
    </section>
  );
}

export default EditLightPage;