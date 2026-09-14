import {
  Camera,
  CheckCircle2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useTranslation } from "react-i18next";

import DocumentManager from "../documents/DocumentManager";
import type { AppDocument } from "../../types/document";
import type {
  Intervention,
  InterventionCompletionData,
} from "../../types/lighting";

type Props = {
  open: boolean;
  intervention: Intervention | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: InterventionCompletionData) => Promise<void> | void;
};

function CompleteInterventionModal({
  open,
  intervention,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [report, setReport] = useState("");
  const [cost, setCost] = useState("0");
  const [completedAt, setCompletedAt] = useState("");
  const [photos, setPhotos] = useState<AppDocument[]>([]);
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReport("");
      setCost("0");
      setCompletedAt(new Date().toISOString().slice(0, 10));
      setPhotos([]);
      setDocuments([]);
      setError("");
    }
  }, [open]);

  if (!open || !intervention) return null;

  const addPhotos = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    const baseId = Math.max(0, ...photos.map((item) => item.id)) + 1;

    setPhotos((previous) => [
      ...previous,
      ...selected.map((file, index): AppDocument => ({
        id: baseId + index,
        name: file.name,
        category: "ATTACHMENT",
        type: "PHOTO",
        fileName: file.name,
        uploadDate: new Date().toISOString().slice(0, 10),
        file,
      })),
    ]);

    if (inputRef.current) inputRef.current.value = "";
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericCost = Number(cost);

    if (!report.trim()) {
      setError(tr("Le rapport est obligatoire.", "التقرير إلزامي."));
      return;
    }
    if (!Number.isFinite(numericCost) || numericCost < 0) {
      setError(tr("Coût invalide.", "التكلفة غير صالحة."));
      return;
    }
    if (photos.length < 1) {
      setError(
        tr(
          "Ajoutez au moins une photo de l’intervention.",
          "أضف صورة واحدة على الأقل للتدخل.",
        ),
      );
      return;
    }

    setError("");
    await onSubmit({
      report: report.trim(),
      cost: numericCost,
      completedAt,
      photos,
      documents,
    });
  };

  return (
    <div className="fixed inset-0 z-[1010] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
        <div className="flex justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-bold">
              {tr("Terminer l’intervention", "إنهاء التدخل")}
            </h2>
            <p className="text-sm text-slate-500">
              {isArabic
                ? intervention.technicianNameAr
                : intervention.technicianName}
            </p>
          </div>
          <button type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-5">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium">
            {tr("Rapport d’intervention", "تقرير التدخل")} *
            <textarea
              rows={6}
              value={report}
              onChange={(event) => setReport(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 dark:border-slate-600 dark:bg-slate-900"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">
              {tr("Coût (DH)", "التكلفة (درهم)")} *
              <input
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(event) => setCost(event.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
              />
            </label>
            <label className="text-sm font-medium">
              {tr("Date de fin", "تاريخ الانتهاء")} *
              <input
                type="date"
                value={completedAt}
                onChange={(event) => setCompletedAt(event.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
              />
            </label>
          </div>

          <section className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 font-semibold">
                  <Camera size={18} />
                  {tr("Photos après intervention", "صور بعد التدخل")} *
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {tr("Au moins une photo obligatoire.", "صورة واحدة على الأقل إلزامية.")}
                </p>
              </div>

              <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={addPhotos}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-orange-300 px-4 py-2 text-sm font-semibold text-orange-700"
              >
                <Upload size={17} />
                {tr("Ajouter des photos", "إضافة صور")}
              </button>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-900"
                >
                  <Camera size={16} />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {photo.fileName}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPhotos((previous) =>
                        previous.filter((item) => item.id !== photo.id),
                      )
                    }
                    className="text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <DocumentManager documents={documents} onChange={setDocuments} />

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2.5"
            >
              {tr("Annuler", "إلغاء")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 font-semibold text-white"
            >
              <CheckCircle2 size={18} />
              {tr("Confirmer la fin", "تأكيد الانتهاء")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompleteInterventionModal;
