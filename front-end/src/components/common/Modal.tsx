import type {
  ReactNode,
} from "react";

import {
  X,
} from "lucide-react";

import {
  useTranslation,
} from "react-i18next";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  maxWidth?: string;
};

function Modal({
  open,
  title,
  children,
  onClose,
  maxWidth = "max-w-2xl",
}: ModalProps) {
  const {
    t,
  } = useTranslation();

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-4"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={[
          "flex w-full flex-col overflow-hidden rounded-2xl",
          "border border-slate-200 bg-white shadow-2xl",
          "dark:border-slate-700 dark:bg-slate-800",
          "max-h-[90vh]",
          maxWidth,
        ].join(" ")}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700 sm:px-6">
          <h2
            id="modal-title"
            className="text-lg font-bold text-slate-900 dark:text-white"
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
            aria-label={t(
              "common.close",
            )}
            title={t(
              "common.close",
            )}
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;