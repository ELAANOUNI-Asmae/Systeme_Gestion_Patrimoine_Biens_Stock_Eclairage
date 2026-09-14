
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import Modal from "../common/Modal";
import type { SupplyRequest } from "../../types/stock";

function RequestRejectionModal({
  open,
  request,
  loading = false,
  onClose,
  onSubmit,
}: {
  open: boolean;
  request: SupplyRequest | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (
    request: SupplyRequest,
    reason: string,
  ) => Promise<void> | void;
}) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setError("");
    }
  }, [open]);

  if (!request) {
    return null;
  }

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!reason.trim()) {
      setError(
        tr(
          "Le motif du refus est obligatoire.",
          "سبب الرفض إجباري.",
        ),
      );
      return;
    }

    await onSubmit(request, reason.trim());
  };

  return (
    <Modal
      open={open}
      title={tr(
        "Refuser la demande",
        "رفض الطلب",
      )}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {tr(
            `Demande #${request.id} — ${request.requester}`,
            `الطلب رقم ${request.id} — ${request.requester}`,
          )}
        </p>

        {error && (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium">
          {tr("Motif du refus", "سبب الرفض")} *
          <textarea
            rows={4}
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold dark:border-slate-600"
          >
            {tr("Annuler", "إلغاء")}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {tr("Confirmer le refus", "تأكيد الرفض")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default RequestRejectionModal;
