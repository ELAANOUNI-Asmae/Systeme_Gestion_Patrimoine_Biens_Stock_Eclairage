import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { useTranslation } from "react-i18next";

import {
  assetStatuses,
  assetTypes,
} from "../../mock/biens";

import type {
  BienFormData,
} from "../../types/bien";

import DocumentManager from "../documents/DocumentManager";

type BienFormProps = {
  initialValues?: BienFormData;

  submitLabel: string;

  loading?: boolean;

  onSubmit: (
    data: BienFormData,
  ) => Promise<void> | void;
};

const emptyValues: BienFormData = {
  type: "VEHICLE",

  designation: "",
  designationAr: "",

  assetStatus: "AVAILABLE",

  acquisitionDate: "",
  purchaseValue: 0,

  assignment: "",
  assignmentAr: "",

  inventoryId: "",

  documents: [],

  vehicleDetails: {},
};

function BienForm({
  initialValues = emptyValues,
  submitLabel,
  loading = false,
  onSubmit,
}: BienFormProps) {
  const { t } = useTranslation();

  const [formData, setFormData] =
    useState<BienFormData>(
      initialValues,
    );

  const [error, setError] =
    useState("");

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement
    >,
  ) => {
    const { name, value } =
      event.target;

    setFormData(
      (previous) => ({
        ...previous,

        [name]:
          name ===
          "purchaseValue"
            ? Number(value)
            : value,
      }),
    );

    setError("");
  };

  const handleTypeChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const type =
      event.target
        .value as BienFormData["type"];

    setFormData((previous) => ({
      ...previous,

      type,

      vehicleDetails:
        type === "VEHICLE"
          ? previous.vehicleDetails ??
            {}
          : undefined,

      machineDetails:
        type === "MACHINE"
          ? previous.machineDetails ??
            {}
          : undefined,

      realEstateDetails:
        type === "REAL_ESTATE"
          ? previous.realEstateDetails ??
            {}
          : undefined,
    }));
  };

  const updateVehicle = (
    field: string,
    value: string | number,
  ) => {
    setFormData((previous) => ({
      ...previous,

      vehicleDetails: {
        ...previous.vehicleDetails,

        [field]: value,
      },
    }));
  };

  const updateMachine = (
    field: string,
    value: string,
  ) => {
    setFormData((previous) => ({
      ...previous,

      machineDetails: {
        ...previous.machineDetails,

        [field]: value,
      },
    }));
  };

  const updateRealEstate = (
    field: string,
    value: string | number,
  ) => {
    setFormData((previous) => ({
      ...previous,

      realEstateDetails: {
        ...previous.realEstateDetails,

        [field]: value,
      },
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !formData.designation.trim() ||
      !formData.designationAr.trim() ||
      !formData.acquisitionDate ||
      !formData.assignment.trim() ||
      !formData.assignmentAr.trim() ||
      !formData.inventoryId.trim()
    ) {
      setError(
        t("biens.form.required"),
      );

      return;
    }

    if (
      formData.purchaseValue <= 0
    ) {
      setError(
        t(
          "biens.form.invalidValue",
        ),
      );

      return;
    }

    setError("");

    await onSubmit({
      ...formData,

      designation:
        formData.designation.trim(),

      designationAr:
        formData.designationAr.trim(),

      assignment:
        formData.assignment.trim(),

      assignmentAr:
        formData.assignmentAr.trim(),

      inventoryId:
        formData.inventoryId
          .trim()
          .toUpperCase(),
    });
  };

  const inputClassName =
    "mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

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

      {/* GENERAL INFORMATION */}

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "biens.form.type",
            )}{" "}
            *

            <select
              value={formData.type}
              onChange={
                handleTypeChange
              }
              className={
                inputClassName
              }
            >
              {assetTypes.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {t(
                      `biens.types.${type}`,
                    )}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "biens.form.inventoryId",
            )}{" "}
            *

            <input
              type="text"
              name="inventoryId"
              value={
                formData.inventoryId
              }
              onChange={
                handleChange
              }
              placeholder="INV-2026-001"
              className={
                inputClassName
              }
            />
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "biens.form.designation",
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

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "biens.form.designationAr",
            )}{" "}
            *

            <input
              type="text"
              dir="rtl"
              name="designationAr"
              value={
                formData.designationAr
              }
              onChange={
                handleChange
              }
              className={
                inputClassName
              }
            />
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "biens.form.status",
            )}{" "}
            *

            <select
              name="assetStatus"
              value={
                formData.assetStatus
              }
              onChange={
                handleChange
              }
              className={
                inputClassName
              }
            >
              {assetStatuses.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {t(
                      `biens.statuses.${status}`,
                    )}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "biens.form.acquisitionDate",
            )}{" "}
            *

            <input
              type="date"
              name="acquisitionDate"
              value={
                formData.acquisitionDate
              }
              onChange={
                handleChange
              }
              className={
                inputClassName
              }
            />
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "biens.form.purchaseValue",
            )}{" "}
            *

            <input
              type="number"
              min="0"
              step="0.01"
              name="purchaseValue"
              value={
                formData.purchaseValue
              }
              onChange={
                handleChange
              }
              className={
                inputClassName
              }
            />
          </label>

          <div />

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "biens.form.assignment",
            )}{" "}
            *

            <input
              type="text"
              name="assignment"
              value={
                formData.assignment
              }
              onChange={
                handleChange
              }
              className={
                inputClassName
              }
            />
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "biens.form.assignmentAr",
            )}{" "}
            *

            <input
              type="text"
              dir="rtl"
              name="assignmentAr"
              value={
                formData.assignmentAr
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
      </article>

      {/* VEHICLE */}

      {formData.type ===
        "VEHICLE" && (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
          <h2 className="font-bold text-slate-900 dark:text-white">
            {t(
              "biens.form.vehicleSection",
            )}
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t(
                "biens.form.registrationNumber",
              )}

              <input
                type="text"
                value={
                  formData
                    .vehicleDetails
                    ?.registrationNumber ??
                  ""
                }
                onChange={(event) =>
                  updateVehicle(
                    "registrationNumber",
                    event.target
                      .value,
                  )
                }
                className={
                  inputClassName
                }
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t(
                "biens.form.brand",
              )}

              <input
                type="text"
                value={
                  formData
                    .vehicleDetails
                    ?.brand ?? ""
                }
                onChange={(event) =>
                  updateVehicle(
                    "brand",
                    event.target
                      .value,
                  )
                }
                className={
                  inputClassName
                }
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t(
                "biens.form.model",
              )}

              <input
                type="text"
                value={
                  formData
                    .vehicleDetails
                    ?.model ?? ""
                }
                onChange={(event) =>
                  updateVehicle(
                    "model",
                    event.target
                      .value,
                  )
                }
                className={
                  inputClassName
                }
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t(
                "biens.form.year",
              )}

              <input
                type="number"
                value={
                  formData
                    .vehicleDetails
                    ?.year ?? ""
                }
                onChange={(event) =>
                  updateVehicle(
                    "year",
                    Number(
                      event.target
                        .value,
                    ),
                  )
                }
                className={
                  inputClassName
                }
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
              {t(
                "biens.form.chassisNumber",
              )}

              <input
                type="text"
                value={
                  formData
                    .vehicleDetails
                    ?.chassisNumber ??
                  ""
                }
                onChange={(event) =>
                  updateVehicle(
                    "chassisNumber",
                    event.target
                      .value,
                  )
                }
                className={
                  inputClassName
                }
              />
            </label>
          </div>
        </article>
      )}

      {/* MACHINE */}

      {formData.type ===
        "MACHINE" && (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
          <h2 className="font-bold text-slate-900 dark:text-white">
            {t(
              "biens.form.machineSection",
            )}
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {[
              [
                "brand",
                "biens.form.brand",
              ],
              [
                "model",
                "biens.form.model",
              ],
              [
                "serialNumber",
                "biens.form.serialNumber",
              ],
              [
                "technicalReference",
                "biens.form.technicalReference",
              ],
            ].map(
              ([field, label]) => (
                <label
                  key={field}
                  className="text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  {t(label)}

                  <input
                    type="text"
                    value={
                      formData
                        .machineDetails?.[
                        field as keyof NonNullable<
                          BienFormData["machineDetails"]
                        >
                      ] ?? ""
                    }
                    onChange={(
                      event,
                    ) =>
                      updateMachine(
                        field,
                        event.target
                          .value,
                      )
                    }
                    className={
                      inputClassName
                    }
                  />
                </label>
              ),
            )}
          </div>
        </article>
      )}

      {/* REAL ESTATE */}

      {formData.type ===
        "REAL_ESTATE" && (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
          <h2 className="font-bold text-slate-900 dark:text-white">
            {t(
              "biens.form.realEstateSection",
            )}
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t(
                "biens.form.address",
              )}

              <input
                type="text"
                value={
                  formData
                    .realEstateDetails
                    ?.address ?? ""
                }
                onChange={(event) =>
                  updateRealEstate(
                    "address",
                    event.target
                      .value,
                  )
                }
                className={
                  inputClassName
                }
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t(
                "biens.form.surface",
              )}

              <input
                type="number"
                min="0"
                value={
                  formData
                    .realEstateDetails
                    ?.surface ?? ""
                }
                onChange={(event) =>
                  updateRealEstate(
                    "surface",
                    Number(
                      event.target
                        .value,
                    ),
                  )
                }
                className={
                  inputClassName
                }
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t(
                "biens.form.landTitleNumber",
              )}

              <input
                type="text"
                value={
                  formData
                    .realEstateDetails
                    ?.landTitleNumber ??
                  ""
                }
                onChange={(event) =>
                  updateRealEstate(
                    "landTitleNumber",
                    event.target
                      .value,
                  )
                }
                className={
                  inputClassName
                }
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t(
                "biens.form.propertyType",
              )}

              <input
                type="text"
                value={
                  formData
                    .realEstateDetails
                    ?.propertyType ??
                  ""
                }
                onChange={(event) =>
                  updateRealEstate(
                    "propertyType",
                    event.target
                      .value,
                  )
                }
                className={
                  inputClassName
                }
              />
            </label>
          </div>
        </article>
      )}

      {/* COMMON DOCUMENT MANAGER */}

      <DocumentManager
        documents={
          formData.documents
        }
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
                "biens.form.saving",
              )
            : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default BienForm;