import {
  Download,
  Eye,
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

import {
  useTranslation,
} from "react-i18next";

import {
  documentApiService,
} from "../../services/documentApiService";

import type {
  AppDocument,
  DocumentCategory,
  DocumentType,
} from "../../types/document";

type Props = {
  documents: AppDocument[];
  onChange: (
    documents: AppDocument[],
  ) => void;
  title?: string;
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

const typeLabels: Record<
  DocumentType,
  {
    fr: string;
    ar: string;
  }
> = {
  INVOICE: {
    fr: "Facture",
    ar: "فاتورة",
  },

  RECEIPT: {
    fr: "Reçu",
    ar: "وصل",
  },

  CONTRACT: {
    fr: "Contrat",
    ar: "عقد",
  },

  REGISTRATION: {
    fr: "Immatriculation",
    ar: "التسجيل",
  },

  INSURANCE: {
    fr: "Assurance",
    ar: "التأمين",
  },

  CERTIFICATE: {
    fr: "Certificat",
    ar: "شهادة",
  },

  DELIVERY_NOTE: {
    fr: "Bon de livraison",
    ar: "سند التسليم",
  },

  EXIT_VOUCHER: {
    fr: "Bon de sortie",
    ar: "إذن الخروج",
  },

  TECHNICAL_SHEET: {
    fr: "Fiche technique",
    ar: "ورقة تقنية",
  },

  WARRANTY: {
    fr: "Garantie",
    ar: "ضمان",
  },

  REPORT: {
    fr: "Rapport",
    ar: "تقرير",
  },

  PHOTO: {
    fr: "Photo",
    ar: "صورة",
  },

  OTHER: {
    fr: "Autre",
    ar: "أخرى",
  },
};

function DocumentManager({
  documents,
  onChange,
  title,
}: Props) {
  const {
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith(
      "ar",
    );

  const tr = (
    fr: string,
    ar: string,
  ) =>
    isArabic
      ? ar
      : fr;

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    name,
    setName,
  ] = useState("");

  const [
    category,
    setCategory,
  ] =
    useState<DocumentCategory>(
      "ATTACHMENT",
    );

  const [
    type,
    setType,
  ] =
    useState<DocumentType>(
      "OTHER",
    );

  const [
    selectedFile,
    setSelectedFile,
  ] =
    useState<File | null>(
      null,
    );

  const [
    expirationDate,
    setExpirationDate,
  ] = useState("");

  const [
    reminderDaysBefore,
    setReminderDaysBefore,
  ] = useState(7);

  const [
    error,
    setError,
  ] = useState("");

  const [
    previewingId,
    setPreviewingId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    downloadingId,
    setDownloadingId,
  ] =
    useState<number | null>(
      null,
    );

  const handleFileChange = (
    event:
      ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedFile(
      event.target.files?.[0] ??
        null,
    );

    setError("");
  };

  const resetForm = () => {
    setName("");

    setCategory(
      "ATTACHMENT",
    );

    setType(
      "OTHER",
    );

    setSelectedFile(
      null,
    );

    setExpirationDate("");

    setReminderDaysBefore(
      7,
    );

    setError("");

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  };

  const addDocument = () => {
    if (
      !name.trim() ||
      !selectedFile
    ) {
      setError(
        tr(
          "Le nom et le fichier sont obligatoires.",
          "اسم الوثيقة والملف إجباريان.",
        ),
      );

      return;
    }

    if (
      category ===
        "OFFICIAL" &&
      !expirationDate
    ) {
      setError(
        tr(
          "La date d’expiration est obligatoire pour un document officiel.",
          "تاريخ انتهاء الصلاحية إجباري للوثيقة الرسمية.",
        ),
      );

      return;
    }

    const newDocument:
      AppDocument = {
      /*
       * Identifiant temporaire côté Front.
       * Après envoi au Backend,
       * l'identifiant Backend sera utilisé.
       */
      id: Date.now(),

      name:
        name.trim(),

      category,

      type,

      fileName:
        selectedFile.name,

      uploadDate:
        new Date()
          .toISOString()
          .slice(
            0,
            10,
          ),

      expirationDate:
        category ===
        "OFFICIAL"
          ? expirationDate
          : undefined,

      reminderDaysBefore:
        category ===
        "OFFICIAL"
          ? reminderDaysBefore
          : undefined,

      file:
        selectedFile,
    };

    onChange([
      ...documents,
      newDocument,
    ]);

    resetForm();
  };

  const removeDocument = (
    documentId: number,
  ) => {
    onChange(
      documents.filter(
        (
          document,
        ) =>
          document.id !==
          documentId,
      ),
    );
  };

  /*
   * Retourne le contenu du document.
   *
   * - Document nouvellement choisi :
   *   on utilise directement File.
   *
   * - Document déjà enregistré :
   *   on récupère le Blob depuis
   *   le Backend avec son ID.
   */
  const getDocumentBlob =
    async (
      document:
        AppDocument,
    ): Promise<Blob> => {
      if (
        document.file
      ) {
        return document.file;
      }

      if (
        !Number.isFinite(
          document.id,
        ) ||
        document.id <=
          0
      ) {
        throw new Error(
          "INVALID_DOCUMENT_ID",
        );
      }

      return documentApiService.openBlob(
        document.id,
      );
    };

  const previewDocument =
    async (
      document:
        AppDocument,
    ) => {
      const previewWindow =
        window.open(
          "",
          "_blank",
        );

      try {
        setPreviewingId(
          document.id,
        );

        setError("");

        const blob =
          await getDocumentBlob(
            document,
          );

        const objectUrl =
          URL.createObjectURL(
            blob,
          );

        if (
          previewWindow
        ) {
          previewWindow.location.href =
            objectUrl;
        } else {
          window.location.href =
            objectUrl;
        }

        window.setTimeout(
          () => {
            URL.revokeObjectURL(
              objectUrl,
            );
          },
          60000,
        );
      } catch (
        previewError
      ) {
        previewWindow?.close();

        console.error(
          "Document preview failed:",
          previewError,
        );

        setError(
          tr(
            "Impossible d’ouvrir ce document.",
            "تعذر فتح هذه الوثيقة.",
          ),
        );
      } finally {
        setPreviewingId(
          null,
        );
      }
    };

  const downloadDocument =
    async (
      document:
        AppDocument,
    ) => {
      try {
        setDownloadingId(
          document.id,
        );

        setError("");

        const blob =
          await getDocumentBlob(
            document,
          );

        const objectUrl =
          URL.createObjectURL(
            blob,
          );

        const link =
          window.document.createElement(
            "a",
          );

        link.href =
          objectUrl;

        link.download =
          document.fileName ||
          document.name ||
          "document";

        window.document.body.appendChild(
          link,
        );

        link.click();

        link.remove();

        window.setTimeout(
          () => {
            URL.revokeObjectURL(
              objectUrl,
            );
          },
          1000,
        );
      } catch (
        downloadError
      ) {
        console.error(
          "Document download failed:",
          downloadError,
        );

        setError(
          tr(
            "Impossible de télécharger ce document.",
            "تعذر تحميل هذه الوثيقة.",
          ),
        );
      } finally {
        setDownloadingId(
          null,
        );
      }
    };

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {title ??
            tr(
              "Documents",
              "الوثائق",
            )}
        </h3>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
        <p className="font-bold">
          {tr(
            "Document officiel ou pièce jointe ?",
            "وثيقة رسمية أم مرفق؟",
          )}
        </p>

        <p className="mt-1">
          {tr(
            "Document officiel : fichier avec date d’expiration et rappel. Pièce jointe : fichier simple sans échéance.",
            "الوثيقة الرسمية: ملف له تاريخ انتهاء وتذكير. المرفق: ملف عادي بدون تاريخ انتهاء.",
          )}
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Field
          label={tr(
            "Nom du document",
            "اسم الوثيقة",
          )}
        >
          <input
            type="text"
            value={name}
            onChange={(
              event,
            ) => {
              setName(
                event.target.value,
              );

              if (
                error
              ) {
                setError("");
              }
            }}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </Field>

        <Field
          label={tr(
            "Catégorie",
            "الفئة",
          )}
        >
          <select
            value={
              category
            }
            onChange={(
              event,
            ) => {
              const nextCategory =
                event.target
                  .value as DocumentCategory;

              setCategory(
                nextCategory,
              );

              if (
                nextCategory ===
                "ATTACHMENT"
              ) {
                setExpirationDate(
                  "",
                );

                setReminderDaysBefore(
                  7,
                );
              }

              setError("");
            }}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-orange-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="ATTACHMENT">
              {tr(
                "Pièce jointe",
                "مرفق",
              )}
            </option>

            <option value="OFFICIAL">
              {tr(
                "Document officiel",
                "وثيقة رسمية",
              )}
            </option>
          </select>
        </Field>

        <Field
          label={tr(
            "Type",
            "النوع",
          )}
        >
          <select
            value={type}
            onChange={(
              event,
            ) =>
              setType(
                event.target
                  .value as DocumentType,
              )
            }
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-orange-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            {types.map(
              (
                item,
              ) => (
                <option
                  key={
                    item
                  }
                  value={
                    item
                  }
                >
                  {tr(
                    typeLabels[
                      item
                    ].fr,
                    typeLabels[
                      item
                    ].ar,
                  )}
                </option>
              ),
            )}
          </select>
        </Field>

        <div>
          <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            {tr(
              "Fichier",
              "الملف",
            )}
          </p>

          <input
            ref={
              fileInputRef
            }
            type="file"
            className="hidden"
            onChange={
              handleFileChange
            }
          />

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm transition hover:border-orange-300 hover:text-orange-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <Upload
              size={18}
            />

            <span className="truncate">
              {selectedFile
                ? selectedFile.name
                : tr(
                    "Choisir un fichier",
                    "اختيار ملف",
                  )}
            </span>
          </button>
        </div>

        {category ===
          "OFFICIAL" && (
          <>
            <Field
              label={tr(
                "Date d’expiration",
                "تاريخ انتهاء الصلاحية",
              )}
            >
              <input
                type="date"
                value={
                  expirationDate
                }
                onChange={(
                  event,
                ) =>
                  setExpirationDate(
                    event.target
                      .value,
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-orange-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </Field>

            <Field
              label={tr(
                "Notifier avant expiration",
                "التذكير قبل انتهاء الصلاحية",
              )}
            >
              <select
                value={
                  reminderDaysBefore
                }
                onChange={(
                  event,
                ) =>
                  setReminderDaysBefore(
                    Number(
                      event
                        .target
                        .value,
                    ),
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-orange-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                {[
                  1,
                  3,
                  7,
                  15,
                  30,
                  60,
                  90,
                ].map(
                  (
                    days,
                  ) => (
                    <option
                      key={
                        days
                      }
                      value={
                        days
                      }
                    >
                      {tr(
                        `${days} jour(s) avant`,
                        `قبل ${days} يوم`,
                      )}
                    </option>
                  ),
                )}
              </select>
            </Field>
          </>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mt-4 flex justify-end rtl:justify-start">
        <button
          type="button"
          onClick={
            addDocument
          }
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-orange-600 dark:hover:bg-orange-700"
        >
          <Plus
            size={18}
          />

          {tr(
            "Ajouter le document",
            "إضافة الوثيقة",
          )}
        </button>
      </div>

      {documents.length >
        0 && (
        <div className="mt-5 space-y-2">
          {documents.map(
            (
              document,
            ) => {
              const isPreviewing =
                previewingId ===
                document.id;

              const isDownloading =
                downloadingId ===
                document.id;

              return (
                <div
                  key={
                    document.id
                  }
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {document.category ===
                      "OFFICIAL" ? (
                        <FileText
                          size={
                            19
                          }
                        />
                      ) : (
                        <Paperclip
                          size={
                            19
                          }
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900 dark:text-white">
                        {
                          document.name
                        }
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {
                          document.fileName
                        }
                      </p>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>
                          {tr(
                            typeLabels[
                              document
                                .type
                            ].fr,
                            typeLabels[
                              document
                                .type
                            ].ar,
                          )}
                        </span>

                        {document.expirationDate && (
                          <span>
                            {tr(
                              "Expire le",
                              "تنتهي في",
                            )}
                            {" "}
                            {
                              document.expirationDate
                            }
                          </span>
                        )}

                        {document.reminderDaysBefore !==
                          undefined &&
                          document.category ===
                            "OFFICIAL" && (
                            <span>
                              {tr(
                                `Rappel ${document.reminderDaysBefore} jour(s) avant`,
                                `تذكير قبل ${document.reminderDaysBefore} يوم`,
                              )}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-1 rtl:justify-start">
                    <button
                      type="button"
                      disabled={
                        isPreviewing
                      }
                      onClick={() => {
                        void previewDocument(
                          document,
                        );
                      }}
                      title={tr(
                        "Ouvrir",
                        "فتح",
                      )}
                      className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 disabled:cursor-wait disabled:opacity-50 dark:hover:bg-blue-500/10"
                    >
                      <Eye
                        size={
                          18
                        }
                      />
                    </button>

                    <button
                      type="button"
                      disabled={
                        isDownloading
                      }
                      onClick={() => {
                        void downloadDocument(
                          document,
                        );
                      }}
                      title={tr(
                        "Télécharger",
                        "تحميل",
                      )}
                      className="rounded-lg p-2 text-green-600 transition hover:bg-green-50 disabled:cursor-wait disabled:opacity-50 dark:hover:bg-green-500/10"
                    >
                      <Download
                        size={
                          18
                        }
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeDocument(
                          document.id,
                        )
                      }
                      title={tr(
                        "Supprimer",
                        "حذف",
                      )}
                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2
                        size={
                          18
                        }
                      />
                    </button>
                  </div>
                </div>
              );
            },
          )}
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
  children:
    ReactNode;
}) {
  return (
    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
      <span className="mb-1 block">
        {label}
      </span>

      {children}
    </label>
  );
}

export default DocumentManager;