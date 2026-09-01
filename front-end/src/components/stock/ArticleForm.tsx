
import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useTranslation } from "react-i18next";

import DocumentManager from "../documents/DocumentManager";

import {
  calculateTotalHt,
  calculateTotalTtc,
  calculateUnitPriceTtc,
  type StockArticleFormData,
  type StockUnit,
} from "../../types/stock";

type ArticleFormProps = {
  initialValues?: StockArticleFormData;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (
    data: StockArticleFormData,
  ) => Promise<void> | void;
};

const emptyValues: StockArticleFormData = {
  reference: "",
  barcode: "",
  brand: "",
  designation: "",
  designationAr: "",
  category: "",
  categoryAr: "",
  quantity: 0,
  minimumQuantity: 0,
  unit: "UNITE",
  location: "",
  locationAr: "",
  unitPriceHt: 0,
  vatRate: 20,
  documents: [],
};

const units: StockUnit[] = [
  "UNITE",
  "BOITE",
  "PAQUET",
  "LITRE",
  "KILOGRAMME",
  "METRE",
];

function ArticleForm({
  initialValues = emptyValues,
  submitLabel,
  loading = false,
  onSubmit,
}: ArticleFormProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const [formData, setFormData] =
    useState<StockArticleFormData>(() => ({
      ...initialValues,
      documents: [...initialValues.documents],
    }));

  const [error, setError] = useState("");

  const priceSummary = useMemo(
    () => ({
      unitTtc: calculateUnitPriceTtc(
        formData.unitPriceHt,
        formData.vatRate,
      ),
      totalHt: calculateTotalHt(
        formData.quantity,
        formData.unitPriceHt,
      ),
      totalTtc: calculateTotalTtc(
        formData.quantity,
        formData.unitPriceHt,
        formData.vatRate,
      ),
    }),
    [
      formData.quantity,
      formData.unitPriceHt,
      formData.vatRate,
    ],
  );

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    const numericFields = new Set([
      "quantity",
      "minimumQuantity",
      "unitPriceHt",
      "vatRate",
    ]);

    setFormData((previous) => ({
      ...previous,
      [name]: numericFields.has(name)
        ? Number(value)
        : value,
    }));

    setError("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !formData.reference.trim() ||
      !formData.barcode.trim() ||
      !formData.brand.trim() ||
      !formData.designation.trim() ||
      !formData.designationAr.trim() ||
      !formData.category.trim() ||
      !formData.categoryAr.trim() ||
      !formData.location.trim() ||
      !formData.locationAr.trim()
    ) {
      setError(
        tr(
          "Tous les champs obligatoires doivent être remplis.",
          "يجب ملء جميع الحقول الإجبارية.",
        ),
      );
      return;
    }

    if (
      formData.quantity < 0 ||
      formData.minimumQuantity < 0
    ) {
      setError(
        tr(
          "Les quantités ne peuvent pas être négatives.",
          "لا يمكن أن تكون الكميات سالبة.",
        ),
      );
      return;
    }

    if (formData.unitPriceHt <= 0) {
      setError(
        tr(
          "Le prix unitaire HT doit être supérieur à zéro.",
          "يجب أن يكون ثمن الوحدة بدون الضريبة أكبر من صفر.",
        ),
      );
      return;
    }

    if (
      formData.vatRate < 0 ||
      formData.vatRate > 100
    ) {
      setError(
        tr(
          "Le taux de TVA doit être compris entre 0 et 100.",
          "يجب أن تكون نسبة الضريبة بين 0 و100.",
        ),
      );
      return;
    }

    setError("");

    await onSubmit({
      ...formData,
      reference: formData.reference.trim().toUpperCase(),
      barcode: formData.barcode.trim(),
      brand: formData.brand.trim(),
      designation: formData.designation.trim(),
      designationAr: formData.designationAr.trim(),
      category: formData.category.trim(),
      categoryAr: formData.categoryAr.trim(),
      location: formData.location.trim(),
      locationAr: formData.locationAr.trim(),
      documents: [...formData.documents],
    });
  };

  const inputClassName =
    "mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

  const labelClassName =
    "text-sm font-medium text-slate-700 dark:text-slate-200";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {tr("Informations générales", "المعلومات العامة")}
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className={labelClassName}>
            {tr("Référence", "المرجع")} *
            <input
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="ART-001"
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            {tr("Code-barres", "الباركود")} *
            <input
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              placeholder="6110001234567"
              className={inputClassName}
              inputMode="numeric"
            />
            <span className="mt-1 block text-xs text-slate-500">
              {tr(
                "Le code-barres est l’identifiant série de l’article.",
                "الباركود هو المعرّف التسلسلي للمادة.",
              )}
            </span>
          </label>

          <label className={labelClassName}>
            {tr("Marque", "العلامة")} *
            <input
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder={tr("Ex. Philips", "مثال Philips")}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            {tr("Unité", "الوحدة")} *
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className={inputClassName}
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="font-bold">
              {tr("Informations en français", "المعلومات بالفرنسية")}
            </h2>

            <label className={labelClassName}>
              {tr("Désignation", "التسمية")} *
              <input
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className={inputClassName}
              />
            </label>

            <label className={labelClassName}>
              {tr("Catégorie", "الفئة")} *
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={inputClassName}
              />
            </label>

            <label className={labelClassName}>
              {tr("Emplacement", "المكان")} *
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={inputClassName}
              />
            </label>
          </div>

          <div className="space-y-4">
            <h2 className="font-bold">
              {tr("Informations en arabe", "المعلومات بالعربية")}
            </h2>

            <label className={labelClassName}>
              {tr("Désignation en arabe", "التسمية بالعربية")} *
              <input
                dir="rtl"
                name="designationAr"
                value={formData.designationAr}
                onChange={handleChange}
                className={inputClassName}
              />
            </label>

            <label className={labelClassName}>
              {tr("Catégorie en arabe", "الفئة بالعربية")} *
              <input
                dir="rtl"
                name="categoryAr"
                value={formData.categoryAr}
                onChange={handleChange}
                className={inputClassName}
              />
            </label>

            <label className={labelClassName}>
              {tr("Emplacement en arabe", "المكان بالعربية")} *
              <input
                dir="rtl"
                name="locationAr"
                value={formData.locationAr}
                onChange={handleChange}
                className={inputClassName}
              />
            </label>
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <h2 className="font-bold">
          {tr("Stock et prix", "المخزون والثمن")}
        </h2>

        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <label className={labelClassName}>
            {tr("Quantité", "الكمية")} *
            <input
              type="number"
              min="0"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            {tr("Seuil minimum", "الحد الأدنى")} *
            <input
              type="number"
              min="0"
              name="minimumQuantity"
              value={formData.minimumQuantity}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            {tr("Prix unitaire HT (DH)", "ثمن الوحدة بدون الضريبة (درهم)")} *
            <input
              type="number"
              min="0"
              step="0.01"
              name="unitPriceHt"
              value={formData.unitPriceHt}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            {tr("TVA (%)", "الضريبة (%)")} *
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              name="vatRate"
              value={formData.vatRate}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <PriceCard
            label={tr("Prix unitaire TTC", "ثمن الوحدة شامل الضريبة")}
            value={priceSummary.unitTtc}
          />
          <PriceCard
            label={tr("Total HT du stock", "إجمالي المخزون بدون الضريبة")}
            value={priceSummary.totalHt}
          />
          <PriceCard
            label={tr("Total TTC du stock", "إجمالي المخزون شامل الضريبة")}
            value={priceSummary.totalTtc}
          />
        </div>
      </article>

      <DocumentManager
        documents={formData.documents}
        onChange={(documents) =>
          setFormData((previous) => ({
            ...previous,
            documents,
          }))
        }
      />

      <div className="flex justify-end rtl:justify-start">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
        >
          {loading
            ? tr("Enregistrement", "جارٍ الحفظ")
            : submitLabel}
        </button>
      </div>
    </form>
  );
}

function PriceCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold">
        {value.toFixed(2)} DH
      </p>
    </div>
  );
}

export default ArticleForm;
