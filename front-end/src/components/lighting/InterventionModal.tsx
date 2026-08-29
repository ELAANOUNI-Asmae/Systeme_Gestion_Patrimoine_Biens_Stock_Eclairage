import {
  CalendarDays,
  Wrench,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  useTranslation,
} from "react-i18next";

import DocumentManager from "../documents/DocumentManager";

import type {
  Failure,
} from "../../types/lighting";

import type {
  AppDocument,
} from "../../types/document";

export type InterventionData = {
  technician: string;
  interventionDate: string;
  description: string;
  documents?: AppDocument[];
};

type InterventionModalProps = {
  open: boolean;
  failure: Failure | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (
    data: InterventionData,
  ) => Promise<void> | void;
};

function InterventionModal({
  open,
  failure,
  loading = false,
  onClose,
  onSubmit,
}: InterventionModalProps) {
  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith("ar");

  const [
    technician,
    setTechnician,
  ] = useState("");

  const [
    interventionDate,
    setInterventionDate,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    documents,
    setDocuments,
  ] =
    useState<AppDocument[]>(
      [],
    );

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (open) {
      setTechnician("");

      setInterventionDate(
        new Date()
          .toISOString()
          .slice(0, 10),
      );

      setDescription("");
      setDocuments([]);
      setError("");
    }
  }, [open]);

  if (!open || !failure) {
    return null;
  }

  const designation =
    isArabic
      ? failure.lightDesignationAr
      : failure.lightDesignation;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!technician.trim()) {
      setError(
        t(
          "lighting.interventionModal.errors.technician",
        ),
      );

      return;
    }

    if (!interventionDate) {
      setError(
        t(
          "lighting.interventionModal.errors.date",
        ),
      );

      return;
    }

    if (!description.trim()) {
      setError(
        t(
          "lighting.interventionModal.errors.description",
        ),
      );

      return;
    }

    setError("");

    await onSubmit({
      technician:
        technician.trim(),
      interventionDate,
      description:
        description.trim(),
      documents,
    });
  };

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-700">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
              <Wrench
                size={22}
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t(
                  "lighting.interventionModal.title",
                )}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t(
                  "lighting.interventionModal.subtitle",
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <X
              size={20}
            />
          </button>
        </div>

        <div className="mx-5 mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/20 dark:bg-orange-500/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
            {t(
              "lighting.interventionModal.failure",
            )}
          </p>

          <p className="mt-2 font-semibold text-slate-900 dark:text-white">
            {designation}
          </p>

          <p
            className="mt-1 text-xs text-slate-500 dark:text-slate-400"
            dir="ltr"
          >
            {failure.lightReference}
          </p>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {failure.description}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-5"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t(
                  "lighting.interventionModal.technician",
                )}
                {" *"}
              </span>

              <input
                type="text"
                value={technician}
                disabled={loading}
                onChange={(event) =>
                  setTechnician(
                    event.target.value,
                  )
                }
                placeholder={t(
                  "lighting.interventionModal.technicianPlaceholder",
                )}
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-orange-500/20"
              />
            </label>

            <label className="block">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <CalendarDays
                  size={16}
                />

                {t(
                  "lighting.interventionModal.date",
                )}
                {" *"}
              </span>

              <input
                type="date"
                value={interventionDate}
                disabled={loading}
                onChange={(event) =>
                  setInterventionDate(
                    event.target.value,
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-orange-500/20"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t(
                  "lighting.interventionModal.description",
                )}
                {" *"}
              </span>

              <textarea
                value={description}
                disabled={loading}
                rows={4}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                placeholder={t(
                  "lighting.interventionModal.descriptionPlaceholder",
                )}
                className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-orange-500/20"
              />
            </label>
          </div>

          <DocumentManager
            documents={documents}
            onChange={setDocuments}
          />

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 dark:border-slate-700 sm:flex-row sm:justify-end rtl:sm:justify-start">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {t(
                "lighting.interventionModal.cancel",
              )}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Wrench
                size={18}
              />

              {loading
                ? t(
                    "lighting.interventionModal.saving",
                  )
                : t(
                    "lighting.interventionModal.submit",
                  )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InterventionModal;
