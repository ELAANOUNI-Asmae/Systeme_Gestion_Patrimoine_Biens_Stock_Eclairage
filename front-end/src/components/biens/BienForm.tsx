import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { useTranslation } from "react-i18next";

import type {
  AssetType,
  BienFormData,
  RealEstateDomain,
} from "../../types/bien";

type Props = {
  initialValues?: BienFormData;
  mode?: "create" | "edit";
  submitLabel: string;
  loading?: boolean;
  onSubmit: (data: BienFormData) => Promise<void> | void;
};

const types: AssetType[] = [
  "VEHICLE",
  "MACHINE",
  "REAL_ESTATE",
];

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
  mode = "create",
  submitLabel,
  loading = false,
  onSubmit,
}: Props) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const [data, setData] =
    useState<BienFormData>(initialValues);

  const [error, setError] =
    useState("");

  useEffect(() => {
    setData(initialValues);
  }, [initialValues]);

  const setRoot = (
    key: keyof BienFormData,
    value: BienFormData[keyof BienFormData],
  ) => {
    setData((previous) => ({
      ...previous,
      [key]: value,
    }));

    setError("");
  };

  const setType = (
    type: AssetType,
  ) => {
    setData((previous) => ({
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

    setError("");
  };

  const submit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (
      !data.designation.trim() ||
      !data.inventoryId.trim() ||
      !data.acquisitionDate
    ) {
      setError(
        tr(
          "Veuillez remplir tous les champs obligatoires.",
          "يرجى ملء جميع الحقول الإجبارية.",
        ),
      );
      return;
    }

    if (
      !Number.isFinite(data.purchaseValue) ||
      data.purchaseValue <= 0
    ) {
      setError(
        tr(
          "La valeur d’acquisition doit être supérieure à zéro.",
          "يجب أن تكون قيمة الاقتناء أكبر من صفر.",
        ),
      );
      return;
    }

    if (
      mode === "edit" &&
      data.assetStatus === "IN_USE" &&
      !data.assignment.trim()
    ) {
      setError(
        tr(
          "L’affectation est obligatoire lorsque le bien est en service.",
          "الجهة المستعملة إجبارية عندما يكون الممتلك قيد الاستعمال.",
        ),
      );
      return;
    }

    if (data.type === "VEHICLE") {
      const vehicle = data.vehicleDetails;

      if (
        !vehicle?.registrationNumber?.trim() ||
        !vehicle?.chassisNumber?.trim() ||
        !vehicle?.brand?.trim() ||
        !vehicle?.firstRegistrationDate ||
        !vehicle.year ||
        vehicle.year <= 0
      ) {
        setError(
          tr(
            "Veuillez compléter les informations obligatoires du véhicule.",
            "يرجى إكمال المعلومات الإجبارية للمركبة.",
          ),
        );
        return;
      }
    }

    if (data.type === "MACHINE") {
      const machine = data.machineDetails;

      if (
        !machine?.serialNumber?.trim() ||
        !machine?.brand?.trim() ||
        !machine?.model?.trim()
      ) {
        setError(
          tr(
            "Veuillez compléter les informations obligatoires de la machine.",
            "يرجى إكمال المعلومات الإجبارية للآلة.",
          ),
        );
        return;
      }
    }

    if (data.type === "REAL_ESTATE") {
      const realEstate = data.realEstateDetails;

      if (
        !realEstate?.landTitleNumber?.trim() ||
        !realEstate?.cadastralReference?.trim() ||
        !realEstate?.address?.trim() ||
        !realEstate?.propertyType?.trim() ||
        !realEstate.surface ||
        realEstate.surface <= 0
      ) {
        setError(
          tr(
            "Veuillez compléter les informations obligatoires du bien immobilier.",
            "يرجى إكمال المعلومات الإجبارية للعقار.",
          ),
        );
        return;
      }
    }

    await onSubmit({
      ...data,

      designation:
        data.designation.trim(),

      designationAr:
        data.designationAr.trim(),

      inventoryId:
        data.inventoryId
          .trim()
          .toUpperCase(),

      assignment:
        data.assignment.trim(),

      assignmentAr:
        data.assignmentAr.trim(),
    });
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-6"
      noValidate
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      {mode === "create" && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-300">
          {tr(
            "Tout nouveau bien est créé avec le statut « Disponible ».",
            "يتم إنشاء كل ممتلك جديد بالحالة « متاح ».",
          )}
        </div>
      )}

      <Card
        title={tr(
          "Informations générales",
          "المعلومات العامة",
        )}
      >
        <div className="grid gap-5 md:grid-cols-2">
          {mode === "create" ? (
            <SelectField
              label={tr(
                "Type du bien",
                "نوع الممتلك",
              )}
              value={data.type}
              onChange={(value) =>
                setType(value as AssetType)
              }
              options={types.map((value) => ({
                value,
                label: t(`biens.types.${value}`),
              }))}
            />
          ) : (
            <ReadOnlyField
              label={tr(
                "Type du bien",
                "نوع الممتلك",
              )}
              value={t(`biens.types.${data.type}`)}
            />
          )}

          <TextField
            label={tr(
              "Identifiant d’inventaire",
              "رقم الجرد",
            )}
            value={data.inventoryId}
            onChange={(value) =>
              setRoot("inventoryId", value)
            }
            required
          />

          <TextField
            label={tr(
              "Désignation",
              "التسمية",
            )}
            value={data.designation}
            onChange={(value) =>
              setRoot("designation", value)
            }
            required
          />

          <TextField
            type="date"
            label={tr(
              "Date d’acquisition",
              "تاريخ الاقتناء",
            )}
            value={data.acquisitionDate}
            onChange={(value) =>
              setRoot("acquisitionDate", value)
            }
            required
          />

          <TextField
            type="number"
            label={tr(
              "Valeur d’acquisition (DH)",
              "قيمة الاقتناء (درهم)",
            )}
            value={String(data.purchaseValue)}
            onChange={(value) =>
              setRoot("purchaseValue", Number(value))
            }
            required
          />

          {mode === "edit" && (
            <ReadOnlyField
              label={tr(
                "Statut",
                "الحالة",
              )}
              value={t(
                `biens.statuses.${data.assetStatus}`,
              )}
            />
          )}

          {mode === "edit" &&
            data.assetStatus === "IN_USE" && (
              <TextField
                label={tr(
                  "Affectation / utilisateur du bien",
                  "الجهة أو الشخص المستعمل للممتلك",
                )}
                value={data.assignment}
                onChange={(value) =>
                  setRoot("assignment", value)
                }
                required
              />
            )}
        </div>
      </Card>

      {data.type === "VEHICLE" && (
        <Card
          title={tr(
            "Informations du véhicule",
            "معلومات المركبة",
          )}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label={tr(
                "Immatriculation",
                "رقم التسجيل",
              )}
              value={
                data.vehicleDetails?.registrationNumber ?? ""
              }
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  vehicleDetails: {
                    ...previous.vehicleDetails,
                    registrationNumber: value,
                  },
                }))
              }
              required
            />

            <TextField
              label={tr(
                "Marque",
                "العلامة",
              )}
              value={data.vehicleDetails?.brand ?? ""}
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  vehicleDetails: {
                    ...previous.vehicleDetails,
                    brand: value,
                  },
                }))
              }
              required
            />

            <TextField
              type="number"
              label={tr(
                "Année de fabrication",
                "سنة الصنع",
              )}
              value={
                data.vehicleDetails?.year?.toString() ?? ""
              }
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  vehicleDetails: {
                    ...previous.vehicleDetails,
                    year: value
                      ? Number(value)
                      : undefined,
                  },
                }))
              }
              required
            />

            <TextField
              label={tr(
                "Numéro de châssis",
                "رقم الهيكل",
              )}
              value={
                data.vehicleDetails?.chassisNumber ?? ""
              }
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  vehicleDetails: {
                    ...previous.vehicleDetails,
                    chassisNumber: value,
                  },
                }))
              }
              required
            />

            <TextField
              type="number"
              label={tr(
                "Puissance fiscale (CV)",
                "القوة الجبائية (حصان)",
              )}
              value={
                data.vehicleDetails?.fiscalHorsepower?.toString() ??
                ""
              }
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  vehicleDetails: {
                    ...previous.vehicleDetails,
                    fiscalHorsepower: value
                      ? Number(value)
                      : undefined,
                  },
                }))
              }
            />

            <TextField
              type="date"
              label={tr(
                "Date de première mise en circulation",
                "تاريخ أول وضع في السير",
              )}
              value={
                data.vehicleDetails?.firstRegistrationDate ?? ""
              }
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  vehicleDetails: {
                    ...previous.vehicleDetails,
                    firstRegistrationDate:
                      value || undefined,
                  },
                }))
              }
              required
            />

            <TextField
              type="number"
              label={tr(
                "Kilométrage",
                "عداد الكيلومترات",
              )}
              value={
                data.vehicleDetails?.odometer?.toString() ?? ""
              }
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  vehicleDetails: {
                    ...previous.vehicleDetails,
                    odometer: value
                      ? Number(value)
                      : undefined,
                  },
                }))
              }
            />
          </div>
        </Card>
      )}

      {data.type === "MACHINE" && (
        <Card
          title={tr(
            "Informations de la machine",
            "معلومات الآلة",
          )}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label={tr(
                "Marque",
                "العلامة",
              )}
              value={data.machineDetails?.brand ?? ""}
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  machineDetails: {
                    ...previous.machineDetails,
                    brand: value,
                  },
                }))
              }
              required
            />

            <TextField
              label={tr(
                "Modèle",
                "الطراز",
              )}
              value={data.machineDetails?.model ?? ""}
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  machineDetails: {
                    ...previous.machineDetails,
                    model: value,
                  },
                }))
              }
              required
            />

            <TextField
              label={tr(
                "Numéro de série",
                "الرقم التسلسلي",
              )}
              value={
                data.machineDetails?.serialNumber ?? ""
              }
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  machineDetails: {
                    ...previous.machineDetails,
                    serialNumber: value,
                  },
                }))
              }
              required
            />

            <TextField
              label={tr(
                "Référence technique",
                "المرجع التقني",
              )}
              value={
                data.machineDetails?.technicalReference ?? ""
              }
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  machineDetails: {
                    ...previous.machineDetails,
                    technicalReference: value,
                  },
                }))
              }
            />

            <TextField
              type="number"
              label={tr(
                "Puissance",
                "القدرة",
              )}
              value={
                data.machineDetails?.powerKw?.toString() ?? ""
              }
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  machineDetails: {
                    ...previous.machineDetails,
                    powerKw: value
                      ? Number(value)
                      : undefined,
                  },
                }))
              }
            />
          </div>
        </Card>
      )}

      {data.type === "REAL_ESTATE" && (
        <Card
          title={tr(
            "Informations du bien immobilier",
            "معلومات العقار",
          )}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label={tr(
                "Localisation GPS",
                "الموقع GPS",
              )}
              value={
                data.realEstateDetails?.address ?? ""
              }
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  realEstateDetails: {
                    ...previous.realEstateDetails,
                    address: value,
                  },
                }))
              }
              required
            />

            <TextField
              type="number"
              label={tr(
                "Superficie (m²)",
                "المساحة (م²)",
              )}
              value={
                data.realEstateDetails?.surface?.toString() ??
                ""
              }
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  realEstateDetails: {
                    ...previous.realEstateDetails,
                    surface: value
                      ? Number(value)
                      : undefined,
                  },
                }))
              }
              required
            />

            <TextField
              label={tr(
                "Numéro du titre foncier",
                "رقم الرسم العقاري",
              )}
              value={
                data.realEstateDetails?.landTitleNumber ?? ""
              }
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  realEstateDetails: {
                    ...previous.realEstateDetails,
                    landTitleNumber: value,
                  },
                }))
              }
              required
            />

            <TextField
              label={tr(
                "Type immobilier",
                "نوع العقار",
              )}
              value={
                data.realEstateDetails?.propertyType ?? ""
              }
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  realEstateDetails: {
                    ...previous.realEstateDetails,
                    propertyType: value,
                  },
                }))
              }
              required
            />

            <TextField
              label={tr(
                "Référence cadastrale",
                "المرجع المساحي",
              )}
              value={
                data.realEstateDetails?.cadastralReference ?? ""
              }
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  realEstateDetails: {
                    ...previous.realEstateDetails,
                    cadastralReference: value,
                  },
                }))
              }
              required
            />

            <SelectField
              label={tr(
                "Domaine",
                "المجال",
              )}
              value={
                data.realEstateDetails?.domain ?? ""
              }
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  realEstateDetails: {
                    ...previous.realEstateDetails,
                    domain: value
                      ? (value as RealEstateDomain)
                      : undefined,
                  },
                }))
              }
              options={[
                {
                  value: "",
                  label: "—",
                },
                {
                  value: "PUBLIC",
                  label: tr(
                    "Domaine public",
                    "الملك العام",
                  ),
                },
                {
                  value: "PRIVATE",
                  label: tr(
                    "Domaine privé",
                    "الملك الخاص",
                  ),
                },
              ]}
            />
          </div>
        </Card>
      )}

      <div className="flex justify-end rtl:justify-start">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? tr(
                "Enregistrement...",
                "جارٍ الحفظ...",
              )
            : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
      <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h2>

      {children}
    </section>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </p>

      <div className="mt-1 flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
        {value || "—"}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "date";
  required?: boolean;
}) {
  return (
    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}

      {required && (
        <span className="ms-1 text-red-500">
          *
        </span>
      )}

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-900"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-900"
      >
        {options.map((option) => (
          <option
            key={option.value || "empty"}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default BienForm;
