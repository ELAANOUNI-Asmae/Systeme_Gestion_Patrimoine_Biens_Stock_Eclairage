import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

import BienForm from "../../components/biens/BienForm";
import DocumentManager from "../../components/documents/DocumentManager";
import { ROUTES } from "../../constants/routes";
import {
  bienApiService,
  mapBackendDocuments,
  type BienApiListItem,
} from "../../services/bienApiService";

import type {
  AssetStatus,
  AssetType,
  BienFormData,
  RealEstateDomain,
} from "../../types/bien";

import type { AppDocument } from "../../types/document";

const manualStatuses: AssetStatus[] = [
  "AVAILABLE",
  "IN_USE",
  "OUT_OF_SERVICE",
  "DAMAGED",
];

const systemManagedStatuses: AssetStatus[] = [
  "RENTED",
  "UNDER_MAINTENANCE",
  "DISPOSED",
  "ARCHIVED",
];

function isAssetType(value: string | null): value is AssetType {
  return (
    value === "VEHICLE" ||
    value === "MACHINE" ||
    value === "REAL_ESTATE"
  );
}

function textValue(
  raw: Record<string, unknown>,
  key: string,
): string {
  const value = raw[key];

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function numberValue(
  raw: Record<string, unknown>,
  key: string,
): number | undefined {
  const value = raw[key];

  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toFormData(
  bien: BienApiListItem,
  type: AssetType,
): BienFormData {
  const raw = bien.raw;

  return {
    type,
    designation: bien.designation === "—" ? "" : bien.designation,
    designationAr: "",
    assetStatus: bien.assetStatus,
    acquisitionDate: bien.acquisitionDate,
    purchaseValue: bien.purchaseValue ?? 0,
    assignment: bien.assignment ?? "",
    assignmentAr: "",
    inventoryId:
      bien.inventoryNumber === "—" ? "" : bien.inventoryNumber,
    documents: [],

    vehicleDetails:
      type === "VEHICLE"
        ? {
            registrationNumber: textValue(raw, "registrationNumber"),
            brand: textValue(raw, "make"),
            year: numberValue(raw, "manufactureYear"),
            chassisNumber: textValue(raw, "chassisNumber"),
            fiscalHorsepower: numberValue(raw, "fiscalHorsepower"),
            firstRegistrationDate: textValue(
              raw,
              "firstRegistrationDate",
            ),
            odometer: numberValue(
              raw,
              "odometer",
            ),
          }
        : undefined,

    machineDetails:
      type === "MACHINE"
        ? {
            brand: textValue(raw, "brand"),
            model: textValue(raw, "model"),
            serialNumber: textValue(raw, "serialNumber"),
            technicalReference: textValue(raw, "technicalRef"),
            powerKw: numberValue(raw, "power"),
          }
        : undefined,

    realEstateDetails:
      type === "REAL_ESTATE"
        ? {
            address: textValue(raw, "gpsLocation"),
            surface: numberValue(raw, "areaM2"),
            landTitleNumber: textValue(raw, "landTitleReference"),
            propertyType: textValue(raw, "realEstateType"),
            cadastralReference: textValue(
              raw,
              "cadastralReference",
            ),
            domain: (textValue(raw, "domain") || undefined) as
              | RealEstateDomain
              | undefined,
          }
        : undefined,
  };
}

function EditBienPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const typeParam = searchParams.get("type");

  const [initialValues, setInitialValues] =
    useState<BienFormData | null>(null);
  const [assetType, setAssetType] = useState<AssetType | null>(null);
  const [originalStatus, setOriginalStatus] =
    useState<AssetStatus | null>(null);
  const [selectedStatus, setSelectedStatus] =
    useState<AssetStatus | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [documents, setDocuments] = useState<AppDocument[]>([]);

  useEffect(() => {
    const load = async () => {
      const assetId = Number(id);

      if (!Number.isFinite(assetId) || assetId <= 0) {
        setError(
          tr(
            "Identifiant du bien invalide.",
            "معرّف الممتلك غير صالح.",
          ),
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        let type: AssetType | undefined;

        if (isAssetType(typeParam)) {
          type = typeParam;
        } else {
          const all = await bienApiService.getAll();
          type = all.find((item) => item.id === assetId)?.type;
        }

        if (!type) {
          throw new Error("ASSET_TYPE_NOT_FOUND");
        }

        const bien = await bienApiService.getById(assetId, type);

        setAssetType(type);
        setInitialValues(toFormData(bien, type));
        setOriginalStatus(bien.assetStatus);
        setSelectedStatus(bien.assetStatus);

        setDocuments(
          mapBackendDocuments(
            bien.raw["documentResponseDtoSet"],
          ),
        );
      } catch (caughtError) {
        console.error("Load asset for edit failed:", caughtError);
        setInitialValues(null);

        setError(
          tr(
            "Impossible de charger les informations complètes de ce bien.",
            "تعذر تحميل المعلومات الكاملة لهذا الممتلك.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, typeParam]);

  const handleSubmit = async (data: BienFormData) => {
    const assetId = Number(id);

    if (
      !assetType ||
      !selectedStatus ||
      !Number.isFinite(assetId) ||
      assetId <= 0
    ) {
      return;
    }

    if (
      selectedStatus === "IN_USE" &&
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

    try {
      setSaving(true);
      setError("");

      const normalizedData: BienFormData = {
        ...data,
        type: assetType,
        assetStatus: selectedStatus,
        assignment:
          selectedStatus === "AVAILABLE"
            ? ""
            : data.assignment,
      };

      // 1) Update the subtype data first.
      await bienApiService.update(
        assetId,
        normalizedData,
      );

      // 2) Status is updated through the dedicated backend endpoint.
      if (
        originalStatus !== selectedStatus &&
        manualStatuses.includes(selectedStatus)
      ) {
        await bienApiService.updateStatus(
          assetId,
          selectedStatus,
        );
      }

      await bienApiService.uploadAssetDocuments(
        assetId,
        documents,
      );

      navigate(
        `/biens/${assetId}?type=${assetType}`,
      );
    } catch (caughtError) {
      console.error("Update asset failed:", caughtError);

      setError(
        tr(
          "Impossible de modifier ce bien ou d’envoyer ses nouveaux documents. Vérifiez les informations et réessayez.",
          "تعذر تعديل هذا الممتلك أو رفع وثائقه الجديدة. تحقق من المعلومات ثم أعد المحاولة.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-800">
        {tr(
          "Chargement du bien...",
          "جارٍ تحميل الممتلك...",
        )}
      </section>
    );
  }

  if (
    !initialValues ||
    !assetType ||
    !selectedStatus
  ) {
    return (
      <section className="mx-auto max-w-4xl space-y-6">
        <Link
          to={ROUTES.BIENS}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600 dark:text-slate-400"
        >
          <ArrowLeft
            size={18}
            className="rtl:rotate-180"
          />

          {tr(
            "Retour aux biens",
            "العودة إلى الممتلكات",
          )}
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          {error ||
            tr(
              "Bien introuvable.",
              "الممتلك غير موجود.",
            )}
        </div>
      </section>
    );
  }

  const statusIsSystemManaged =
    systemManagedStatuses.includes(selectedStatus);

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <Link
        to={`/biens/${id}?type=${assetType}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
      >
        <ArrowLeft
          size={18}
          className="rtl:rotate-180"
        />

        {tr(
          "Retour au bien",
          "العودة إلى الممتلك",
        )}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          {tr(
            "Modifier un bien",
            "تعديل ممتلك",
          )}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {initialValues.inventoryId}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {tr(
            "État du bien",
            "حالة الممتلك",
          )}
        </h2>

        {statusIsSystemManaged ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              {t(
                `biens.statuses.${selectedStatus}`,
              )}
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {selectedStatus === "RENTED" &&
                tr(
                  "Le statut « Loué » est géré par l’opération de location.",
                  "حالة « مكترى » تتم إدارتها من خلال عملية الكراء.",
                )}

              {selectedStatus === "UNDER_MAINTENANCE" &&
                tr(
                  "Le statut « En maintenance » est géré par le module Maintenance.",
                  "حالة « في الصيانة » تتم إدارتها من خلال وحدة الصيانة.",
                )}

              {(selectedStatus === "DISPOSED" ||
                selectedStatus === "ARCHIVED") &&
                tr(
                  "Le statut de cession/archivage est géré par l’opération « Céder / archiver ».",
                  "حالة التفويت/الأرشفة تتم إدارتها من خلال عملية « تفويت / أرشفة ».",
                )}
            </p>
          </div>
        ) : (
          <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200">
            {tr(
              "Statut",
              "الحالة",
            )}

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value as AssetStatus,
                )
              }
              className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-900"
            >
              {manualStatuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {t(
                    `biens.statuses.${status}`,
                  )}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-slate-500">
              {tr(
                "Loué, En maintenance et Archivé sont changés uniquement par leurs opérations dédiées.",
                "مكترى، في الصيانة ومؤرشف تتغير فقط من خلال العمليات الخاصة بها.",
              )}
            </p>
          </label>
        )}
      </section>

      <DocumentManager
        documents={documents}
        onChange={setDocuments}
        title={tr(
          "Documents du bien / nouveaux documents",
          "وثائق الممتلك / وثائق جديدة",
        )}
      />

      <BienForm
        mode="edit"
        initialValues={{
          ...initialValues,
          assetStatus: selectedStatus,
        }}
        loading={saving}
        submitLabel={tr(
          "Enregistrer les modifications",
          "حفظ التعديلات",
        )}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

export default EditBienPage;
