import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  useTranslation,
} from "react-i18next";

import DocumentManager from "../documents/DocumentManager";

import type {
  StockArticleFormData,
  StockUnit,
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
  serialNumber: "",
  barcode: "",
  designation: "",
  designationAr: "",
  category: "",
  categoryAr: "",
  quantity: 0,
  minimumQuantity: 0,
  unit: "UNITE",
  location: "",
  locationAr: "",
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
  const { t } =
    useTranslation();

  const [
    formData,
    setFormData,
  ] =
    useState<StockArticleFormData>(
      () => ({
        ...initialValues,
        documents: [
          ...initialValues.documents,
        ],
      }),
    );

  const [
    error,
    setError,
  ] = useState("");

  const handleChange = (
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
    >,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]:
          name === "quantity" ||
          name ===
            "minimumQuantity"
            ? Number(value)
            : value,
      }),
    );

    setError("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !formData.reference.trim() ||
      !formData.designation.trim() ||
      !formData.designationAr.trim() ||
      !formData.category.trim() ||
      !formData.categoryAr.trim() ||
      !formData.location.trim() ||
      !formData.locationAr.trim()
    ) {
      setError(
        t("stock.form.required"),
      );
      return;
    }

    if (formData.quantity < 0) {
      setError(
        t(
          "stock.form.quantityError",
        ),
      );
      return;
    }

    if (
      formData.minimumQuantity < 0
    ) {
      setError(
        t(
          "stock.form.minimumQuantityError",
        ),
      );
      return;
    }

    setError("");

    await onSubmit({
      ...formData,
      reference:
        formData.reference
          .trim()
          .toUpperCase(),
      serialNumber:
        formData.serialNumber
          ?.trim()
          .toUpperCase() ||
        undefined,
      barcode:
        formData.barcode
          ?.trim() || undefined,
      designation:
        formData.designation.trim(),
      designationAr:
        formData.designationAr.trim(),
      category:
        formData.category.trim(),
      categoryAr:
        formData.categoryAr.trim(),
      location:
        formData.location.trim(),
      locationAr:
        formData.locationAr.trim(),
      documents: [
        ...formData.documents,
      ],
    });
  };

  const inputClassName =
    "mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

  const labelClassName =
    "text-sm font-medium text-slate-700 dark:text-slate-200";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t(
              "stock.form.generalInformation",
            )}
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t(
              "stock.form.generalDescription",
            )}
          </p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className={labelClassName}>
            {t(
              "stock.form.reference",
            )}{" "}
            *
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="ART-001"
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            {t(
              "stock.form.unit",
            )}{" "}
            *
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className={inputClassName}
            >
              {units.map(
                (unit) => (
                  <option
                    key={unit}
                    value={unit}
                  >
                    {t(
                      `stock.units.${unit}`,
                    )}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className={labelClassName}>
            {t(
              "stock.form.serialNumber",
            )}
            <input
              type="text"
              name="serialNumber"
              value={
                formData.serialNumber ??
                ""
              }
              onChange={handleChange}
              placeholder="SN-2026-001"
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            {t(
              "stock.form.barcode",
            )}
            <input
              type="text"
              name="barcode"
              value={
                formData.barcode ?? ""
              }
              onChange={handleChange}
              placeholder="6110001234567"
              className={inputClassName}
              inputMode="numeric"
            />
          </label>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              {t(
                "stock.form.frenchInformation",
              )}
            </h2>

            <div className="mt-4 space-y-4">
              <label className={labelClassName}>
                {t(
                  "stock.form.designationFr",
                )}{" "}
                *
                <input
                  type="text"
                  name="designation"
                  value={
                    formData.designation
                  }
                  onChange={handleChange}
                  placeholder={t(
                    "stock.form.designationFrPlaceholder",
                  )}
                  className={inputClassName}
                />
              </label>

              <label className={labelClassName}>
                {t(
                  "stock.form.categoryFr",
                )}{" "}
                *
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder={t(
                    "stock.form.categoryFrPlaceholder",
                  )}
                  className={inputClassName}
                />
              </label>

              <label className={labelClassName}>
                {t(
                  "stock.form.locationFr",
                )}{" "}
                *
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={t(
                    "stock.form.locationFrPlaceholder",
                  )}
                  className={inputClassName}
                />
              </label>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              {t(
                "stock.form.arabicInformation",
              )}
            </h2>

            <div className="mt-4 space-y-4">
              <label className={labelClassName}>
                {t(
                  "stock.form.designationAr",
                )}{" "}
                *
                <input
                  type="text"
                  dir="rtl"
                  name="designationAr"
                  value={
                    formData.designationAr
                  }
                  onChange={handleChange}
                  placeholder={t(
                    "stock.form.designationArPlaceholder",
                  )}
                  className={inputClassName}
                />
              </label>

              <label className={labelClassName}>
                {t(
                  "stock.form.categoryAr",
                )}{" "}
                *
                <input
                  type="text"
                  dir="rtl"
                  name="categoryAr"
                  value={
                    formData.categoryAr
                  }
                  onChange={handleChange}
                  placeholder={t(
                    "stock.form.categoryArPlaceholder",
                  )}
                  className={inputClassName}
                />
              </label>

              <label className={labelClassName}>
                {t(
                  "stock.form.locationAr",
                )}{" "}
                *
                <input
                  type="text"
                  dir="rtl"
                  name="locationAr"
                  value={
                    formData.locationAr
                  }
                  onChange={handleChange}
                  placeholder={t(
                    "stock.form.locationArPlaceholder",
                  )}
                  className={inputClassName}
                />
              </label>
            </div>
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <h2 className="font-bold text-slate-900 dark:text-white">
          {t(
            "stock.form.stockInformation",
          )}
        </h2>

        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <label className={labelClassName}>
            {t(
              "stock.form.quantity",
            )}{" "}
            *
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
            {t(
              "stock.form.minimumQuantity",
            )}{" "}
            *
            <input
              type="number"
              min="0"
              name="minimumQuantity"
              value={
                formData.minimumQuantity
              }
              onChange={handleChange}
              className={inputClassName}
            />
          </label>
        </div>
      </article>

      <DocumentManager
        documents={formData.documents}
        onChange={(documents) =>
          setFormData(
            (previous) => ({
              ...previous,
              documents,
            }),
          )
        }
      />

      <div className="flex justify-end rtl:justify-start">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
        >
          {loading
            ? t(
                "stock.form.saving",
              )
            : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default ArticleForm;
