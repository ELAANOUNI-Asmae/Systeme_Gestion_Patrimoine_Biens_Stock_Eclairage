
import {
  Archive,
  ArrowLeft,
  Eye,
  FileText,
  Pencil,
  ShoppingCart,
  KeyRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  useParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

import AssetExitModal from "../../components/biens/AssetExitModal";
import AssetOperationModal from "../../components/biens/AssetOperationModal";
import PermissionGuard from "../../components/common/PermissionGuard";
import { PERMISSIONS } from "../../constants/permissions";
import { ROUTES } from "../../constants/routes";
import { bienService } from "../../services/bienService";
import type {
  Bien,
  RentalOperation,
  SaleOperation,
} from "../../types/bien";
import type { AppDocument } from "../../types/document";

type OperationMode = "RENT" | "SELL";

function BienDetailsPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const [bien, setBien] = useState<Bien | null>(null);
  const [loading, setLoading] = useState(true);
  const [operationMode, setOperationMode] =
    useState<OperationMode | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewDocument, setPreviewDocument] =
    useState<AppDocument | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setBien(await bienService.getById(Number(id)));
    } catch {
      setBien(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const previewUrl = useMemo(
    () =>
      previewDocument?.file
        ? URL.createObjectURL(previewDocument.file)
        : null,
    [previewDocument],
  );

  useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl],
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-800">
        {tr("Chargement du bien", "جارٍ تحميل الممتلك")}
      </div>
    );
  }

  if (!bien) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        {tr("Bien introuvable.", "الممتلك غير موجود.")}
      </div>
    );
  }

  const rent = async (
    data: Omit<
      RentalOperation,
      "id" | "bienId" | "createdAt"
    >,
  ) => {
    try {
      setSaving(true);
      await bienService.rent(bien.id, data);
      setOperationMode(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const sell = async (
    data: Omit<
      SaleOperation,
      "id" | "bienId" | "createdAt"
    >,
  ) => {
    try {
      setSaving(true);
      await bienService.sell(bien.id, data);
      setOperationMode(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const cede = async (data: {
    reason: "DISPOSED";
    archivedAt: string;
    reference?: string;
    documentFileName?: string;
    notes?: string;
  }) => {
    try {
      setSaving(true);
      await bienService.archive(bien.id, data);
      setExitOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const infos = buildSpecificInfo(bien, isArabic);

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link
          to={
            bien.archive.archived
              ? ROUTES.BIENS_ARCHIVE
              : ROUTES.BIENS
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600 dark:text-slate-400"
        >
          <ArrowLeft size={18} className="rtl:rotate-180" />
          {bien.archive.archived
            ? tr("Retour aux archives", "العودة إلى الأرشيف")
            : tr("Retour aux biens", "العودة إلى الممتلكات")}
        </Link>

        {!bien.archive.archived && (
          <PermissionGuard permission={PERMISSIONS.UPDATE_ASSET}>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/biens/${bien.id}/modifier`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold dark:border-slate-600"
              >
                <Pencil size={17} />
                {tr("Modifier", "تعديل")}
              </Link>

              <button
                type="button"
                onClick={() => setOperationMode("RENT")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold dark:border-slate-600"
              >
                <KeyRound size={17} />
                {tr("Mettre en location", "كراء الممتلك")}
              </button>

              <button
                type="button"
                onClick={() => setOperationMode("SELL")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold dark:border-slate-600"
              >
                <ShoppingCart size={17} />
                {tr("Vendre", "بيع")}
              </button>

              <button
                type="button"
                onClick={() => setExitOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Archive size={17} />
                {tr("Céder", "تفويت")}
              </button>
            </div>
          </PermissionGuard>
        )}
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-700 sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isArabic ? bien.designationAr : bien.designation}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {bien.inventoryId}
            </p>
          </div>

          <span className="h-fit w-fit rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
            {bien.archive.archived
              ? tr("Cédé", "مفوّت")
              : t(`biens.statuses.${bien.assetStatus}`)}
          </span>
        </div>

        <h2 className="mt-6 font-bold">
          {tr("Informations générales", "المعلومات العامة")}
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Info label={tr("Type", "النوع")} value={t(`biens.types.${bien.type}`)} />
          <Info
            label={tr("Date d’acquisition", "تاريخ الاقتناء")}
            value={bien.acquisitionDate}
          />
          <Info
            label={tr("Valeur d’acquisition", "قيمة الاقتناء")}
            value={`${bien.purchaseValue.toLocaleString()} DH`}
          />
          {bien.assetStatus === "IN_USE" && !bien.archive.archived && (
            <Info
              label={tr("Affectation", "الجهة المستعملة")}
              value={
                (isArabic ? bien.assignmentAr : bien.assignment) || "—"
              }
            />
          )}
        </div>

        <h2 className="mt-8 font-bold">
          {tr("Informations spécifiques", "المعلومات الخاصة")}
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {infos.map((info) => (
            <Info key={info.label} label={info.label} value={info.value} />
          ))}
        </div>
      </article>

      {bien.rentalHistory.length > 0 && (
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-bold">
            {tr("Historique des locations", "سجل الكراء")}
          </h2>
          <div className="mt-4 space-y-3">
            {bien.rentalHistory.map((rental) => (
              <div
                key={rental.id}
                className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900"
              >
                <p className="font-semibold">{rental.tenantName}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {rental.startDate}
                  {rental.endDate ? ` → ${rental.endDate}` : ""}
                </p>
                <p className="mt-1 text-sm">
                  {rental.monthlyAmount.toLocaleString()} DH /{" "}
                  {tr("mois", "شهر")}
                </p>
              </div>
            ))}
          </div>
        </article>
      )}

      {bien.archive.archived && (
        <article className="rounded-2xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-900/50 dark:bg-orange-950/20">
          <h2 className="font-bold">
            {tr("Bien cédé", "ممتلك مفوّت")}
          </h2>
          <p className="mt-2 text-sm">
            {tr("Date", "التاريخ")}: {bien.archive.archivedAt ?? "—"}
          </p>
          {bien.archive.reference && (
            <p className="mt-1 text-sm">
              {tr("Référence", "المرجع")}: {bien.archive.reference}
            </p>
          )}
          {bien.sale && (
            <div className="mt-4 rounded-xl bg-white/70 p-4 dark:bg-slate-900/60">
              <p className="font-semibold">
                {tr("Informations de vente", "معلومات البيع")}
              </p>
              <p className="mt-2 text-sm">
                {tr("Acheteur", "المشتري")}: {bien.sale.buyerName}
              </p>
              <p className="text-sm">
                {tr("Prix", "الثمن")}: {bien.sale.salePrice.toLocaleString()} DH
              </p>
            </div>
          )}
        </article>
      )}

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <FileText className="text-orange-600" />
          <h2 className="font-bold">
            {tr("Documents associés", "الوثائق المرتبطة")}
          </h2>
        </div>

        {bien.documents.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            {tr("Aucun document associé.", "لا توجد وثائق مرتبطة.")}
          </p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {bien.documents.map((document) => (
              <button
                key={document.id}
                type="button"
                onClick={() => setPreviewDocument(document)}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-start hover:border-orange-300 dark:border-slate-700"
              >
                <Eye size={18} className="text-orange-600" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{document.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {document.fileName}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </article>

      <AssetOperationModal
        open={operationMode !== null}
        mode={operationMode ?? "RENT"}
        bien={bien}
        loading={saving}
        onClose={() => setOperationMode(null)}
        onRent={rent}
        onSell={sell}
      />

      <AssetExitModal
        open={exitOpen}
        bien={bien}
        loading={saving}
        onClose={() => setExitOpen(false)}
        onSubmit={cede}
      />

      {previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900">
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="font-bold">{previewDocument.name}</h2>
                <p className="text-sm text-slate-500">
                  {previewDocument.fileName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5">
              {previewUrl &&
              previewDocument.file?.type.startsWith("image/") ? (
                <img
                  src={previewUrl}
                  alt={previewDocument.name}
                  className="mx-auto max-h-[70vh] max-w-full rounded-xl object-contain"
                />
              ) : previewUrl &&
                previewDocument.file?.type === "application/pdf" ? (
                <iframe
                  src={previewUrl}
                  title={previewDocument.name}
                  className="h-[70vh] w-full rounded-xl border"
                />
              ) : (
                <div className="rounded-xl bg-slate-50 p-6 text-center dark:bg-slate-800">
                  <FileText size={48} className="mx-auto text-slate-400" />
                  <p className="mt-3 font-semibold">
                    {previewDocument.fileName}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {tr(
                      "Les fichiers ajoutés depuis le formulaire peuvent être prévisualisés ici. Pour les documents mock existants, le backend fournira ensuite l’URL de téléchargement.",
                      "يمكن معاينة الملفات المضافة من النموذج هنا. أما وثائق البيانات التجريبية الحالية فسيقوم الخادم لاحقاً بتوفير رابط تحميلها.",
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-medium">{value || "—"}</p>
    </div>
  );
}

function buildSpecificInfo(
  bien: Bien,
  isArabic: boolean,
): { label: string; value?: string }[] {
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  if (bien.type === "VEHICLE") {
    return [
      {
        label: tr("Immatriculation", "رقم التسجيل"),
        value: bien.vehicleDetails?.registrationNumber,
      },
      {
        label: tr("Marque", "العلامة"),
        value: bien.vehicleDetails?.brand,
      },
      {
        label: tr("Modèle", "الطراز"),
        value: bien.vehicleDetails?.model,
      },
      {
        label: tr("Année", "السنة"),
        value: bien.vehicleDetails?.year?.toString(),
      },
      {
        label: tr("Numéro de châssis", "رقم الهيكل"),
        value: bien.vehicleDetails?.chassisNumber,
      },
      {
        label: tr("Puissance fiscale", "القوة الجبائية"),
        value: bien.vehicleDetails?.fiscalHorsepower
          ? `${bien.vehicleDetails.fiscalHorsepower} CV`
          : undefined,
      },
      {
        label: tr(
          "Première mise en circulation",
          "أول وضع في السير",
        ),
        value: bien.vehicleDetails?.firstRegistrationDate,
      },
    ];
  }

  if (bien.type === "MACHINE") {
    return [
      {
        label: tr("Marque", "العلامة"),
        value: bien.machineDetails?.brand,
      },
      {
        label: tr("Modèle", "الطراز"),
        value: bien.machineDetails?.model,
      },
      {
        label: tr("Numéro de série", "الرقم التسلسلي"),
        value: bien.machineDetails?.serialNumber,
      },
      {
        label: tr("Référence technique", "المرجع التقني"),
        value: bien.machineDetails?.technicalReference,
      },
      {
        label: tr("Puissance", "القدرة"),
        value: bien.machineDetails?.powerKw
          ? `${bien.machineDetails.powerKw} kW`
          : undefined,
      },
    ];
  }

  return [
    {
      label: tr("Adresse", "العنوان"),
      value: bien.realEstateDetails?.address,
    },
    {
      label: tr("Superficie", "المساحة"),
      value: bien.realEstateDetails?.surface
        ? `${bien.realEstateDetails.surface} m²`
        : undefined,
    },
    {
      label: tr("Titre foncier", "الرسم العقاري"),
      value: bien.realEstateDetails?.landTitleNumber,
    },
    {
      label: tr("Type de propriété", "نوع الملكية"),
      value: bien.realEstateDetails?.propertyType,
    },
    {
      label: tr("Référence cadastrale", "المرجع المساحي"),
      value: bien.realEstateDetails?.cadastralReference,
    },
    {
      label: tr("Domaine", "المجال"),
      value:
        bien.realEstateDetails?.domain === "PUBLIC"
          ? tr("Domaine public", "الملك العام")
          : bien.realEstateDetails?.domain === "PRIVATE"
            ? tr("Domaine privé", "الملك الخاص")
            : undefined,
    },
  ];
}

export default BienDetailsPage;
