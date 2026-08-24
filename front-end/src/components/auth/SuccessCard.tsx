import {
  CheckCircle,
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

function SuccessCard() {
  const {
    t,
  } = useTranslation();

  return (
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg transition-colors dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col items-center text-center">
        <CheckCircle
          size={70}
          className="mb-5 text-green-500"
        />

        <h1 className="mb-3 text-2xl font-bold text-slate-800 dark:text-white">
          {t(
            "auth.forgot.successTitle",
          )}
        </h1>

        <p className="mb-8 leading-7 text-slate-600 dark:text-slate-400">
          {t(
            "auth.forgot.successDescription",
          )}
        </p>

        <Link
          to={
            ROUTES.LOGIN
          }
          className="w-full rounded-lg bg-orange-500 px-4 py-3 text-center font-semibold text-white transition hover:bg-orange-600"
        >
          {t(
            "auth.forgot.backToLogin",
          )}
        </Link>
      </div>
    </section>
  );
}

export default SuccessCard;