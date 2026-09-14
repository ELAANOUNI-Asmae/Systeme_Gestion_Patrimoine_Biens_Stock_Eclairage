import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

type ToastType =
  | "success"
  | "error"
  | "info";

type ToastProps = {
  open: boolean;
  message: string;
  type?: ToastType;
  onClose: () => void;
};

function Toast({
  open,
  message,
  type = "success",
  onClose,
}: ToastProps) {
  if (!open) {
    return null;
  }

  const configuration = {
    success: {
      icon: CheckCircle2,

      container:
        "border-green-200 bg-green-50 dark:border-green-900/60 dark:bg-green-950",

      iconColor:
        "text-green-600 dark:text-green-400",

      textColor:
        "text-green-800 dark:text-green-200",
    },

    error: {
      icon: AlertCircle,

      container:
        "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950",

      iconColor:
        "text-red-600 dark:text-red-400",

      textColor:
        "text-red-800 dark:text-red-200",
    },

    info: {
      icon: Info,

      container:
        "border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950",

      iconColor:
        "text-blue-600 dark:text-blue-400",

      textColor:
        "text-blue-800 dark:text-blue-200",
    },
  };

  const current =
    configuration[type];

  const Icon =
    current.icon;

  return (
    <div className="fixed left-1/2 top-6 z-60 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
      <div
        role="alert"
        className={[
          "flex items-start gap-3 rounded-2xl border p-4 shadow-xl",
          current.container,
        ].join(" ")}
      >
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 dark:bg-slate-900/70",
            current.iconColor,
          ].join(" ")}
        >
          <Icon size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`pt-2 text-sm font-semibold ${current.textColor}`}
          >
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-white/70 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default Toast;