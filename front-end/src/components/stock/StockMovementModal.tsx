
import { Boxes } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useTranslation } from "react-i18next";

import Modal from "../common/Modal";
import DocumentManager from "../documents/DocumentManager";

import {
  calculateTotalHt,
  calculateTotalTtc,
  calculateUnitPriceTtc,
  type StockArticle,
  type StockMovementType,
} from "../../types/stock";

import type { AppDocument } from "../../types/document";

export type MovementData = {
  articleId: number;
  type: StockMovementType;
  quantity: number;
  reason: string;
  supplierOrBeneficiary?: string;
  reference?: string;
  date?: string;
  documents?: AppDocument[];
  unitPriceHt?: number;
  vatRate?: number;
};

type Props = {
  open: boolean;
  type: StockMovementType;
  article: StockArticle | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (
    data: MovementData,
  ) => Promise<void> | void;
};

function StockMovementModal({
  open,
  type,
  article,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");
  const [
    supplierOrBeneficiary,
    setSupplierOrBeneficiary,
  ] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState("");
  const [documents, setDocuments] =
    useState<AppDocument[]>([]);
  const [unitPriceHt, setUnitPriceHt] = useState(0);
  const [vatRate, setVatRate] = useState(20);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setQuantity(0);
    setReason("");
    setSupplierOrBeneficiary("");
    setReference("");
    setDate(new Date().toISOString().slice(0, 10));
    setDocuments([]);
    setUnitPriceHt(article?.unitPriceHt ?? 0);
    setVatRate(article?.vatRate ?? 20);
    setError("");
  }, [open, type, article]);

  const summary = useMemo(
    () => ({
      unitTtc: calculateUnitPriceTtc(
        unitPriceHt,
        vatRate,
      ),
      totalHt: calculateTotalHt(
        quantity,
        unitPriceHt,
      ),
      totalTtc: calculateTotalTtc(
        quantity,
        unitPriceHt,
        vatRate,
      ),
    }),
    [quantity, unitPriceHt, vatRate],
  );

  if (!article) {
    return null;
  }

  const designation =
    isArabic
      ? article.designationAr
      : article.designation;

  const inputClassName =
    "mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

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
        tr(
          "La quantité, la date et le motif sont obligatoires.",
          "الكمية والتاريخ والسبب إجبارية.",
        ),
      );
      return;
    }

    if (
      type === "EXIT" &&
      quantity > article.quantity
    ) {
      setError(
        tr(
          `Stock insuffisant. Quantité disponible : ${article.quantity}.`,
          `المخزون غير كافٍ. الكمية المتوفرة: ${article.quantity}.`,
        ),
      );
      return;
    }

    if (
      type === "ENTRY" &&
      (unitPriceHt <= 0 ||
        vatRate < 0 ||
        vatRate > 100)
    ) {
      setError(
        tr(
          "Le prix unitaire HT et la TVA sont invalides.",
          "ثمن الوحدة بدون الضريبة أو نسبة الضريبة غير صالحين.",
        ),
      );
      return;
    }

    setError("");

    await onSubmit({
      articleId: article.id,
      type,
      quantity,
      reason: reason.trim(),
      supplierOrBeneficiary:
        supplierOrBeneficiary.trim() || undefined,
      reference: reference.trim() || undefined,
      date,
      documents: [...documents],
      unitPriceHt:
        type === "ENTRY"
          ? unitPriceHt
          : undefined,
      vatRate:
        type === "ENTRY"
          ? vatRate
          : undefined,
    });
  };

  return (
    <Modal
      open={open}
      maxWidth="max-w-4xl"
      title={
        type === "ENTRY"
          ? tr("Entrée de stock", "إدخال للمخزون")
          : tr("Sortie de stock", "إخراج من المخزون")
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
            <Boxes size={21} />
          </div>

          <div>
            <p className="font-semibold">{designation}</p>
            <p className="mt-1 text-xs text-slate-500">
              {article.reference} · {article.brand} ·{" "}
              {article.quantity} {article.unit}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {tr("Code-barres", "الباركود")}:{" "}
              {article.barcode}
            </p>
          </div>
        </div>

        <article className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              {tr("Quantité", "الكمية")} *
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) =>
                  setQuantity(Number(event.target.value))
                }
                className={inputClassName}
              />
            </label>

            <label className="text-sm font-medium">
              {tr("Date", "التاريخ")} *
              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                className={inputClassName}
              />
            </label>

            <label className="text-sm font-medium">
              {type === "ENTRY"
                ? tr("Fournisseur", "المورد")
                : tr("Bénéficiaire", "المستفيد")}
              <input
                value={supplierOrBeneficiary}
                onChange={(event) =>
                  setSupplierOrBeneficiary(
                    event.target.value,
                  )
                }
                className={inputClassName}
              />
            </label>

            <label className="text-sm font-medium">
              {tr("Référence opération", "مرجع العملية")}
              <input
                value={reference}
                onChange={(event) =>
                  setReference(event.target.value)
                }
                className={inputClassName}
              />
            </label>

            {type === "ENTRY" && (
              <>
                <label className="text-sm font-medium">
                  {tr(
                    "Prix unitaire HT (DH)",
                    "ثمن الوحدة بدون الضريبة (درهم)",
                  )}{" "}
                  *
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitPriceHt}
                    onChange={(event) =>
                      setUnitPriceHt(
                        Number(event.target.value),
                      )
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="text-sm font-medium">
                  {tr("TVA (%)", "الضريبة (%)")} *
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={vatRate}
                    onChange={(event) =>
                      setVatRate(
                        Number(event.target.value),
                      )
                    }
                    className={inputClassName}
                  />
                </label>
              </>
            )}

            <label className="text-sm font-medium sm:col-span-2">
              {tr("Motif", "السبب")} *
              <textarea
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                rows={3}
                placeholder={tr(
                  "Indiquez clairement le motif de l’opération",
                  "اكتب سبب العملية بوضوح",
                )}
                className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-900"
              />
            </label>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <PriceCard
              label={tr(
                "Prix unitaire TTC",
                "ثمن الوحدة شامل الضريبة",
              )}
              value={summary.unitTtc}
            />
            <PriceCard
              label={tr("Total HT", "الإجمالي بدون الضريبة")}
              value={summary.totalHt}
            />
            <PriceCard
              label={tr("Total TTC", "الإجمالي شامل الضريبة")}
              value={summary.totalTtc}
            />
          </div>

          {type === "ENTRY" && (
            <p className="mt-3 text-xs text-slate-500">
              {tr(
                "Après validation, ce prix unitaire et cette TVA deviennent les valeurs courantes de l’article.",
                "بعد التأكيد، يصبح ثمن الوحدة ونسبة الضريبة هما القيمتان الحاليتان للمادة.",
              )}
            </p>
          )}
        </article>

        <DocumentManager
          documents={documents}
          onChange={setDocuments}
        />

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end dark:border-slate-700">
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
            className={[
              "rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50",
              type === "ENTRY"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-orange-600 hover:bg-orange-700",
            ].join(" ")}
          >
            {loading
              ? tr("Enregistrement", "جارٍ الحفظ")
              : type === "ENTRY"
                ? tr("Confirmer l’entrée", "تأكيد الإدخال")
                : tr("Confirmer la sortie", "تأكيد الإخراج")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PriceCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-bold">
        {value.toFixed(2)} DH
      </p>
    </div>
  );
}

export default StockMovementModal;
