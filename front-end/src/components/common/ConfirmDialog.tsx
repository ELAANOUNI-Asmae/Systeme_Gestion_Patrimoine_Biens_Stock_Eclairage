import {
  AlertTriangle,
  Trash2,
} from "lucide-react";

import Modal from "./Modal";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmDialog({
  open,
  title = "Confirmation",
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  loading = false,
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isDanger =
    variant === "danger";

  return (
    <Modal
      open={open}
      title={title}
      onClose={() => {
        if (!loading) {
          onCancel();
        }
      }}
    >
      <div className="text-center">
        <div
          className={[
            "mx-auto flex h-14 w-14 items-center justify-center rounded-full",
            isDanger
              ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
              : "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
          ].join(" ")}
        >
          {isDanger ? (
            <Trash2 size={26} />
          ) : (
            <AlertTriangle size={26} />
          )}
        </div>

        <p className="mt-4 leading-6 text-slate-600 dark:text-slate-300">
          {message}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end rtl:sm:justify-start">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={[
              "rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50",
              isDanger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-orange-600 hover:bg-orange-700",
            ].join(" ")}
          >
            {loading
              ? "..."
              : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;