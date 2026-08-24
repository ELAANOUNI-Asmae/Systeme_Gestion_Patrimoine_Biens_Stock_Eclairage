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
  LightFormData,
  LightStatus,
} from "../../types/lighting";

type LightFormProps = {
  initialValues?: LightFormData;

  submitLabel: string;

  loading?: boolean;

  onSubmit: (
    data: LightFormData,
  ) => Promise<void> | void;
};

const emptyValues: LightFormData = {
  reference: "",

  designation: "",
  designationAr: "",

  zone: "",
  zoneAr: "",

  address: "",
  addressAr: "",

  latitude: 30.4208,
  longitude: -9.5981,

  status: "ACTIVE",

  installationDate: "",

  power: 0,
};

const statuses: LightStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "DAMAGED",
  "UNDER_MAINTENANCE",
];

function LightForm({
  initialValues = emptyValues,
  submitLabel,
  loading = false,
  onSubmit,
}: LightFormProps) {
  const {
    t,
  } = useTranslation();

  const [
    formData,
    setFormData,
  ] =
    useState<LightFormData>(
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
      (previous) => ({
        ...previous,

        [name]:
          name === "power" ||
          name === "latitude" ||
          name === "longitude"
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
        !formData.zone.trim() ||
        !formData.zoneAr.trim() ||
        !formData.address.trim() ||
        !formData.addressAr.trim() ||
        !formData.installationDate
      ) {
        setError(
          t(
            "lighting.form.required",
          ),
        );

        return;
      }

      if (
        formData.power <= 0
      ) {
        setError(
          t(
            "lighting.form.invalidPower",
          ),
        );

        return;
      }

      if (
        !Number.isFinite(
          formData.latitude,
        ) ||
        formData.latitude <
          -90 ||
        formData.latitude >
          90
      ) {
        setError(
          t(
            "lighting.form.invalidLatitude",
          ),
        );

        return;
      }

      if (
        !Number.isFinite(
          formData.longitude,
        ) ||
        formData.longitude <
          -180 ||
        formData.longitude >
          180
      ) {
        setError(
          t(
            "lighting.form.invalidLongitude",
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

        zone:
          formData.zone.trim(),

        zoneAr:
          formData.zoneAr.trim(),

        address:
          formData.address.trim(),

        addressAr:
          formData.addressAr.trim(),
      });
    };

  const inputClassName =
    "mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20";

  const labelClassName =
    "text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6"
    >
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* INFORMATIONS GENERALES */}

      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {t(
            "lighting.form.generalInformation",
          )}
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t(
            "lighting.form.generalDescription",
          )}
        </p>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <label
          className={
            labelClassName
          }
        >
          {t(
            "lighting.form.reference",
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
            placeholder="LMP-001"
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
            "lighting.form.status",
          )}{" "}
          *

          <select
            name="status"
            value={
              formData.status
            }
            onChange={
              handleChange
            }
            className={
              inputClassName
            }
          >
            {statuses.map(
              (status) => (
                <option
                  key={
                    status
                  }
                  value={
                    status
                  }
                >
                  {t(
                    `lighting.statuses.${status}`,
                  )}
                </option>
              ),
            )}
          </select>
        </label>

        <label
          className={
            labelClassName
          }
        >
          {t(
            "lighting.form.designationFr",
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
            "lighting.form.designationAr",
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
            dir="rtl"
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
            "lighting.form.zoneFr",
          )}{" "}
          *

          <input
            type="text"
            name="zone"
            value={
              formData.zone
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
            "lighting.form.zoneAr",
          )}{" "}
          *

          <input
            type="text"
            name="zoneAr"
            value={
              formData.zoneAr
            }
            onChange={
              handleChange
            }
            dir="rtl"
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
            "lighting.form.addressFr",
          )}{" "}
          *

          <input
            type="text"
            name="address"
            value={
              formData.address
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
            "lighting.form.addressAr",
          )}{" "}
          *

          <input
            type="text"
            name="addressAr"
            value={
              formData.addressAr
            }
            onChange={
              handleChange
            }
            dir="rtl"
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
            "lighting.form.installationDate",
          )}{" "}
          *

          <input
            type="date"
            name="installationDate"
            value={
              formData.installationDate
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
            "lighting.form.power",
          )}{" "}
          *

          <div className="relative">
            <input
              type="number"
              min="1"
              step="1"
              name="power"
              value={
                formData.power
              }
              onChange={
                handleChange
              }
              className={`${inputClassName} pe-12`}
            />

            <span className="pointer-events-none absolute inset-e-3 top-1/2 mt-0.5 -translate-y-1/2 text-sm text-slate-400">
              W
            </span>
          </div>
        </label>
      </div>

      {/* GPS */}

      <div className="my-7 border-t border-slate-200 dark:border-slate-700" />

      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {t(
            "lighting.form.locationTitle",
          )}
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t(
            "lighting.form.locationDescription",
          )}
        </p>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <label
          className={
            labelClassName
          }
        >
          {t(
            "lighting.form.latitude",
          )}{" "}
          *

          <input
            type="number"
            name="latitude"
            value={
              formData.latitude
            }
            onChange={
              handleChange
            }
            min="-90"
            max="90"
            step="any"
            placeholder="30.4208"
            className={
              inputClassName
            }
          />

          <span className="mt-1 block text-xs font-normal text-slate-400">
            -90 → 90
          </span>
        </label>

        <label
          className={
            labelClassName
          }
        >
          {t(
            "lighting.form.longitude",
          )}{" "}
          *

          <input
            type="number"
            name="longitude"
            value={
              formData.longitude
            }
            onChange={
              handleChange
            }
            min="-180"
            max="180"
            step="any"
            placeholder="-9.5981"
            className={
              inputClassName
            }
          />

          <span className="mt-1 block text-xs font-normal text-slate-400">
            -180 → 180
          </span>
        </label>
      </div>

      <div className="mt-7 flex justify-end">
        <button
          type="submit"
          disabled={
            loading
          }
          className="inline-flex min-w-40 items-center justify-center rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? t(
                "lighting.form.saving",
              )
            : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default LightForm;