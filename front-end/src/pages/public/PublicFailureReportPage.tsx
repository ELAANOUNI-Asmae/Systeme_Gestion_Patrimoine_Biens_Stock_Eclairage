import {
  ArrowLeft,
  CheckCircle2,
  Globe2,
  Lightbulb,
  MapPin,
  Search,
  Send,
  TriangleAlert,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import DocumentManager from "../../components/documents/DocumentManager";

import {
  ROUTES,
} from "../../constants/routes";

import {
  lightingService,
} from "../../services/lightingService";

import type {
  Failure,
  Light,
} from "../../types/lighting";

import type {
  AppDocument,
} from "../../types/document";

function PublicFailureReportPage() {
  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith(
      "ar",
    );

  const [
    lights,
    setLights,
  ] = useState<Light[]>([]);

  const [
    failures,
    setFailures,
  ] = useState<Failure[]>([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedLightId,
    setSelectedLightId,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    documents,
    setDocuments,
  ] =
    useState<AppDocument[]>(
      [],
    );

  const [
    loadingPage,
    setLoadingPage,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    createdFailure,
    setCreatedFailure,
  ] =
    useState<Failure | null>(
      null,
    );

  const loadData =
    async () => {
      try {
        setLoadingPage(true);
        setError("");

        const [
          lightsData,
          failuresData,
        ] = await Promise.all([
          lightingService.getLights(),
          lightingService.getFailures(),
        ]);

        setLights(
          lightsData,
        );

        setFailures(
          failuresData,
        );
      } catch {
        setError(
          t(
            "lighting.publicFailure.loadError",
          ),
        );
      } finally {
        setLoadingPage(false);
      }
    };

  useEffect(() => {
    void loadData();
  }, []);

  const unresolvedLightIds =
    useMemo(
      () =>
        new Set(
          failures
            .filter(
              (failure) =>
                failure.status !==
                "RESOLVED",
            )
            .map(
              (failure) =>
                failure.lightId,
            ),
        ),
      [failures],
    );

  const filteredLights =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return lights;
      }

      return lights.filter(
        (light) =>
          light.reference
            .toLowerCase()
            .includes(value) ||
          light.designation
            .toLowerCase()
            .includes(value) ||
          light.designationAr
            .toLowerCase()
            .includes(value) ||
          light.zone
            .toLowerCase()
            .includes(value) ||
          light.zoneAr
            .toLowerCase()
            .includes(value) ||
          light.address
            .toLowerCase()
            .includes(value) ||
          light.addressAr
            .toLowerCase()
            .includes(value),
      );
    }, [
      lights,
      search,
    ]);

  const selectedLight =
    lights.find(
      (light) =>
        light.id ===
        Number(
          selectedLightId,
        ),
    ) ?? null;

  const designation = (
    light: Light,
  ) =>
    isArabic
      ? light.designationAr
      : light.designation;

  const zone = (
    light: Light,
  ) =>
    isArabic
      ? light.zoneAr
      : light.zone;

  const address = (
    light: Light,
  ) =>
    isArabic
      ? light.addressAr
      : light.address;

  const changeLanguage =
    async (
      language: "fr" | "ar",
    ) => {
      await i18n.changeLanguage(
        language,
      );
    };

  const resetForm = () => {
    setSearch("");
    setSelectedLightId("");
    setDescription("");
    setDocuments([]);
    setError("");
    setCreatedFailure(null);

    void loadData();
  };

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (!selectedLight) {
        setError(
          t(
            "lighting.publicFailure.requiredLight",
          ),
        );

        return;
      }

      if (
        unresolvedLightIds.has(
          selectedLight.id,
        )
      ) {
        setError(
          t(
            "lighting.publicFailure.alreadyReported",
          ),
        );

        return;
      }

      if (
        !description.trim()
      ) {
        setError(
          t(
            "lighting.publicFailure.requiredDescription",
          ),
        );

        return;
      }

      try {
        setSubmitting(true);
        setError("");

        const failure =
          await lightingService.createFailure(
            {
              lightId:
                selectedLight.id,

              description:
                description.trim(),

              reportedBy:
                "PUBLIC",

              documents,
            },
          );

        setCreatedFailure(
          failure,
        );

        setFailures(
          (previous) => [
            failure,
            ...previous,
          ],
        );
      } catch {
        setError(
          t(
            "lighting.publicFailure.submitError",
          ),
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to={
              ROUTES.LOGIN
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-orange-600 dark:text-slate-300 dark:hover:text-orange-400"
          >
            <ArrowLeft
              size={18}
              className={
                isArabic
                  ? "rotate-180"
                  : ""
              }
            />

            {t(
              "lighting.publicFailure.backToLogin",
            )}
          </Link>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <Globe2
              size={18}
              className="mx-2 text-slate-400"
            />

            <button
              type="button"
              onClick={() => {
                void changeLanguage(
                  "fr",
                );
              }}
              className={[
                "rounded-lg px-3 py-2 text-sm font-semibold transition",
                !isArabic
                  ? "bg-orange-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
              ].join(" ")}
            >
              FR
            </button>

            <button
              type="button"
              onClick={() => {
                void changeLanguage(
                  "ar",
                );
              }}
              className={[
                "rounded-lg px-3 py-2 text-sm font-semibold transition",
                isArabic
                  ? "bg-orange-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
              ].join(" ")}
            >
              العربية
            </button>
          </div>
        </header>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 bg-gradient-to-br from-orange-50 to-white p-6 dark:border-slate-700 dark:from-orange-950/30 dark:to-slate-900 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-sm">
                <Lightbulb
                  size={28}
                />
              </div>

              <div>
                <div className="mb-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-500/15 dark:text-green-300">
                  {t(
                    "lighting.publicFailure.publicAccess",
                  )}
                </div>

                <h1 className="text-2xl font-bold sm:text-3xl">
                  {t(
                    "lighting.publicFailure.title",
                  )}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                  {t(
                    "lighting.publicFailure.description",
                  )}
                </p>
              </div>
            </div>
          </div>

          {createdFailure ? (
            <div className="p-6 sm:p-8">
              <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-800/50 dark:bg-green-950/20">
                <CheckCircle2
                  size={48}
                  className="mx-auto text-green-600 dark:text-green-400"
                />

                <h2 className="mt-4 text-xl font-bold text-green-800 dark:text-green-300">
                  {t(
                    "lighting.publicFailure.successTitle",
                  )}
                </h2>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-green-700 dark:text-green-400">
                  {t(
                    "lighting.publicFailure.successDescription",
                  )}
                </p>

                <div className="mx-auto mt-5 max-w-sm rounded-xl border border-green-200 bg-white p-4 dark:border-green-800/50 dark:bg-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t(
                      "lighting.publicFailure.reportNumber",
                    )}
                  </p>

                  <p
                    className="mt-1 text-lg font-bold text-slate-900 dark:text-white"
                    dir="ltr"
                  >
                    #{createdFailure.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
                >
                  <TriangleAlert
                    size={18}
                  />

                  {t(
                    "lighting.publicFailure.anotherReport",
                  )}
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-6 p-6 sm:p-8"
            >
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
                >
                  {error}
                </div>
              )}

              <section>
                <h2 className="text-lg font-bold">
                  {t(
                    "lighting.publicFailure.choosePointTitle",
                  )}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t(
                    "lighting.publicFailure.choosePointDescription",
                  )}
                </p>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t(
                        "lighting.publicFailure.search",
                      )}

                      <div className="relative mt-1">
                        <Search
                          size={18}
                          className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="search"
                          value={
                            search
                          }
                          onChange={(
                            event,
                          ) =>
                            setSearch(
                              event
                                .target
                                .value,
                            )
                          }
                          placeholder={t(
                            "lighting.publicFailure.searchPlaceholder",
                          )}
                          className="h-11 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:focus:ring-orange-500/20"
                        />
                      </div>
                    </label>
                  </div>

                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t(
                      "lighting.publicFailure.light",
                    )}{" "}
                    *

                    <select
                      value={
                        selectedLightId
                      }
                      onChange={(
                        event,
                      ) => {
                        setSelectedLightId(
                          event
                            .target
                            .value,
                        );

                        setError("");
                      }}
                      disabled={
                        loadingPage
                      }
                      className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:focus:ring-orange-500/20"
                    >
                      <option value="">
                        {loadingPage
                          ? t(
                              "lighting.publicFailure.loading",
                            )
                          : t(
                              "lighting.publicFailure.chooseLight",
                            )}
                      </option>

                      {filteredLights.map(
                        (light) => {
                          const alreadyReported =
                            unresolvedLightIds.has(
                              light.id,
                            );

                          return (
                            <option
                              key={
                                light.id
                              }
                              value={
                                light.id
                              }
                              disabled={
                                alreadyReported
                              }
                            >
                              {
                                light.reference
                              }
                              {" — "}
                              {
                                designation(
                                  light,
                                )
                              }
                              {alreadyReported
                                ? ` — ${t(
                                    "lighting.publicFailure.alreadyReportedShort",
                                  )}`
                                : ""}
                            </option>
                          );
                        },
                      )}
                    </select>
                  </label>
                </div>

                {selectedLight && (
                  <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800/40 dark:bg-orange-950/20">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 shrink-0 text-orange-600 dark:text-orange-400" />

                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {designation(
                            selectedLight,
                          )}
                        </p>

                        <p
                          className="mt-1 text-xs text-slate-500 dark:text-slate-400"
                          dir="ltr"
                        >
                          {
                            selectedLight.reference
                          }
                        </p>

                        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                          {zone(
                            selectedLight,
                          )}
                          {" · "}
                          {address(
                            selectedLight,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <div className="border-t border-slate-200 dark:border-slate-700" />

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t(
                  "lighting.publicFailure.failureDescription",
                )}{" "}
                *

                <textarea
                  rows={5}
                  value={
                    description
                  }
                  onChange={(
                    event,
                  ) => {
                    setDescription(
                      event
                        .target
                        .value,
                    );

                    setError("");
                  }}
                  placeholder={t(
                    "lighting.publicFailure.failurePlaceholder",
                  )}
                  className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:focus:ring-orange-500/20"
                />
              </label>

              <DocumentManager
                documents={
                  documents
                }
                onChange={
                  setDocuments
                }
              />

              <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-700 rtl:justify-start">
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    loadingPage
                  }
                  className="inline-flex min-w-48 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send
                    size={18}
                  />

                  {submitting
                    ? t(
                        "lighting.publicFailure.submitting",
                      )
                    : t(
                        "lighting.publicFailure.submit",
                      )}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

export default PublicFailureReportPage;
