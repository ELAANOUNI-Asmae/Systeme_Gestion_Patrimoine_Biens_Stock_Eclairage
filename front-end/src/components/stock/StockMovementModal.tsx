import {
  Boxes,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  useTranslation,
} from "react-i18next";

import Modal from "../common/Modal";

import type {
  StockArticle,
  StockDocument,
  StockDocumentType,
  StockMovementType,
} from "../../types/stock";

type MovementData = {
  articleId: number;

  type:
    StockMovementType;

  quantity: number;

  reason: string;

  supplierOrBeneficiary?: string;

  reference?: string;

  date?: string;

  documents?: Omit<
    StockDocument,
    "id"
  >[];
};

type Props = {
  open: boolean;

  type:
    StockMovementType;

  article:
    StockArticle | null;

  loading?: boolean;

  onClose: () => void;

  onSubmit: (
    data: MovementData,
  ) => Promise<void> | void;
};

const documentTypes: StockDocumentType[] =
  [
    "INVOICE",
    "RECEIPT",
    "DELIVERY_NOTE",
    "EXIT_VOUCHER",
    "OTHER",
  ];

function StockMovementModal({
  open,
  type,
  article,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith(
      "ar",
    );

  const [
    quantity,
    setQuantity,
  ] = useState(0);

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    supplierOrBeneficiary,
    setSupplierOrBeneficiary,
  ] = useState("");

  const [
    reference,
    setReference,
  ] = useState("");

  const [
    date,
    setDate,
  ] = useState("");

  const [
    documentName,
    setDocumentName,
  ] = useState("");

  const [
    documentType,
    setDocumentType,
  ] =
    useState<StockDocumentType>(
      type === "ENTRY"
        ? "INVOICE"
        : "EXIT_VOUCHER",
    );

  const [
    fileName,
    setFileName,
  ] = useState("");

  const [
    documents,
    setDocuments,
  ] = useState<
    Omit<
      StockDocument,
      "id"
    >[]
  >([]);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setQuantity(0);
    setReason("");
    setSupplierOrBeneficiary("");
    setReference("");

    setDate(
      new Date()
        .toISOString()
        .slice(0, 10),
    );

    setDocumentName("");

    setDocumentType(
      type === "ENTRY"
        ? "INVOICE"
        : "EXIT_VOUCHER",
    );

    setFileName("");
    setDocuments([]);
    setError("");
  }, [open, type]);

  if (!article) {
    return null;
  }

  const designation =
    isArabic
      ? article.designationAr
      : article.designation;

  const inputClassName =
    "mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

  const addDocument = () => {
    if (
      !documentName.trim() ||
      !fileName
    ) {
      return;
    }

    setDocuments(
      (previous) => [
        ...previous,
        {
          name:
            documentName.trim(),

          type:
            documentType,

          fileName,

          uploadDate:
            new Date()
              .toISOString()
              .slice(0, 10),
        },
      ],
    );

    setDocumentName("");
    setFileName("");
  };

  const removeDocument = (
    index: number,
  ) => {
    setDocuments(
      (previous) =>
        previous.filter(
          (_, currentIndex) =>
            currentIndex !==
            index,
        ),
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      quantity <= 0 ||
      !reason.trim() ||
      !date
    ) {
      setError(
        t(
          "stock.movement.required",
        ),
      );

      return;
    }

    if (
      type === "EXIT" &&
      quantity >
        article.quantity
    ) {
      setError(
        t(
          "stock.movement.insufficientStock",
        ),
      );

      return;
    }

    setError("");

    await onSubmit({
      articleId:
        article.id,

      type,

      quantity,

      reason:
        reason.trim(),

      supplierOrBeneficiary:
        supplierOrBeneficiary.trim() ||
        undefined,

      reference:
        reference.trim() ||
        undefined,

      date,

      documents,
    });
  };

  return (
    <Modal
      open={open}
      maxWidth="max-w-3xl"
      title={
        type === "ENTRY"
          ? t(
              "stock.movement.entryTitle",
            )
          : t(
              "stock.movement.exitTitle",
            )
      }
      onClose={() => {
        if (!loading) {
          onClose();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 rounded-xl bg-orange-50 p-4 dark:bg-orange-500/10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
            <Boxes
              size={21}
            />
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                "stock.movement.selectedArticle",
              )}
            </p>

            <p className="font-semibold text-slate-800 dark:text-slate-100">
              {designation}
            </p>

            <p className="text-xs text-slate-500">
              {article.reference}
              {" · "}
              {article.quantity}{" "}
              {t(
                `stock.units.${article.unit}`,
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "stock.movement.quantity",
            )}{" "}
            *

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(
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
              "stock.movement.date",
            )}{" "}
            *

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(
                  event.target.value,
                )
              }
              className={
                inputClassName
              }
            />
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {type === "ENTRY"
              ? t(
                  "stock.movement.supplier",
                )
              : t(
                  "stock.movement.beneficiary",
                )}

            <input
              type="text"
              value={
                supplierOrBeneficiary
              }
              onChange={(event) =>
                setSupplierOrBeneficiary(
                  event.target.value,
                )
              }
              className={
                inputClassName
              }
            />
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "stock.movement.reference",
            )}

            <input
              type="text"
              value={reference}
              onChange={(event) =>
                setReference(
                  event.target.value,
                )
              }
              className={
                inputClassName
              }
            />
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">
            {t(
              "stock.movement.reason",
            )}{" "}
            *

            <textarea
              value={reason}
              onChange={(event) =>
                setReason(
                  event.target.value,
                )
              }
              rows={3}
              className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <FileText
              size={19}
              className="text-orange-600 dark:text-orange-400"
            />

            <h3 className="font-semibold text-slate-900 dark:text-white">
              {t(
                "stock.movement.documents",
              )}
            </h3>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_190px_1fr_auto]">
            <input
              type="text"
              value={
                documentName
              }
              onChange={(event) =>
                setDocumentName(
                  event.target.value,
                )
              }
              placeholder={t(
                "stock.movement.documentName",
              )}
              className={
                inputClassName
              }
            />

            <select
              value={
                documentType
              }
              onChange={(event) =>
                setDocumentType(
                  event.target
                    .value as StockDocumentType,
                )
              }
              className={
                inputClassName
              }
            >
              {documentTypes.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {t(
                      `stock.documentTypes.${item}`,
                    )}
                  </option>
                ),
              )}
            </select>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(event) =>
                setFileName(
                  event.target
                    .files?.[0]
                    ?.name ?? "",
                )
              }
              className="mt-1 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />

            <button
              type="button"
              onClick={
                addDocument
              }
              disabled={
                !documentName.trim() ||
                !fileName
              }
              className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40 dark:bg-orange-600 dark:hover:bg-orange-700"
            >
              <Plus
                size={17}
              />

              {t(
                "stock.movement.addDocument",
              )}
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {documents.length ===
            0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                {t(
                  "stock.movement.noDocuments",
                )}
              </p>
            ) : (
              documents.map(
                (
                  document,
                  index,
                ) => (
                  <div
                    key={`${document.fileName}-${index}`}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {
                          document.name
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {t(
                          `stock.documentTypes.${document.type}`,
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
                          index,
                        )
                      }
                      className="inline-flex items-center gap-2 text-sm font-semibold text-red-600"
                    >
                      <Trash2
                        size={16}
                      />

                      {t(
                        "stock.movement.remove",
                      )}
                    </button>
                  </div>
                ),
              )
            )}
          </div>
        </div>

        <div className="sticky -bottom-5 z-10 -mx-5 mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6 rtl:sm:justify-start">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {t(
              "stock.movement.cancel",
            )}
          </button>

          <button
            type="submit"
            disabled={loading}
            className={[
              "rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50",
              type === "ENTRY"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-orange-600 hover:bg-orange-700",
            ].join(" ")}
          >
            {loading
              ? t(
                  "stock.movement.saving",
                )
              : type ===
                  "ENTRY"
                ? t(
                    "stock.movement.confirmEntry",
                  )
                : t(
                    "stock.movement.confirmExit",
                  )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default StockMovementModal;