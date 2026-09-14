import {
  Languages,
  Moon,
  Sun,
} from "lucide-react";

import {
  useTranslation,
} from "react-i18next";

import LoginForm from "../../components/auth/LoginForm";
import Logo from "../../components/common/Logo";

import {
  useTheme,
} from "../../hooks/useTheme";

function LoginPage() {
  const {
    t,
    i18n,
  } = useTranslation();

  const {
    theme,
    toggleTheme,
  } = useTheme();

  const isArabic =
    i18n.language.startsWith(
      "ar",
    );

  const handleLanguageChange =
    async () => {
      await i18n.changeLanguage(
        isArabic
          ? "fr"
          : "ar",
      );
    };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 transition-colors dark:bg-slate-950">
      <div className="absolute inset-e-4 top-4 z-30 flex items-center gap-2 sm:inset-e-6 sm:top-6">
        <button
          type="button"
          onClick={() => {
            void handleLanguageChange();
          }}
          className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-orange-200 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-orange-500/40 dark:hover:text-orange-400"
        >
          <Languages size={18} />

          <span>
            {isArabic
              ? "FR"
              : "العربية"}
          </span>
        </button>

        <button
          type="button"
          onClick={
            toggleTheme
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:border-orange-200 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-orange-500/40 dark:hover:text-amber-400"
          aria-label={
            theme === "dark"
              ? t(
                  "header.lightMode",
                )
              : t(
                  "header.darkMode",
                )
          }
        >
          {theme ===
          "dark" ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
        </button>
      </div>

      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative flex items-center justify-center px-6 py-20 sm:px-10">
          <div className="moroccan-pattern absolute inset-x-0 top-0 h-28 opacity-70" />

          <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-200/70 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30 sm:p-10">
            <div className="mb-8">
              <Logo className="mb-6 h-20 w-20 object-contain" />

              <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-orange-500">
                SGPBSE
              </p>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t(
                  "auth.welcome",
                )}
              </h1>

              <p className="mt-3 leading-6 text-slate-500 dark:text-slate-400">
                {t(
                  "auth.description",
                )}
              </p>
            </div>

            <LoginForm />

            <p className="mt-8 text-center text-xs leading-5 text-slate-400 dark:text-slate-500">
              {t(
                "auth.reservedAccess",
              )}
            </p>
          </div>
        </section>

        <section className="relative hidden overflow-hidden bg-linear-to-br from-orange-600 via-amber-500 to-teal-700 lg:flex lg:items-center lg:justify-center">
          <div className="moroccan-pattern absolute inset-0 opacity-50" />

          <div className="absolute -inset-s-24 -top-24 h-80 w-80 rounded-full bg-white/15 blur-3xl" />

          <div className="absolute -bottom-24 -inset-s-20 h-96 w-96 rounded-full bg-slate-950/20 blur-3xl" />

          <div className="relative z-10 max-w-xl px-12 text-center text-white">
            <div className="mx-auto mb-8 flex h-64 w-64 items-center justify-center rounded-full border border-white/20 bg-white/15 shadow-2xl backdrop-blur-md">
              <Logo className="h-52 w-52 object-contain drop-shadow-2xl" />
            </div>

            <h2 className="text-4xl font-extrabold leading-tight">
              {t(
                "auth.heroTitle",
              )}
            </h2>

            <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-white/90">
              {t(
                "auth.heroDescription",
              )}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
