import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import BienForm from "../../components/biens/BienForm";
import DocumentManager from "../../components/documents/DocumentManager";
import { ROUTES } from "../../constants/routes";
import { bienApiService } from "../../services/bienApiService";
import type { BienFormData } from "../../types/bien";
import type { AppDocument } from "../../types/document";

function AddBienPage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [documents, setDocuments] = useState<AppDocument[]>([]);

  const handleSubmit = async (data: BienFormData) => {
    try {
      setLoading(true);
      setError("");

      const created = await bienApiService.create({
        ...data,
        documents,
      });

      if (created.id !== undefined) {
        await bienApiService.uploadAssetDocuments(
          created.id,
          documents,
        );

        navigate(`/biens/${created.id}?type=${data.type}`);
        return;
      }

      navigate(ROUTES.BIENS);
    } catch (error) {
      console.error("Create asset failed:", error);

      setError(
        tr(
          "Impossible de créer le bien ou d’envoyer ses documents. Vérifiez les informations et réessayez.",
          "تعذر إنشاء الممتلك أو رفع وثائقه. تحقق من المعلومات ثم أعد المحاولة.",
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
          <ArrowLeft size={18} className="rtl:rotate-180" />

          {tr("Retour aux biens", "العودة إلى الممتلكات")}
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          {tr("Ajouter un bien", "إضافة ممتلك")}
        </h1>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      <DocumentManager
        documents={documents}
        onChange={setDocuments}
        title={tr(
          "Documents du bien",
          "وثائق الممتلك",
        )}
      />

      <BienForm
        mode="create"
        loading={loading}
        submitLabel={tr("Créer le bien", "إنشاء الممتلك")}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

export default AddBienPage;
