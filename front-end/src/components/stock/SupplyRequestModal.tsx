import {
  Boxes,
  ClipboardPlus,
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
  StockArticle,
} from "../../types/stock";

type SupplyRequestData = {
  articleDesignation: string;
  articleDesignationAr?: string;
  requestedQuantity: number;
  requester: string;
  reason: string;
};

type SupplyRequestModalProps = {
  open: boolean;

  articles: StockArticle[];

  requester: string;

  loading?: boolean;

  onClose: () => void;

  onSubmit: (
    data: SupplyRequestData,
  ) => Promise<void> | void;
};

function SupplyRequestModal({
  open,
  articles,
  requester,
  loading = false,
  onClose,
  onSubmit,
}: SupplyRequestModalProps) {
  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith("ar");

  const [
    articleId,
    setArticleId,
  ] = useState("");

  const [
    requestedQuantity,
    setRequestedQuantity,
  ] = useState(0);

  const [
    requesterValue,
    setRequesterValue,
  ] = useState(requester);

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setArticleId("");
    setRequestedQuantity(0);
    setRequesterValue(requester);
    setReason("");
    setError("");
  }, [
    open,
    requester,
  ]);

  const selectedArticle =
    articles.find(
      (article) =>
        article.id ===
        Number(articleId),
    );

  const inputClassName =
    "mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-orange-500/20";

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !selectedArticle ||
      requestedQuantity <= 0 ||
      !requesterValue.trim() ||
      !reason.trim()
    ) {
      setError(
        t(
          "stock.request.formRequired",
        ),
      );

      return;
    }

    setError("");

    await onSubmit({
      articleDesignation:
        selectedArticle.designation,

      articleDesignationAr:
        selectedArticle.designationAr,

      requestedQuantity,

      requester:
        requesterValue.trim(),

      reason:
        reason.trim(),
    });
  };

  return (
    <Modal
      open={open}
      maxWidth="max-w-2xl"
      title={t(
        "stock.request.modalTitle",
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
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-start gap-3 rounded-xl bg-orange-50 p-4 dark:bg-orange-500/10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
            <ClipboardPlus
              size={21}
            />
          </div>

          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              {t(
                "stock.request.modalDescription",
              )}
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t(
                "stock.request.modalHint",
              )}
            </p>
          </div>
        </div>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t(
            "stock.request.article",
          )}{" "}
          *

          <select
            value={articleId}
            onChange={(event) => {
              setArticleId(
                event.target.value,
              );

              setRequestedQuantity(
                0,
              );

              setError("");
            }}
            className={
              inputClassName
            }
          >
            <option value="">
              {t(
                "stock.request.chooseArticle",
              )}
            </option>

            {articles.map(
              (article) => (
                <option
                  key={
                    article.id
                  }
                  value={
                    article.id
                  }
                >
                  {isArabic
                    ? article.designationAr
                    : article.designation}{" "}
                  —{" "}
                  {
                    article.reference
                  }
                </option>
              ),
            )}
          </select>
        </label>

        {selectedArticle && (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
              <Boxes
                size={20}
              />
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {isArabic
                  ? selectedArticle.designationAr
                  : selectedArticle.designation}
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t(
                  "stock.request.availableQuantity",
                )}
                {" : "}
                {
                  selectedArticle.quantity
                }{" "}
                {t(
                  `stock.units.${selectedArticle.unit}`,
                )}
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {isArabic
                  ? selectedArticle.locationAr
                  : selectedArticle.location}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "stock.request.quantity",
            )}{" "}
            *

            <input
              type="number"
              min="1"
              value={
                requestedQuantity
              }
              onChange={(event) =>
                setRequestedQuantity(
                  Number(
                    event.target.value,
                  ),
                )
              }
              className={
                inputClassName
              }
            />
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "stock.request.requester",
            )}{" "}
            *

            <input
              type="text"
              value={
                requesterValue
              }
              onChange={(event) =>
                setRequesterValue(
                  event.target.value,
                )
              }
              className={
                inputClassName
              }
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t(
            "stock.request.reason",
          )}{" "}
          *

          <textarea
            value={reason}
            onChange={(event) =>
              setReason(
                event.target.value,
              )
            }
            rows={4}
            placeholder={t(
              "stock.request.reasonPlaceholder",
            )}
            className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-orange-500/20"
          />
        </label>

        <div className="sticky -bottom-5 z-10 -mx-5 mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6 rtl:sm:justify-start">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {t(
              "stock.common.cancel",
            )}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
          >
            <ClipboardPlus
              size={18}
            />

            {loading
              ? t(
                  "stock.request.saving",
                )
              : t(
                  "stock.request.submit",
                )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default SupplyRequestModal;