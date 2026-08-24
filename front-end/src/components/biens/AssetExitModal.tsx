import {
  AlertTriangle,
  Archive,
  Building2,
  FileText,
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
  ArchiveReason,
  Bien,
} from "../../types/bien";

type ExitReason =
  Exclude<
    ArchiveReason,
    "SOLD"
  >;

type AssetExitData = {
  reason: ExitReason;
  archivedAt: string;
  reference?: string;
  documentFileName?: string;
  notes?: string;
};

type AssetExitModalProps = {
  open: boolean;
  bien: Bien;
  loading?: boolean;

  onClose: () => void;

  onSubmit: (
    data: AssetExitData,
  ) => Promise<void> | void;
};

const reasons: ExitReason[] = [
  "DISPOSED",
  "DESTROYED",
  "TRANSFERRED",
  "REFORMED",
  "OTHER",
];

function AssetExitModal({
  open,
  bien,
  loading = false,
  onClose,
  onSubmit,
}: AssetExitModalProps) {
  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith(
      "ar",
    );

  const [
    reason,
    setReason,
  ] =
    useState<ExitReason>(
      "REFORMED",
    );

  const [
    archivedAt,
    setArchivedAt,
  ] = useState("");

  const [
    reference,
    setReference,
  ] = useState("");

  const [
    documentFileName,
    setDocumentFileName,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setReason("REFORMED");

    setArchivedAt(
      new Date()
        .toISOString()
        .slice(0, 10),
    );

    setReference("");
    setDocumentFileName("");
    setNotes("");
    setError("");
  }, [open]);

  const designation =
    isArabic
      ? bien.designationAr
      : bien.designation;

  const inputClassName =
    "mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !reason ||
      !archivedAt
    ) {
      setError(
        t(
          "biens.operations.required",
        ),
      );

      return;
    }

    setError("");

    await onSubmit({
      reason,

      archivedAt,

      reference:
        reference.trim() ||
        undefined,

      documentFileName:
        documentFileName ||
        undefined,

      notes:
        notes.trim() ||
        undefined,
    });
  };

  return (
    <Modal
      open={open}
      title={t(
        "biens.operations.exitTitle",
      )}
      maxWidth="max-w-2xl"
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

        {/* BIEN */}

        <div className="flex items-center gap-3 rounded-xl bg-orange-50 p-4 dark:bg-orange-500/10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
            <Building2
              size={21}
            />
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                "biens.operations.selectedAsset",
              )}
            </p>

            <p className="font-semibold text-slate-800 dark:text-slate-100">
              {designation}
            </p>

            <p className="text-xs text-slate-500">
              {bien.inventoryId}
            </p>
          </div>
        </div>

        {/* WARNING */}

        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />

          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {t(
                "biens.operations.exitTitle",
              )}
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-700 dark:text-amber-400">
              {t(
                "biens.operations.exitWarning",
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* REASON */}

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "biens.operations.exitReason",
            )}{" "}
            <span className="text-red-500">
              *
            </span>

            <select
              value={reason}
              onChange={(event) =>
                setReason(
                  event.target
                    .value as ExitReason,
                )
              }
              className={
                inputClassName
              }
            >
              {reasons.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {t(
                      `biens.operations.exitReasons.${item}`,
                    )}
                  </option>
                ),
              )}
            </select>
          </label>

          {/* DATE */}

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "biens.operations.exitDate",
            )}{" "}
            <span className="text-red-500">
              *
            </span>

            <input
              type="date"
              value={archivedAt}
              onChange={(event) =>
                setArchivedAt(
                  event.target.value,
                )
              }
              className={
                inputClassName
              }
            />
          </label>

          {/* REFERENCE */}

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">
            {t(
              "biens.operations.exitReference",
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
        </div>

        {/* DOCUMENT */}

        <label className="block rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-600">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <FileText
              size={18}
            />

            {t(
              "biens.operations.exitDocument",
            )}
          </span>

          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(event) =>
              setDocumentFileName(
                event.target
                  .files?.[0]
                  ?.name ?? "",
              )
            }
            className="mt-3 block w-full text-xs text-slate-500 dark:text-slate-400"
          />

          {documentFileName && (
            <p className="mt-2 text-xs font-medium text-orange-600 dark:text-orange-400">
              {
                documentFileName
              }
            </p>
          )}
        </label>

        {/* NOTES */}

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t(
            "biens.operations.exitNotes",
          )}

          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(
                event.target.value,
              )
            }
            rows={3}
            className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>

        {/* ACTIONS */}

        <div className="sticky -bottom-5 z-10 -mx-5 mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6 rtl:sm:justify-start">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {t(
              "biens.operations.cancel",
            )}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <Archive
              size={18}
            />

            {loading
              ? t(
                  "biens.operations.saving",
                )
              : t(
                  "biens.operations.confirmExit",
                )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AssetExitModal;