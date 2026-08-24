import {
  Archive,
  ArrowLeft,
  Eye,
  Search,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import {
  ROUTES,
} from "../../constants/routes";

import {
  bienService,
} from "../../services/bienService";

import type {
  ArchiveReason,
  Bien,
} from "../../types/bien";

const archiveReasons: ArchiveReason[] = [
  "SOLD",
  "DISPOSED",
  "DESTROYED",
  "TRANSFERRED",
  "REFORMED",
  "OTHER",
];

function BiensArchivePage() {
  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith("ar");

  const [
    biens,
    setBiens,
  ] = useState<Bien[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    reason,
    setReason,
  ] = useState<
    ArchiveReason | ""
  >("");

  useEffect(() => {
    const loadArchivedBiens =
      async () => {
        try {
          setLoading(true);

          const data =
            await bienService.getArchived();

          setBiens(data);
        } finally {
          setLoading(false);
        }
      };

    void loadArchivedBiens();
  }, []);

  const filteredBiens =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return biens.filter(
        (bien) => {
          const matchesSearch =
            !normalizedSearch ||
            bien.designation
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            bien.designationAr
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            bien.inventoryId
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesReason =
            !reason ||
            bien.archive.reason ===
              reason;

          return (
            matchesSearch &&
            matchesReason
          );
        },
      );
    }, [
      biens,
      search,
      reason,
    ]);

  return (
    <section className="space-y-6">
      {/* HEADER */}

      <div>
        <Link
          to={ROUTES.BIENS}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
        >
          <ArrowLeft
            size={18}
            className="rtl:rotate-180"
          />

          {t(
            "biens.archive.back",
          )}
        </Link>

        <div className="mt-4 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
            <Archive
              size={23}
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {t(
                "biens.archive.title",
              )}
            </h1>

            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {t(
                "biens.archive.description",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* FILTERS */}

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:grid-cols-[1fr_260px]">
        <div className="relative">
          <Search
            size={19}
            className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder={t(
              "biens.archive.searchPlaceholder",
            )}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-4 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <select
          value={reason}
          onChange={(event) =>
            setReason(
              event.target
                .value as
                | ArchiveReason
                | "",
            )
          }
          className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="">
            {t(
              "biens.archive.allReasons",
            )}
          </option>

          {archiveReasons.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {t(
                  `biens.archive.reasons.${item}`,
                )}
              </option>
            ),
          )}
        </select>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t(
          "biens.archive.count",
          {
            count:
              filteredBiens.length,
          },
        )}
      </p>

      {/* CONTENT */}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          {t(
            "biens.archive.loading",
          )}
        </div>
      ) : filteredBiens.length ===
        0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <Archive
            size={38}
            className="mx-auto text-slate-300 dark:text-slate-600"
          />

          <p className="mt-4 font-semibold text-slate-700 dark:text-slate-200">
            {t(
              "biens.archive.empty",
            )}
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t(
              "biens.archive.emptyDescription",
            )}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                    {t(
                      "biens.archive.columns.bien",
                    )}
                  </th>

                  <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                    {t(
                      "biens.archive.columns.type",
                    )}
                  </th>

                  <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                    {t(
                      "biens.archive.columns.exitDate",
                    )}
                  </th>

                  <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                    {t(
                      "biens.archive.columns.reason",
                    )}
                  </th>

                  <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                    {t(
                      "biens.archive.columns.value",
                    )}
                  </th>

                  <th className="px-5 py-4 text-end text-xs font-semibold uppercase text-slate-500">
                    {t(
                      "biens.archive.columns.actions",
                    )}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredBiens.map(
                  (bien) => {
                    const designation =
                      isArabic
                        ? bien.designationAr
                        : bien.designation;

                    const archiveReason =
                      bien.archive
                        .reason ??
                      "OTHER";

                    return (
                      <tr
                        key={
                          bien.id
                        }
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-100">
                            {
                              designation
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {
                              bien.inventoryId
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {t(
                            `biens.types.${bien.type}`,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {bien.archive
                            .archivedAt ??
                            "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                            {t(
                              `biens.archive.reasons.${archiveReason}`,
                            )}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                          {bien.purchaseValue.toLocaleString(
                            isArabic
                              ? "ar-MA"
                              : "fr-MA",
                          )}{" "}
                          DH
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end rtl:justify-start">
                            <Link
                              to={`/biens/${bien.id}`}
                              title={t(
                                "biens.view",
                              )}
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                            >
                              <Eye
                                size={18}
                              />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default BiensArchivePage;