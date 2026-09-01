import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useTranslation } from "react-i18next";

import DocumentManager from "../documents/DocumentManager";
import type {
  LightFormData,
  LightStatus,
} from "../../types/lighting";

type Props = {
  initialValues?: LightFormData;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (data: LightFormData) => Promise<void> | void;
};

const emptyValues: LightFormData = {
  reference: "",
  designation: "",
  designationAr: "",
  localisation: "",
  latitude: 30.4208,
  longitude: -9.5981,
  status: "ACTIVE",
  installationDate: new Date().toISOString().slice(0, 10),
  power: 0,
  documents: [],
};

const statuses: LightStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "DAMAGED",
  "UNDER_MAINTENANCE",
];

function LightForm({
  initialValues,
  submitLabel,
  loading = false,
  onSubmit,
}: Props) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const [formData, setFormData] = useState<LightFormData>(() =>
    initialValues
      ? { ...initialValues, documents: [...initialValues.documents] }
      : { ...emptyValues, documents: [] },
  );
  const [error, setError] = useState("");
  const isEdit = Boolean(initialValues);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "power" ||
        name === "latitude" ||
        name === "longitude"
          ? Number(value)
          : value,
    }));
    setError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formData.reference.trim() ||
      !formData.designation.trim() ||
      !formData.designationAr.trim() ||
      !formData.localisation.trim() ||
      !formData.installationDate
    ) {
      setError(
        tr(
          "Tous les champs obligatoires doivent être remplis.",
          "يجب ملء جميع الحقول الإلزامية.",
        ),
      );
      return;
    }

    if (!Number.isFinite(formData.power) || formData.power <= 0) {
      setError(
        tr(
          "La puissance doit être supérieure à zéro.",
          "يجب أن تكون القدرة أكبر من صفر.",
        ),
      );
      return;
    }

    if (
      !Number.isFinite(formData.latitude) ||
      formData.latitude < -90 ||
      formData.latitude > 90
    ) {
      setError(tr("Latitude invalide.", "خط العرض غير صالح."));
      return;
    }

    if (
      !Number.isFinite(formData.longitude) ||
      formData.longitude < -180 ||
      formData.longitude > 180
    ) {
      setError(tr("Longitude invalide.", "خط الطول غير صالح."));
      return;
    }

    await onSubmit({
      ...formData,
      reference: formData.reference.trim().toUpperCase(),
      designation: formData.designation.trim(),
      designationAr: formData.designationAr.trim(),
      localisation: formData.localisation.trim(),
      status: isEdit ? formData.status : "ACTIVE",
      documents: [...formData.documents],
    });
  };

  const inputClass =
    "mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-orange-500/20";
  const labelClass =
    "text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <h2 className="text-lg font-bold">
          {tr("Informations générales", "المعلومات العامة")}
        </h2>

        {!isEdit && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-950/20 dark:text-green-300">
            {tr(
              "Le nouveau point sera créé avec le statut Actif automatiquement.",
              "سيتم إنشاء نقطة الإنارة بالحالة «نشط» تلقائياً.",
            )}
          </div>
        )}

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            {tr("Référence", "المرجع")} *
            <input
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="LMP-001"
              className={inputClass}
            />
          </label>

          {isEdit && (
            <label className={labelClass}>
              {tr("Statut", "الحالة")} *
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClass}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {t(`lighting.statuses.${status}`)}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className={labelClass}>
            {tr("Désignation en français", "التسمية بالفرنسية")} *
            <input
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            {tr("Désignation en arabe", "التسمية بالعربية")} *
            <input
              name="designationAr"
              value={formData.designationAr}
              onChange={handleChange}
              dir="rtl"
              className={inputClass}
            />
          </label>

          <label className={`${labelClass} md:col-span-2`}>
            {tr("Localisation", "الموقع")} *
            <input
              name="localisation"
              value={formData.localisation}
              onChange={handleChange}
              placeholder={tr(
                "Ex. Hay Mohammadi, Avenue...",
                "مثال: حي المحمدي، شارع...",
              )}
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            {tr("Date d’installation", "تاريخ التركيب")} *
            <input
              type="date"
              name="installationDate"
              value={formData.installationDate}
              onChange={handleChange}
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            {tr("Puissance (W)", "القدرة (واط)")} *
            <input
              type="number"
              min="0"
              step="any"
              name="power"
              value={formData.power}
              onChange={handleChange}
              className={inputClass}
            />
          </label>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <h2 className="text-lg font-bold">
          {tr("Coordonnées GPS", "الإحداثيات الجغرافية")}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {tr(
            "Utilisées pour la carte et pour proposer les techniciens les plus proches.",
            "تستعمل للخريطة واقتراح أقرب التقنيين.",
          )}
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            Latitude *
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Longitude *
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className={inputClass}
            />
          </label>
        </div>
      </article>

      <DocumentManager
        documents={formData.documents}
        onChange={(documents) =>
          setFormData((previous) => ({ ...previous, documents }))
        }
      />

      <div className="flex justify-end rtl:justify-start">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {loading ? tr("Enregistrement...", "جارٍ الحفظ...") : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default LightForm;
