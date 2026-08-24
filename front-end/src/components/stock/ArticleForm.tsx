import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  useTranslation,
} from "react-i18next";

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

  designation: "",
  designationAr: "",

  category: "",
  categoryAr: "",

  quantity: 0,

  minimumQuantity: 0,

  unit: "UNITE",

  location: "",
  locationAr: "",
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
  const {
    t,
  } = useTranslation();

  const [
    formData,
    setFormData,
  ] =
    useState<StockArticleFormData>(
      initialValues,
    );

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    setFormData(
      initialValues,
    );
  }, [initialValues]);

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
      (previousData) => ({
        ...previousData,

        [name]:
          name ===
            "quantity" ||
          name ===
            "minimumQuantity"
            ? Number(value)
            : value,
      }),
    );
  };

  const handleSubmit =
    async (
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
          t(
            "stock.form.required",
          ),
        );

        return;
      }

      if (
        formData.quantity < 0
      ) {
        setError(
          t(
            "stock.form.quantityError",
          ),
        );

        return;
      }

      if (
        formData.minimumQuantity <
        0
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
      });
    };

  const inputClassName =
    "mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20";

  const labelClassName =
    "text-sm font-medium text-slate-700 dark:text-slate-200";

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6"
    >
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* INFORMATIONS GENERALES */}

      <div className="mb-5">
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

      <div className="grid gap-5 md:grid-cols-2">
        {/* REFERENCE */}

        <label
          className={
            labelClassName
          }
        >
          {t(
            "stock.form.reference",
          )}{" "}
          *

          <input
            type="text"
            name="reference"
            value={
              formData.reference
            }
            onChange={
              handleChange
            }
            placeholder="ART-001"
            className={
              inputClassName
            }
            dir="ltr"
          />
        </label>

        {/* UNIT */}

        <label
          className={
            labelClassName
          }
        >
          {t(
            "stock.form.unit",
          )}{" "}
          *

          <select
            name="unit"
            value={
              formData.unit
            }
            onChange={
              handleChange
            }
            className={
              inputClassName
            }
          >
            {units.map(
              (unit) => (
                <option
                  key={
                    unit
                  }
                  value={
                    unit
                  }
                >
                  {t(
                    `stock.units.${unit}`,
                  )}
                </option>
              ),
            )}
          </select>
        </label>
      </div>

      {/* FR */}

      <div className="mt-7 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            FR
          </span>

          <h3 className="font-semibold text-slate-900 dark:text-white">
            {t(
              "stock.form.frenchInformation",
            )}
          </h3>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label
            className={
              labelClassName
            }
          >
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
              onChange={
                handleChange
              }
              placeholder={t(
                "stock.form.designationFrPlaceholder",
              )}
              className={
                inputClassName
              }
              dir="ltr"
            />
          </label>

          <label
            className={
              labelClassName
            }
          >
            {t(
              "stock.form.categoryFr",
            )}{" "}
            *

            <input
              type="text"
              name="category"
              value={
                formData.category
              }
              onChange={
                handleChange
              }
              placeholder={t(
                "stock.form.categoryFrPlaceholder",
              )}
              className={
                inputClassName
              }
              dir="ltr"
            />
          </label>

          <label
            className={`${labelClassName} md:col-span-2`}
          >
            {t(
              "stock.form.locationFr",
            )}{" "}
            *

            <input
              type="text"
              name="location"
              value={
                formData.location
              }
              onChange={
                handleChange
              }
              placeholder={t(
                "stock.form.locationFrPlaceholder",
              )}
              className={
                inputClassName
              }
              dir="ltr"
            />
          </label>
        </div>
      </div>

      {/* AR */}

      <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50/40 p-4 dark:border-orange-500/20 dark:bg-orange-500/5 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-lg bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
            AR
          </span>

          <h3 className="font-semibold text-slate-900 dark:text-white">
            {t(
              "stock.form.arabicInformation",
            )}
          </h3>
        </div>

        <div
          className="grid gap-5 md:grid-cols-2"
          dir="rtl"
        >
          <label
            className={
              labelClassName
            }
          >
            {t(
              "stock.form.designationAr",
            )}{" "}
            *

            <input
              type="text"
              name="designationAr"
              value={
                formData.designationAr
              }
              onChange={
                handleChange
              }
              placeholder={t(
                "stock.form.designationArPlaceholder",
              )}
              className={`${inputClassName} text-right`}
              dir="rtl"
            />
          </label>

          <label
            className={
              labelClassName
            }
          >
            {t(
              "stock.form.categoryAr",
            )}{" "}
            *

            <input
              type="text"
              name="categoryAr"
              value={
                formData.categoryAr
              }
              onChange={
                handleChange
              }
              placeholder={t(
                "stock.form.categoryArPlaceholder",
              )}
              className={`${inputClassName} text-right`}
              dir="rtl"
            />
          </label>

          <label
            className={`${labelClassName} md:col-span-2`}
          >
            {t(
              "stock.form.locationAr",
            )}{" "}
            *

            <input
              type="text"
              name="locationAr"
              value={
                formData.locationAr
              }
              onChange={
                handleChange
              }
              placeholder={t(
                "stock.form.locationArPlaceholder",
              )}
              className={`${inputClassName} text-right`}
              dir="rtl"
            />
          </label>
        </div>
      </div>

      {/* STOCK */}

      <div className="mt-7">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {t(
            "stock.form.stockInformation",
          )}
        </h2>
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <label
          className={
            labelClassName
          }
        >
          {t(
            "stock.form.quantity",
          )}{" "}
          *

          <input
            type="number"
            min="0"
            name="quantity"
            value={
              formData.quantity
            }
            onChange={
              handleChange
            }
            className={
              inputClassName
            }
          />
        </label>

        <label
          className={
            labelClassName
          }
        >
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
            onChange={
              handleChange
            }
            className={
              inputClassName
            }
          />
        </label>
      </div>

      <div className="mt-7 flex justify-end rtl:justify-start">
        <button
          type="submit"
          disabled={
            loading
          }
          className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
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