import { ArrowLeft } from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
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
  LightFormData,
} from "../../types/lighting";

function AddLightPage() {
  const navigate =
    useNavigate();

  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith("ar");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const handleSubmit =
    async (
      data: LightFormData,
    ) => {
      try {
        setLoading(true);
        setError("");

        await lightingService.createLight(
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
        setLoading(false);
      }
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
            "lighting.pages.addTitle",
          )}
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {t(
            "lighting.pages.addDescription",
          )}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <LightForm
        submitLabel={t(
          "lighting.pages.create",
        )}
        loading={
          loading
        }
        onSubmit={
          handleSubmit
        }
      />
    </section>
  );
}

export default AddLightPage;