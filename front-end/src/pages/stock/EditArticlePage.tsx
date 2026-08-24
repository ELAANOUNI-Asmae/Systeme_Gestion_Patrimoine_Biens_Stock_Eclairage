import { ArrowLeft } from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
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
  StockArticle,
  StockArticleFormData,
} from "../../types/stock";

function EditArticlePage() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const {
    t,
  } = useTranslation();

  const articleId =
    Number(id);

  const [
    article,
    setArticle,
  ] =
    useState<
      StockArticle | null
    >(null);

  const [
    loadingPage,
    setLoadingPage,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const loadArticle =
      async () => {
        try {
          if (
            !Number.isFinite(
              articleId,
            )
          ) {
            throw new Error(
              t(
                "stock.pages.invalidId",
              ),
            );
          }

          const data =
            await stockService.getArticleById(
              articleId,
            );

          setArticle(
            data,
          );
        } catch (
          caughtError
        ) {
          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : t(
                  "stock.pages.notFound",
                ),
          );
        } finally {
          setLoadingPage(
            false,
          );
        }
      };

    void loadArticle();
  }, [
    articleId,
    t,
  ]);

  const handleSubmit =
    async (
      data: StockArticleFormData,
    ) => {
      try {
        setSaving(true);
        setError("");

        await stockService.updateArticle(
          articleId,
          data,
        );

        navigate(
          ROUTES.STOCK,
        );
      } catch (
        caughtError
      ) {
        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : t(
                "stock.pages.genericError",
              ),
        );
      } finally {
        setSaving(false);
      }
    };

  if (loadingPage) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        {t(
          "stock.pages.loading",
        )}
      </div>
    );
  }

  if (!article) {
    return (
      <section className="space-y-4">
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

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error ||
            t(
              "stock.pages.notFound",
            )}
        </div>
      </section>
    );
  }

  const initialValues:
    StockArticleFormData = {
      reference:
        article.reference,

      designation:
        article.designation,

      designationAr:
        article.designationAr,

      category:
        article.category,

      categoryAr:
        article.categoryAr,

      quantity:
        article.quantity,

      minimumQuantity:
        article.minimumQuantity,

      unit:
        article.unit,

      location:
        article.location,

      locationAr:
        article.locationAr,
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
            "stock.pages.editTitle",
          )}
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {t(
            "stock.pages.editDescription",
          )}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <ArticleForm
        initialValues={
          initialValues
        }
        submitLabel={t(
          "stock.pages.save",
        )}
        loading={saving}
        onSubmit={
          handleSubmit
        }
      />
    </section>
  );
}

export default EditArticlePage;