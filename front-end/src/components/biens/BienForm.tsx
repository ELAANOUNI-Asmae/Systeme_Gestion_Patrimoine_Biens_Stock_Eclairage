import {
  FileText,
  Plus,
  Trash2,
} from "lucide-react";

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
  BienDocument,
  BienFormData,
  DocumentType,
} from "../../types/bien";

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

const documentTypes: DocumentType[] = [
  "INVOICE",
  "RECEIPT",
  "CONTRACT",
  "REGISTRATION",
  "INSURANCE",
  "CERTIFICATE",
  "PHOTO",
  "OTHER",
];

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

  const [documentName, setDocumentName] =
    useState("");

  const [documentType, setDocumentType] =
    useState<DocumentType>("INVOICE");

  const [selectedFileName, setSelectedFileName] =
    useState("");

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } =
      event.target;

    setFormData(
      (previous) => ({
        ...previous,

        [name]:
          name === "purchaseValue"
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
          ? previous.vehicleDetails ?? {}
          : undefined,

      machineDetails:
        type === "MACHINE"
          ? previous.machineDetails ?? {}
          : undefined,

      realEstateDetails:
        type === "REAL_ESTATE"
          ? previous.realEstateDetails ?? {}
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

  const addDocument = () => {
    if (
      !documentName.trim() ||
      !selectedFileName
    ) {
      return;
    }

    const newDocument: BienDocument = {
      id: Date.now(),

      name: documentName.trim(),

      type: documentType,

      fileName: selectedFileName,

      uploadDate: new Date()
        .toISOString()
        .slice(0, 10),
    };

    setFormData((previous) => ({
      ...previous,

      documents: [
        ...previous.documents,
        newDocument,
      ],
    }));

    setDocumentName("");
    setDocumentType("INVOICE");
    setSelectedFileName("");
  };

  const removeDocument = (
    documentId: number,
  ) => {
    setFormData((previous) => ({
      ...previous,

      documents:
        previous.documents.filter(
          (document) =>
            document.id !==
            documentId,
        ),
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

    if (formData.purchaseValue <= 0) {
      setError(
        t("biens.form.invalidValue"),
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
            {t("biens.form.type")} *

            <select
              value={formData.type}
              onChange={handleTypeChange}
              className={inputClassName}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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

      {/* DOCUMENTS */}

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <div className="flex items-center gap-3">
          <FileText className="text-orange-600 dark:text-orange-400" />

          <h2 className="font-bold text-slate-900 dark:text-white">
            {t(
              "biens.form.documents",
            )}
          </h2>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_200px_1fr_auto]">
          <input
            type="text"
            value={documentName}
            onChange={(event) =>
              setDocumentName(
                event.target.value,
              )
            }
            placeholder={t(
              "biens.form.documentName",
            )}
            className={inputClassName}
          />

          <select
            value={documentType}
            onChange={(event) =>
              setDocumentType(
                event.target
                  .value as DocumentType,
              )
            }
            className={inputClassName}
          >
            {documentTypes.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {t(
                    `biens.documentTypes.${type}`,
                  )}
                </option>
              ),
            )}
          </select>

          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(event) =>
              setSelectedFileName(
                event.target
                  .files?.[0]
                  ?.name ?? "",
              )
            }
            className="mt-1 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />

          <button
            type="button"
            onClick={addDocument}
            disabled={
              !documentName.trim() ||
              !selectedFileName
            }
            className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40 dark:bg-orange-600 dark:hover:bg-orange-700"
          >
            <Plus size={17} />

            {t(
              "biens.form.addDocument",
            )}
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {formData.documents.length ===
          0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              {t(
                "biens.form.noDocuments",
              )}
            </p>
          ) : (
            formData.documents.map(
              (document) => (
                <div
                  key={document.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {document.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {t(
                        `biens.documentTypes.${document.type}`,
                      )}
                      {" · "}
                      {
                        document.fileName
                      }
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeDocument(
                        document.id,
                      )
                    }
                    className="inline-flex items-center gap-2 text-sm font-semibold text-red-600"
                  >
                    <Trash2
                      size={16}
                    />

                    {t(
                      "biens.form.removeDocument",
                    )}
                  </button>
                </div>
              ),
            )
          )}
        </div>
      </article>

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