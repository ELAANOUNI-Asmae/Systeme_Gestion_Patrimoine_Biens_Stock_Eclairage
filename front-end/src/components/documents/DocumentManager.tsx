import {
  FileText,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import {
  useTranslation,
} from "react-i18next";

import type {
  AppDocument,
  DocumentCategory,
  DocumentType,
} from "../../types/document";

type DocumentManagerProps = {
  documents: AppDocument[];

  onChange: (
    documents: AppDocument[],
  ) => void;
};

const documentTypes: DocumentType[] = [
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

const reminderOptions = [
  1,
  3,
  7,
  15,
  30,
  60,
  90,
];

function DocumentManager({
  documents,
  onChange,
}: DocumentManagerProps) {
  const {
    t,
  } = useTranslation();

  const fileInputId =
    useId();

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
    fileName,
    setFileName,
  ] = useState("");

  const [
    expirationDate,
    setExpirationDate,
  ] = useState("");

  const [
    reminderDaysBefore,
    setReminderDaysBefore,
  ] = useState(7);

  const inputClassName =
    "mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

  const resetForm = () => {
    setName("");

    setCategory(
      "ATTACHMENT",
    );

    setType(
      "OTHER",
    );

    setFileName("");

    setExpirationDate("");

    setReminderDaysBefore(
      7,
    );

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  };

  const handleCategoryChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const newCategory =
      event.target
        .value as DocumentCategory;

    setCategory(
      newCategory,
    );

    if (
      newCategory ===
      "ATTACHMENT"
    ) {
      setExpirationDate("");

      setReminderDaysBefore(
        7,
      );
    }
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    setFileName(
      file?.name ?? "",
    );
  };

  const addDocument = () => {
    if (
      !name.trim() ||
      !fileName
    ) {
      return;
    }

    if (
      category ===
        "OFFICIAL" &&
      !expirationDate
    ) {
      return;
    }

    const document: AppDocument =
      {
        id: Date.now(),

        name:
          name.trim(),

        category,

        type,

        fileName,

        uploadDate:
          new Date()
            .toISOString()
            .slice(
              0,
              10,
            ),

        ...(category ===
        "OFFICIAL"
          ? {
              expirationDate,

              reminderDaysBefore,
            }
          : {}),
      };

    onChange([
      ...documents,
      document,
    ]);

    resetForm();
  };

  const removeDocument = (
    id: number,
  ) => {
    onChange(
      documents.filter(
        (document) =>
          document.id !==
          id,
      ),
    );
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
      <div className="flex items-center gap-3">
        <FileText className="text-orange-600 dark:text-orange-400" />

        <div>
          <h2 className="font-bold text-slate-900 dark:text-white">
            {t(
              "documents.title",
            )}
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t(
              "documents.description",
            )}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {/* CATEGORY */}

        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t(
            "documents.category",
          )}{" "}
          *

          <select
            value={
              category
            }
            onChange={
              handleCategoryChange
            }
            className={
              inputClassName
            }
          >
            <option value="ATTACHMENT">
              {t(
                "documents.attachment",
              )}
            </option>

            <option value="OFFICIAL">
              {t(
                "documents.official",
              )}
            </option>
          </select>
        </label>

        {/* NAME */}

        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t(
            "documents.name",
          )}{" "}
          *

          <input
            type="text"
            value={name}
            onChange={(
              event,
            ) =>
              setName(
                event.target
                  .value,
              )
            }
            className={
              inputClassName
            }
          />
        </label>

        {/* TYPE */}

        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t(
            "documents.type",
          )}

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
            className={
              inputClassName
            }
          >
            {documentTypes.map(
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
                  {t(
                    `documents.types.${item}`,
                  )}
                </option>
              ),
            )}
          </select>
        </label>

        {/* FILE */}

        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "documents.file",
            )}{" "}
            *
          </p>

          <input
            ref={
              fileInputRef
            }
            id={
              fileInputId
            }
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={
              handleFileChange
            }
            className="sr-only"
          />

          <div className="mt-1 flex min-h-11 items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900">
            <label
              htmlFor={
                fileInputId
              }
              className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            >
              <Upload
                size={16}
              />

              {t(
                "documents.chooseFile",
              )}
            </label>

            <span className="min-w-0 truncate text-sm text-slate-500 dark:text-slate-400">
              {fileName ||
                t(
                  "documents.noFileSelected",
                )}
            </span>
          </div>
        </div>

        {/* OFFICIAL DOCUMENT */}

        {category ===
          "OFFICIAL" && (
          <>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t(
                "documents.expirationDate",
              )}{" "}
              *

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
                className={
                  inputClassName
                }
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t(
                "documents.remindBeforeExpiration",
              )}

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
                className={
                  inputClassName
                }
              >
                {reminderOptions.map(
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
                      {t(
                        "documents.daysBefore",
                        {
                          count:
                            days,
                        },
                      )}
                    </option>
                  ),
                )}
              </select>
            </label>
          </>
        )}
      </div>

      {/* ADD */}

      <div className="mt-5 flex justify-end rtl:justify-start">
        <button
          type="button"
          onClick={
            addDocument
          }
          disabled={
            !name.trim() ||
            !fileName ||
            (category ===
              "OFFICIAL" &&
              !expirationDate)
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40 dark:bg-orange-600 dark:hover:bg-orange-700"
        >
          <Plus
            size={17}
          />

          {t(
            "documents.add",
          )}
        </button>
      </div>

      {/* DOCUMENT LIST */}

      <div className="mt-6 space-y-3">
        {documents.length ===
        0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            {t(
              "documents.empty",
            )}
          </p>
        ) : (
          documents.map(
            (
              document,
            ) => (
              <div
                key={
                  document.id
                }
                className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {
                        document.name
                      }
                    </p>

                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {document.category ===
                      "OFFICIAL"
                        ? t(
                            "documents.official",
                          )
                        : t(
                            "documents.attachment",
                          )}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {t(
                      `documents.types.${document.type}`,
                    )}

                    {" · "}

                    {
                      document.fileName
                    }
                  </p>

                  {document.category ===
                    "OFFICIAL" &&
                    document.expirationDate && (
                      <p className="mt-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                        {t(
                          "documents.expiresOn",
                          {
                            date:
                              document.expirationDate,
                          },
                        )}

                        {document.reminderDaysBefore !==
                          undefined && (
                          <>
                            {" · "}

                            {t(
                              "documents.reminderText",
                              {
                                count:
                                  document.reminderDaysBefore,
                              },
                            )}
                          </>
                        )}
                      </p>
                    )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeDocument(
                      document.id,
                    )
                  }
                  className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700"
                >
                  <Trash2
                    size={16}
                  />

                  {t(
                    "documents.delete",
                  )}
                </button>
              </div>
            ),
          )
        )}
      </div>
    </article>
  );
}

export default DocumentManager;