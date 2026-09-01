import {
  FileText,
  Paperclip,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import {
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";

import type {
  AppDocument,
  DocumentCategory,
  DocumentType,
} from "../../types/document";

type Props = {
  documents: AppDocument[];
  onChange: (documents: AppDocument[]) => void;
};

const types: DocumentType[] = [
  "INVOICE",
  "RECEIPT",
  "CONTRACT",
  "REGISTRATION",
  "INSURANCE",
  "CERTIFICATE",
  "DELIVERY_NOTE",
  "EXIT_VOUCHER",
  "TECHNICAL_SHEET",
  "WARRANTY",
  "REPORT",
  "PHOTO",
  "OTHER",
];

const typeLabels: Record<DocumentType, { fr: string; ar: string }> = {
  INVOICE: { fr: "Facture", ar: "فاتورة" },
  RECEIPT: { fr: "Reçu", ar: "وصل" },
  CONTRACT: { fr: "Contrat", ar: "عقد" },
  REGISTRATION: { fr: "Immatriculation", ar: "التسجيل" },
  INSURANCE: { fr: "Assurance", ar: "التأمين" },
  CERTIFICATE: { fr: "Certificat", ar: "شهادة" },
  DELIVERY_NOTE: { fr: "Bon de livraison", ar: "سند التسليم" },
  EXIT_VOUCHER: { fr: "Bon de sortie", ar: "إذن الخروج" },
  TECHNICAL_SHEET: { fr: "Fiche technique", ar: "ورقة تقنية" },
  WARRANTY: { fr: "Garantie", ar: "ضمان" },
  REPORT: { fr: "Rapport", ar: "تقرير" },
  PHOTO: { fr: "Photo", ar: "صورة" },
  OTHER: { fr: "Autre", ar: "أخرى" },
};

function DocumentManager({ documents, onChange }: Props) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] =
    useState<DocumentCategory>("ATTACHMENT");
  const [type, setType] = useState<DocumentType>("OTHER");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expirationDate, setExpirationDate] = useState("");
  const [reminderDaysBefore, setReminderDaysBefore] = useState(7);
  const [error, setError] = useState("");

  const fileChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
    setError("");
  };

  const add = () => {
    if (!name.trim() || !selectedFile) {
      setError(
        tr(
          "Le nom et le fichier sont obligatoires.",
          "اسم الوثيقة والملف إلزاميان.",
        ),
      );
      return;
    }

    if (category === "OFFICIAL" && !expirationDate) {
      setError(
        tr(
          "La date d’expiration est obligatoire pour un document officiel.",
          "تاريخ انتهاء الصلاحية إلزامي للوثيقة الرسمية.",
        ),
      );
      return;
    }

    const document: AppDocument = {
      id: Math.max(0, ...documents.map((item) => item.id)) + 1,
      name: name.trim(),
      category,
      type,
      fileName: selectedFile.name,
      uploadDate: new Date().toISOString().slice(0, 10),
      expirationDate:
        category === "OFFICIAL" ? expirationDate : undefined,
      reminderDaysBefore:
        category === "OFFICIAL" ? reminderDaysBefore : undefined,
      file: selectedFile,
    };

    onChange([...documents, document]);
    setName("");
    setCategory("ATTACHMENT");
    setType("OTHER");
    setSelectedFile(null);
    setExpirationDate("");
    setReminderDaysBefore(7);
    setError("");

    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/50">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
        <p className="font-bold">
          {tr("Document officiel ou pièce jointe ?", "وثيقة رسمية أم مرفق؟")}
        </p>
        <p className="mt-1">
          {tr(
            "Document officiel : fichier avec date d’expiration et rappel. Pièce jointe : fichier simple sans échéance.",
            "الوثيقة الرسمية: ملف له تاريخ انتهاء وتذكير. المرفق: ملف عادي بدون تاريخ انتهاء.",
          )}
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Field label={tr("Nom du document", "اسم الوثيقة")}>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
          />
        </Field>

        <Field label={tr("Catégorie", "الفئة")}>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as DocumentCategory)
            }
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
          >
            <option value="ATTACHMENT">{tr("Pièce jointe", "مرفق")}</option>
            <option value="OFFICIAL">{tr("Document officiel", "وثيقة رسمية")}</option>
          </select>
        </Field>

        <Field label={tr("Type", "النوع")}>
          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as DocumentType)
            }
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
          >
            {types.map((item) => (
              <option key={item} value={item}>
                {tr(typeLabels[item].fr, typeLabels[item].ar)}
              </option>
            ))}
          </select>
        </Field>

        <div>
          <p className="mb-1 text-sm font-medium">{tr("Fichier", "الملف")}</p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={fileChanged}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
          >
            <Upload size={18} />
            {selectedFile ? selectedFile.name : tr("Choisir un fichier", "اختيار ملف")}
          </button>
        </div>

        {category === "OFFICIAL" && (
          <>
            <Field label={tr("Date d’expiration", "تاريخ انتهاء الصلاحية")}>
              <input
                type="date"
                value={expirationDate}
                onChange={(event) => setExpirationDate(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
              />
            </Field>

            <Field label={tr("Notifier avant expiration", "التذكير قبل الانتهاء")}>
              <select
                value={reminderDaysBefore}
                onChange={(event) =>
                  setReminderDaysBefore(Number(event.target.value))
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
              >
                {[1, 3, 7, 15, 30, 60, 90].map((days) => (
                  <option key={days} value={days}>
                    {tr(`${days} jour(s) avant`, `قبل ${days} يوم`)}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-orange-600"
        >
          <Plus size={18} />
          {tr("Ajouter le document", "إضافة الوثيقة")}
        </button>
      </div>

      {documents.length > 0 && (
        <div className="mt-5 space-y-2">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
            >
              {document.category === "OFFICIAL" ? (
                <FileText size={18} />
              ) : (
                <Paperclip size={18} />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{document.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {document.fileName}
                  {document.expirationDate
                    ? ` · ${tr("Expire le", "ينتهي في")} ${document.expirationDate}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  onChange(documents.filter((item) => item.id !== document.id))
                }
                className="rounded-lg p-2 text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

export default DocumentManager;
