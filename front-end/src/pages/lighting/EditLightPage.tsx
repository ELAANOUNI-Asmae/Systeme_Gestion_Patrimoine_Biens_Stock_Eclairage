import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

import LightForm from "../../components/lighting/LightForm";
import { ROUTES } from "../../constants/routes";
import { lightingService } from "../../services/lightingService";
import type {
  LightFormData,
} from "../../types/lighting";

function EditLightPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const lightId = Number(id);
  const [initialValues, setInitialValues] =
    useState<LightFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        if (!Number.isFinite(lightId)) {
          throw new Error(tr("Identifiant invalide.", "معرّف غير صالح."));
        }

        const light = await lightingService.getLightById(lightId);

        setInitialValues({
          reference: light.reference,
          designation: light.designation,
          designationAr: light.designationAr,
          localisation: light.localisation,
          latitude: light.latitude,
          longitude: light.longitude,
          status: light.status,
          installationDate: light.installationDate,
          power: light.power,
          documents: [...light.documents],
        });
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : tr("Point lumineux introuvable.", "نقطة الإنارة غير موجودة."),
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [lightId]);

  const submit = async (data: LightFormData) => {
    try {
      setSaving(true);
      setError("");
      await lightingService.updateLight(lightId, data);
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

  if (loading) {
    return (
      <div className="p-8 text-center">
        {tr("Chargement...", "جارٍ التحميل...")}
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

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
          {tr("Modifier le point lumineux", "تعديل نقطة الإنارة")}
        </h1>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <LightForm
        initialValues={initialValues}
        submitLabel={tr("Enregistrer les modifications", "حفظ التعديلات")}
        loading={saving}
        onSubmit={submit}
      />
    </section>
  );
}

export default EditLightPage;
