import { ArrowLeft } from "lucide-react";

import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useTranslation } from "react-i18next";

import BienForm from "../../components/biens/BienForm";

import { ROUTES } from "../../constants/routes";

import { bienService } from "../../services/bienService";

import type { BienFormData } from "../../types/bien";

function AddBienPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    data: BienFormData,
  ) => {
    try {
      setLoading(true);
      setError("");

      await bienService.create(data);

      navigate(ROUTES.BIENS);
    } catch {
      setError(
        t(
          "biens.pages.genericError",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div>
        <Link
          to={ROUTES.BIENS}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
        >
          <ArrowLeft
            size={18}
            className="rtl:rotate-180"
          />

          {t("biens.pages.back")}
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          {t(
            "biens.pages.addTitle",
          )}
        </h1>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <BienForm
        submitLabel={t(
          "biens.pages.create",
        )}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

export default AddBienPage;