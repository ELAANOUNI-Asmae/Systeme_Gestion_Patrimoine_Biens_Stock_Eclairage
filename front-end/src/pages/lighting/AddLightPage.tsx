import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LightForm from "../../components/lighting/LightForm";
import { ROUTES } from "../../constants/routes";
import { lightingService } from "../../services/lightingService";
import type { LightFormData } from "../../types/lighting";

function AddLightPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (data: LightFormData) => {
    try {
      setSaving(true);
      setError("");
      await lightingService.createLight(data);
      navigate(ROUTES.LIGHTING);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : tr("Une erreur est survenue.", "حدث خطأ."),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          to={ROUTES.LIGHTING}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600"
        >
          <ArrowLeft size={18} className={isArabic ? "rotate-180" : ""} />
          {tr("Retour à l’éclairage", "العودة إلى الإنارة")}
        </Link>
        <h1 className="mt-4 text-3xl font-bold">
          {tr("Ajouter un point lumineux", "إضافة نقطة إنارة")}
        </h1>
        <p className="mt-2 text-slate-500">
          {tr(
            "Le point sera actif automatiquement après sa création.",
            "ستكون نقطة الإنارة نشطة تلقائياً بعد إنشائها.",
          )}
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <LightForm
        submitLabel={tr("Créer le point lumineux", "إنشاء نقطة الإنارة")}
        loading={saving}
        onSubmit={submit}
      />
    </section>
  );
}

export default AddLightPage;
