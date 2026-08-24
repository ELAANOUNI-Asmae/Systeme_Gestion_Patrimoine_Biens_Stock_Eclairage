import {
  TriangleAlert,
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
  Light,
} from "../../types/lighting";

type FailureReportModalProps = {
  open: boolean;

  light: Light | null;

  loading?: boolean;

  onClose: () => void;

  onSubmit: (
    description: string,
  ) => Promise<void> | void;
};

function FailureReportModal({
  open,
  light,
  loading = false,
  onClose,
  onSubmit,
}: FailureReportModalProps) {
  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith(
      "ar",
    );

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (open) {
      setDescription("");
      setError("");
    }
  }, [open]);

  if (!light) {
    return null;
  }

  const designation =
    isArabic
      ? light.designationAr
      : light.designation;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!description.trim()) {
      setError(
        t(
          "lighting.failure.required",
        ),
      );

      return;
    }

    setError("");

    await onSubmit(
      description.trim(),
    );
  };

  return (
    <Modal
      open={open}
      title={t(
        "lighting.failure.modalTitle",
      )}
      maxWidth="max-w-xl"
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
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
            <TriangleAlert
              size={22}
            />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t(
                "lighting.failure.selectedLight",
              )}
            </p>

            <p className="mt-1 font-bold text-slate-900 dark:text-white">
              {designation}
            </p>

            <p
              className="mt-1 text-xs text-slate-500 dark:text-slate-400"
              dir="ltr"
            >
              {light.reference}
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t(
            "lighting.failure.description",
          )}{" "}
          *

          <textarea
            rows={5}
            value={description}
            onChange={(event) => {
              setDescription(
                event.target.value,
              );

              if (error) {
                setError("");
              }
            }}
            placeholder={t(
              "lighting.failure.descriptionPlaceholder",
            )}
            className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-orange-500/20"
          />
        </label>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 dark:border-slate-700 sm:flex-row sm:justify-end rtl:sm:justify-start">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {t(
              "lighting.failure.cancel",
            )}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <TriangleAlert
              size={18}
            />

            {loading
              ? t(
                  "lighting.failure.saving",
                )
              : t(
                  "lighting.failure.submit",
                )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default FailureReportModal;