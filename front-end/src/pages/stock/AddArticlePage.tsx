import { ArrowLeft } from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import ArticleForm from "../../components/stock/ArticleForm";

import {
  ROUTES,
} from "../../constants/routes";

import {
  stockService,
} from "../../services/stockService";

import type {
  StockArticleFormData,
} from "../../types/stock";

function AddArticlePage() {
  const navigate =
    useNavigate();

  const {
    t,
  } = useTranslation();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const handleSubmit = async (
    data: StockArticleFormData,
  ) => {
    try {
      setLoading(true);
      setError("");

      await stockService.createArticle(
        data,
      );

      navigate(
        ROUTES.STOCK,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : t(
              "stock.pages.genericError",
            ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          to={ROUTES.STOCK}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
        >
          <ArrowLeft
            size={18}
            className="rtl:rotate-180"
          />

          {t(
            "stock.pages.back",
          )}
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          {t(
            "stock.pages.addTitle",
          )}
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {t(
            "stock.pages.addDescription",
          )}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <ArticleForm
        submitLabel={t(
          "stock.pages.create",
        )}
        loading={loading}
        onSubmit={
          handleSubmit
        }
      />
    </section>
  );
}

export default AddArticlePage;
