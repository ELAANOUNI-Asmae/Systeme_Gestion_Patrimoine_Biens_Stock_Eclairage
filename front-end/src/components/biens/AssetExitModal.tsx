
import { Archive, FileText } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import Modal from "../common/Modal";
import type { Bien } from "../../types/bien";

type ExitData = {
  reason: "DISPOSED";
  archivedAt: string;
  reference?: string;
  documentFileName?: string;
  notes?: string;
};

function AssetExitModal({
  open,
  bien,
  loading = false,
  onClose,
  onSubmit,
}: {
  open: boolean;
  bien: Bien;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: ExitData) => Promise<void> | void;
}) {
  const { i18n } = useTranslation();
  const ar = i18n.language.startsWith("ar");
  const tr = (fr: string, arText: string) => (ar ? arText : fr);

  const [date, setDate] = useState("");
  const [reference, setReference] = useState("");
  const [documentFileName, setDocumentFileName] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setDate(new Date().toISOString().slice(0, 10));
      setReference("");
      setDocumentFileName("");
      setNotes("");
    }
  }, [open]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!date) return;

    await onSubmit({
      reason: "DISPOSED",
      archivedAt: date,
      reference: reference.trim() || undefined,
      documentFileName: documentFileName || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr("Céder / archiver le bien", "تفويت / أرشفة الممتلك")}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
          {tr(
            `Le bien « ${bien.designation} » sera retiré de la liste active et apparaîtra uniquement dans l’archive avec le statut « Cédé ».`,
            `سيتم حذف « ${bien.designationAr} » من اللائحة النشطة وسيظهر فقط في الأرشيف بحالة « مفوّت ».`,
          )}
        </div>

        <label className="block text-sm font-medium">
          {tr("Date de cession", "تاريخ التفويت")}
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
          />
        </label>

        <label className="block text-sm font-medium">
          {tr("Référence", "المرجع")}
          <input
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
          />
        </label>

        <label className="block text-sm font-medium">
          {tr("Document justificatif", "الوثيقة المبررة")}
          <input
            type="file"
            onChange={(event) =>
              setDocumentFileName(event.target.files?.[0]?.name ?? "")
            }
            className="mt-1 block w-full rounded-xl border border-slate-300 bg-white p-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          {documentFileName && (
            <span className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <FileText size={15} />
              {documentFileName}
            </span>
          )}
        </label>

        <label className="block text-sm font-medium">
          {tr("Observations", "ملاحظات")}
          <textarea
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
        </label>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold dark:border-slate-600"
          >
            {tr("Annuler", "إلغاء")}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Archive size={18} />
            {tr("Confirmer la cession", "تأكيد التفويت")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AssetExitModal;
