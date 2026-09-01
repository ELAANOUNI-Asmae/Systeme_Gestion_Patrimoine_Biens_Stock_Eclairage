
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useTranslation } from "react-i18next";

import type {
  AssetStatus,
  AssetType,
  BienFormData,
  RealEstateDomain,
} from "../../types/bien";

import DocumentManager from "../documents/DocumentManager";

type Props = {
  initialValues?: BienFormData;
  mode?: "create" | "edit";
  submitLabel: string;
  loading?: boolean;
  onSubmit: (data: BienFormData) => Promise<void> | void;
};

const activeStatuses: AssetStatus[] = [
  "AVAILABLE",
  "IN_USE",
  "RENTED",
  "UNDER_MAINTENANCE",
  "OUT_OF_SERVICE",
  "DAMAGED",
];

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
  const [error, setError] = useState("");

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

  const setStatus = (status: AssetStatus) => {
    setData((previous) => ({
      ...previous,
      assetStatus: status,
      assignment:
        status === "IN_USE" ? previous.assignment : "",
      assignmentAr:
        status === "IN_USE" ? previous.assignmentAr : "",
    }));
  };

  const setType = (type: AssetType) => {
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
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (
      !data.designation.trim() ||
      !data.designationAr.trim() ||
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

    if (data.purchaseValue <= 0) {
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
      (!data.assignment.trim() ||
        !data.assignmentAr.trim())
    ) {
      setError(
        tr(
          "L’affectation en français et en arabe est obligatoire lorsque le bien est en service.",
          "الجهة المستعملة بالفرنسية والعربية إجبارية عندما يكون الممتلك قيد الاستعمال.",
        ),
      );
      return;
    }

    const status =
      mode === "create" ? "AVAILABLE" : data.assetStatus;

    await onSubmit({
      ...data,
      assetStatus: status,
      designation: data.designation.trim(),
      designationAr: data.designationAr.trim(),
      inventoryId: data.inventoryId.trim().toUpperCase(),
      assignment:
        status === "IN_USE" ? data.assignment.trim() : "",
      assignmentAr:
        status === "IN_USE" ? data.assignmentAr.trim() : "",
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      {mode === "create" && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-300">
          {tr(
            "Tout nouveau bien est créé automatiquement avec le statut « Disponible ». Le statut pourra être modifié ensuite.",
            "يتم إنشاء كل ممتلك جديد تلقائياً بالحالة « متاح »، ويمكن تغيير الحالة لاحقاً.",
          )}
        </div>
      )}

      <Card title={tr("Informations générales", "المعلومات العامة")}>
        <div className="grid gap-5 md:grid-cols-2">
          <SelectField
            label={tr("Type du bien", "نوع الممتلك")}
            value={data.type}
            onChange={(value) => setType(value as AssetType)}
            options={types.map((value) => ({
              value,
              label: t(`biens.types.${value}`),
            }))}
          />

          <TextField
            label={tr("Identifiant d’inventaire", "رقم الجرد")}
            value={data.inventoryId}
            onChange={(value) => setRoot("inventoryId", value)}
            required
          />

          <TextField
            label={tr("Désignation", "التسمية بالفرنسية")}
            value={data.designation}
            onChange={(value) => setRoot("designation", value)}
            required
          />

          <TextField
            label={tr("Désignation en arabe", "التسمية بالعربية")}
            value={data.designationAr}
            onChange={(value) => setRoot("designationAr", value)}
            dir="rtl"
            required
          />

          <TextField
            type="date"
            label={tr("Date d’acquisition", "تاريخ الاقتناء")}
            value={data.acquisitionDate}
            onChange={(value) => setRoot("acquisitionDate", value)}
            required
          />

          <TextField
            type="number"
            label={tr("Valeur d’acquisition (DH)", "قيمة الاقتناء (درهم)")}
            value={String(data.purchaseValue)}
            onChange={(value) =>
              setRoot("purchaseValue", Number(value))
            }
            required
          />

          {mode === "edit" && (
            <SelectField
              label={tr("Statut", "الحالة")}
              value={data.assetStatus}
              onChange={(value) => setStatus(value as AssetStatus)}
              options={activeStatuses.map((value) => ({
                value,
                label: t(`biens.statuses.${value}`),
              }))}
            />
          )}

          {mode === "edit" &&
            data.assetStatus === "IN_USE" && (
              <>
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

                <TextField
                  label={tr(
                    "Affectation en arabe",
                    "الجهة المستعملة بالعربية",
                  )}
                  value={data.assignmentAr}
                  onChange={(value) =>
                    setRoot("assignmentAr", value)
                  }
                  dir="rtl"
                  required
                />
              </>
            )}
        </div>
      </Card>

      {data.type === "VEHICLE" && (
        <Card title={tr("Informations du véhicule", "معلومات المركبة")}>
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label={tr("Immatriculation", "رقم التسجيل")}
              value={data.vehicleDetails?.registrationNumber ?? ""}
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  vehicleDetails: {
                    ...previous.vehicleDetails,
                    registrationNumber: value,
                  },
                }))
              }
            />
            <TextField
              label={tr("Marque", "العلامة")}
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
            />
            <TextField
              label={tr("Modèle", "الطراز")}
              value={data.vehicleDetails?.model ?? ""}
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  vehicleDetails: {
                    ...previous.vehicleDetails,
                    model: value,
                  },
                }))
              }
            />
            <TextField
              type="number"
              label={tr("Année", "السنة")}
              value={data.vehicleDetails?.year?.toString() ?? ""}
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  vehicleDetails: {
                    ...previous.vehicleDetails,
                    year: value ? Number(value) : undefined,
                  },
                }))
              }
            />
            <TextField
              label={tr("Numéro de châssis", "رقم الهيكل")}
              value={data.vehicleDetails?.chassisNumber ?? ""}
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  vehicleDetails: {
                    ...previous.vehicleDetails,
                    chassisNumber: value,
                  },
                }))
              }
            />
            <TextField
              type="number"
              label={tr(
                "Puissance fiscale (CV)",
                "القوة الجبائية (حصان)",
              )}
              value={
                data.vehicleDetails?.fiscalHorsepower?.toString() ?? ""
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
              value={data.vehicleDetails?.firstRegistrationDate ?? ""}
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  vehicleDetails: {
                    ...previous.vehicleDetails,
                    firstRegistrationDate: value || undefined,
                  },
                }))
              }
            />
          </div>
        </Card>
      )}

      {data.type === "MACHINE" && (
        <Card title={tr("Informations de la machine", "معلومات الآلة")}>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              ["brand", tr("Marque", "العلامة")],
              ["model", tr("Modèle", "الطراز")],
              ["serialNumber", tr("Numéro de série", "الرقم التسلسلي")],
              [
                "technicalReference",
                tr("Référence technique", "المرجع التقني"),
              ],
            ].map(([key, label]) => (
              <TextField
                key={key}
                label={label}
                value={
                  String(
                    data.machineDetails?.[
                      key as keyof NonNullable<
                        BienFormData["machineDetails"]
                      >
                    ] ?? "",
                  )
                }
                onChange={(value) =>
                  setData((previous) => ({
                    ...previous,
                    machineDetails: {
                      ...previous.machineDetails,
                      [key]: value,
                    },
                  }))
                }
              />
            ))}

            <TextField
              type="number"
              label={tr("Puissance (kW)", "القدرة (كيلوواط)")}
              value={data.machineDetails?.powerKw?.toString() ?? ""}
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  machineDetails: {
                    ...previous.machineDetails,
                    powerKw: value ? Number(value) : undefined,
                  },
                }))
              }
            />
          </div>
        </Card>
      )}

      {data.type === "REAL_ESTATE" && (
        <Card title={tr("Informations du bien immobilier", "معلومات العقار")}>
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label={tr("Adresse", "العنوان")}
              value={data.realEstateDetails?.address ?? ""}
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  realEstateDetails: {
                    ...previous.realEstateDetails,
                    address: value,
                  },
                }))
              }
            />
            <TextField
              type="number"
              label={tr("Superficie (m²)", "المساحة (م²)")}
              value={data.realEstateDetails?.surface?.toString() ?? ""}
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  realEstateDetails: {
                    ...previous.realEstateDetails,
                    surface: value ? Number(value) : undefined,
                  },
                }))
              }
            />
            <TextField
              label={tr("Numéro du titre foncier", "رقم الرسم العقاري")}
              value={data.realEstateDetails?.landTitleNumber ?? ""}
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  realEstateDetails: {
                    ...previous.realEstateDetails,
                    landTitleNumber: value,
                  },
                }))
              }
            />
            <TextField
              label={tr("Type de propriété", "نوع الملكية")}
              value={data.realEstateDetails?.propertyType ?? ""}
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  realEstateDetails: {
                    ...previous.realEstateDetails,
                    propertyType: value,
                  },
                }))
              }
            />
            <TextField
              label={tr("Référence cadastrale", "المرجع المساحي")}
              value={data.realEstateDetails?.cadastralReference ?? ""}
              onChange={(value) =>
                setData((previous) => ({
                  ...previous,
                  realEstateDetails: {
                    ...previous.realEstateDetails,
                    cadastralReference: value,
                  },
                }))
              }
            />
            <SelectField
              label={tr("Domaine", "المجال")}
              value={data.realEstateDetails?.domain ?? ""}
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
                  label: tr("Domaine public", "الملك العام"),
                },
                {
                  value: "PRIVATE",
                  label: tr("Domaine privé", "الملك الخاص"),
                },
              ]}
            />
          </div>
        </Card>
      )}

      <DocumentManager
        documents={data.documents}
        onChange={(documents) =>
          setData((previous) => ({
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
          {loading ? tr("Enregistrement...", "جارٍ الحفظ...") : submitLabel}
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
  children: React.ReactNode;
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

function TextField({
  label,
  value,
  onChange,
  type = "text",
  dir,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "date";
  dir?: "ltr" | "rtl";
  required?: boolean;
}) {
  return (
    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
      {label} {required && <span className="text-red-500">*</span>}
      <input
        type={type}
        dir={dir}
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
  options: { value: string; label: string }[];
}) {
  return (
    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-900"
      >
        {options.map((option) => (
          <option key={option.value || "empty"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default BienForm;
