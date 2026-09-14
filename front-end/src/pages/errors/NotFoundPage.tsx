import {
  ArrowLeft,
  SearchX,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import {
  ROUTES,
} from "../../constants/routes";

function NotFoundPage() {
  const {
    t,
  } = useTranslation();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 transition-colors dark:bg-slate-950">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
          <SearchX
            size={38}
          />
        </div>

        <p className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-orange-600 dark:text-orange-400">
          {t(
            "errors.notFound.code",
          )}
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
          {t(
            "errors.notFound.title",
          )}
        </h1>

        <p className="mt-4 leading-7 text-slate-500 dark:text-slate-400">
          {t(
            "errors.notFound.description",
          )}
        </p>

        <Link
          to={
            ROUTES.DASHBOARD
          }
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          <ArrowLeft
            size={18}
            className="rtl:rotate-180"
          />

          {t(
            "errors.actions.dashboard",
          )}
        </Link>
      </div>
    </main>
  );
}

export default NotFoundPage;