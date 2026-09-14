
import {
  BellRing,
  Boxes,
  ClipboardPlus,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useTranslation } from "react-i18next";

import Modal from "../common/Modal";
import DocumentManager from "../documents/DocumentManager";

import type {
  StockArticle,
} from "../../types/stock";
import type { AppDocument } from "../../types/document";

export type SupplyRequestData = {
  articleId: number;
  requestedQuantity: number;
  requesterId: number;
  requester: string;
  reason: string;
  documents?: AppDocument[];
};

export type RestockAlertData = {
  articleId: number;
  requestedQuantity: number;
  requesterId: number;
  requester: string;
  reason: string;
};

type SupplyRequestModalProps = {
  open: boolean;
  articles: StockArticle[];
  requester: {
    id: number;
    name: string;
  };
  loading?: boolean;
  onClose: () => void;
  onSubmit: (
    data: SupplyRequestData,
  ) => Promise<void> | void;
  onRestockAlert: (
    data: RestockAlertData,
  ) => Promise<void> | void;
};

function SupplyRequestModal({
  open,
  articles,
  requester,
  loading = false,
  onClose,
  onSubmit,
  onRestockAlert,
}: SupplyRequestModalProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const [articleId, setArticleId] = useState("");
  const [
    requestedQuantity,
    setRequestedQuantity,
  ] = useState(0);
  const [reason, setReason] = useState("");
  const [documents, setDocuments] =
    useState<AppDocument[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setArticleId("");
    setRequestedQuantity(0);
    setReason("");
    setDocuments([]);
    setError("");
  }, [open]);

  const selectedArticle =
    articles.find(
      (article) =>
        article.id === Number(articleId),
    );

  const insufficient =
    Boolean(
      selectedArticle &&
        requestedQuantity > selectedArticle.quantity,
    );

  const inputClassName =
    "mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-900";

  const validateBase = () => {
    if (
      !selectedArticle ||
      requestedQuantity <= 0 ||
      !reason.trim()
    ) {
      setError(
        tr(
          "L’article, la quantité et le motif sont obligatoires.",
          "المادة والكمية والسبب إجبارية.",
        ),
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!validateBase() || !selectedArticle) {
      return;
    }

    if (requestedQuantity > selectedArticle.quantity) {
      setError(
        tr(
          `Stock insuffisant. Il reste ${selectedArticle.quantity} ${selectedArticle.unit}. Choisissez la quantité disponible ou notifiez le responsable du réapprovisionnement.`,
          `المخزون غير كافٍ. المتوفر هو ${selectedArticle.quantity} ${selectedArticle.unit}. اطلب الكمية المتوفرة أو أرسل تنبيهاً لمسؤول إعادة التزويد.`,
        ),
      );
      return;
    }

    setError("");

    await onSubmit({
      articleId: selectedArticle.id,
      requestedQuantity,
      requesterId: requester.id,
      requester: requester.name,
      reason: reason.trim(),
      documents: [...documents],
    });
  };

  const notifyRestock = async () => {
    if (!validateBase() || !selectedArticle) {
      return;
    }

    if (requestedQuantity <= selectedArticle.quantity) {
      setError(
        tr(
          "La quantité est déjà disponible. Envoyez une demande normale.",
          "الكمية متوفرة حالياً. أرسل طلباً عادياً.",
        ),
      );
      return;
    }

    setError("");

    await onRestockAlert({
      articleId: selectedArticle.id,
      requestedQuantity,
      requesterId: requester.id,
      requester: requester.name,
      reason: reason.trim(),
    });
  };

  return (
    <Modal
      open={open}
      maxWidth="max-w-3xl"
      title={tr(
        "Créer une demande de fourniture",
        "إنشاء طلب تموين",
      )}
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
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {tr("Demandeur", "مقدم الطلب")}
          </p>
          <p className="mt-1 font-bold">{requester.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {tr(
              "Le demandeur est récupéré automatiquement depuis le compte connecté.",
              "يتم جلب مقدم الطلب تلقائياً من الحساب المتصل.",
            )}
          </p>
        </div>

        <label className="block text-sm font-medium">
          {tr("Article", "المادة")} *
          <select
            value={articleId}
            onChange={(event) => {
              setArticleId(event.target.value);
              setRequestedQuantity(0);
              setError("");
            }}
            className={inputClassName}
          >
            <option value="">
              {tr("Choisir un article", "اختر مادة")}
            </option>

            {articles.map((article) => (
              <option
                key={article.id}
                value={article.id}
              >
                {isArabic
                  ? article.designationAr
                  : article.designation}{" "}
                — {article.brand} — {article.barcode}
              </option>
            ))}
          </select>
        </label>

        {selectedArticle && (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
              <Boxes size={20} />
            </div>

            <div>
              <p className="font-semibold">
                {isArabic
                  ? selectedArticle.designationAr
                  : selectedArticle.designation}
              </p>
              <p className="text-xs text-slate-500">
                {tr("Disponible", "المتوفر")}:{" "}
                {selectedArticle.quantity} {selectedArticle.unit}
              </p>
              <p className="text-xs text-slate-500">
                {tr("Code-barres", "الباركود")}:{" "}
                {selectedArticle.barcode}
              </p>
            </div>
          </div>
        )}

        <label className="block text-sm font-medium">
          {tr("Quantité demandée", "الكمية المطلوبة")} *
          <input
            type="number"
            min="1"
            value={requestedQuantity}
            onChange={(event) => {
              setRequestedQuantity(
                Number(event.target.value),
              );
              setError("");
            }}
            className={inputClassName}
          />
        </label>

        {insufficient && selectedArticle && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              {tr(
                "Stock insuffisant",
                "المخزون غير كافٍ",
              )}
            </p>

            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              {tr(
                `Quantité disponible : ${selectedArticle.quantity}. La demande ne sera pas créée avec une quantité supérieure au stock.`,
                `الكمية المتوفرة: ${selectedArticle.quantity}. لن يتم إنشاء الطلب بكمية أكبر من المخزون.`,
              )}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {selectedArticle.quantity > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setRequestedQuantity(
                      selectedArticle.quantity,
                    )
                  }
                  className="rounded-xl bg-amber-700 px-3 py-2 text-xs font-semibold text-white"
                >
                  {tr(
                    `Demander ${selectedArticle.quantity}`,
                    `طلب ${selectedArticle.quantity}`,
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  void notifyRestock();
                }}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-700 dark:text-amber-300"
              >
                <BellRing size={16} />
                {tr(
                  "Notifier le responsable du réapprovisionnement",
                  "إشعار مسؤول إعادة التزويد",
                )}
              </button>
            </div>
          </div>
        )}

        <label className="block text-sm font-medium">
          {tr("Motif", "السبب")} *
          <textarea
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            rows={4}
            className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-900"
          />
        </label>

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
            disabled={loading || insufficient}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <ClipboardPlus size={18} />
            {tr("Envoyer la demande", "إرسال الطلب")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default SupplyRequestModal;
