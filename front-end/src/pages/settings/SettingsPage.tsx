import {
  Bell,
  Building2,
  Globe2,
  Save,
  Settings,
} from "lucide-react";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  useTranslation,
} from "react-i18next";

import {
  DEFAULT_SETTINGS,
  settingsService,
  type AppSettings,
} from "../../services/settingsService";

function SettingsPage() {
  const {
    t,
    i18n,
  } = useTranslation();

  const [
    formData,
    setFormData,
  ] =
    useState<AppSettings>(
      DEFAULT_SETTINGS,
    );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const settings =
      settingsService.get();

    setFormData({
      ...settings,

      language:
        i18n.language.startsWith(
          "ar",
        )
          ? "AR"
          : "FR",
    });
  }, []);

  const updateField = <
    K extends keyof AppSettings,
  >(
    field: K,
    value: AppSettings[K],
  ) => {
    setFormData(
      (previous) => ({
        ...previous,
        [field]: value,
      }),
    );

    setError("");
    setSuccess("");
  };

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !formData.communeName.trim() ||
        !formData.communeCity.trim()
      ) {
        setError(
          t(
            "settings.errors.required",
          ),
        );

        return;
      }

      try {
        setLoading(true);
        setError("");
        setSuccess("");

        await new Promise<void>(
          (resolve) => {
            window.setTimeout(
              resolve,
              300,
            );
          },
        );

        const cleanSettings:
          AppSettings = {
          ...formData,

          communeName:
            formData.communeName.trim(),

          communeCity:
            formData.communeCity.trim(),
        };

        settingsService.save(
          cleanSettings,
        );

        setFormData(
          cleanSettings,
        );

        const nextLanguage =
          cleanSettings.language ===
          "AR"
            ? "ar"
            : "fr";

        if (
          !i18n.language.startsWith(
            nextLanguage,
          )
        ) {
          await i18n.changeLanguage(
            nextLanguage,
          );
        }

        setSuccess(
          t(
            "settings.success.saved",
          ),
        );

        window.setTimeout(
          () => {
            setSuccess("");
          },
          3000,
        );
      } catch {
        setError(
          t(
            "settings.errors.save",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

  const inputClassName =
    "mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-orange-500 dark:focus:ring-orange-500/20";

  return (
    <section className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          <Settings className="text-orange-600 dark:text-orange-400" />

          {t(
            "settings.page.title",
          )}
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {t(
            "settings.page.description",
          )}
        </p>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >
        {/* MESSAGES */}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-400">
            {success}
          </div>
        )}

        {/* COMMUNE */}

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
              <Building2
                size={21}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t(
                  "settings.commune.title",
                )}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t(
                  "settings.commune.description",
                )}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t(
                "settings.commune.name",
              )}

              <input
                type="text"
                value={
                  formData.communeName
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "communeName",
                    event.target
                      .value,
                  )
                }
                disabled={
                  loading
                }
                className={
                  inputClassName
                }
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t(
                "settings.commune.city",
              )}

              <input
                type="text"
                value={
                  formData.communeCity
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "communeCity",
                    event.target
                      .value,
                  )
                }
                disabled={
                  loading
                }
                className={
                  inputClassName
                }
              />
            </label>
          </div>
        </article>

        {/* LANGUAGE */}

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
              <Globe2
                size={21}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t(
                  "settings.language.title",
                )}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t(
                  "settings.language.description",
                )}
              </p>
            </div>
          </div>

          <div className="mt-6 max-w-md">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t(
                "settings.language.label",
              )}

              <select
                value={
                  formData.language
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "language",
                    event.target
                      .value as AppSettings["language"],
                  )
                }
                disabled={
                  loading
                }
                className={
                  inputClassName
                }
              >
                <option value="FR">
                  Français
                </option>

                <option value="AR">
                  العربية
                </option>
              </select>
            </label>

            <p className="mt-2 text-xs leading-5 text-slate-400 dark:text-slate-500">
              {t(
                "settings.language.help",
              )}
            </p>
          </div>
        </article>

        {/* NOTIFICATIONS */}

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
              <Bell
                size={21}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t(
                  "settings.notifications.title",
                )}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t(
                  "settings.notifications.description",
                )}
              </p>
            </div>
          </div>

          <label className="mt-6 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-orange-200 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-orange-500/30">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {t(
                  "settings.notifications.enable",
                )}
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {t(
                  "settings.notifications.enableDescription",
                )}
              </p>
            </div>

            <input
              type="checkbox"
              checked={
                formData.notificationsEnabled
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "notificationsEnabled",
                  event.target
                    .checked,
                )
              }
              disabled={
                loading
              }
              className="h-5 w-5 shrink-0 accent-orange-600"
            />
          </label>
        </article>

        {/* SAVE */}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              loading
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save
              size={18}
            />

            {loading
              ? t(
                  "settings.actions.saving",
                )
              : t(
                  "settings.actions.save",
                )}
          </button>
        </div>
      </form>
    </section>
  );
}

export default SettingsPage;