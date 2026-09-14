import {
  Archive,
  ArrowLeft,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ROUTES } from "../../constants/routes";

import {
  bienApiService,
  type BienApiListItem,
} from "../../services/bienApiService";

function BiensArchivePage() {
  const { i18n } =
    useTranslation();

  const isArabic =
    i18n.language.startsWith(
      "ar",
    );

  const tr = (
    fr: string,
    ar: string,
  ) =>
    isArabic ? ar : fr;

  const [biens, setBiens] =
    useState<
      BienApiListItem[]
    >([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const load =
    async () => {
      try {
        setLoading(true);
        setError("");

        setBiens(
          await bienApiService.getArchived(),
        );
      } catch (loadError) {
        console.error(
          "Load archived assets failed:",
          loadError,
        );

        setBiens([]);

        setError(
          tr(
            "Impossible de charger les biens archivés.",
            "تعذر تحميل الممتلكات المؤرشفة.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void load();
  }, []);

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return biens.filter(
        (bien) =>
          !query ||
          bien.designation
            .toLowerCase()
            .includes(query) ||
          bien.inventoryNumber
            .toLowerCase()
            .includes(query) ||
          (bien.assignment ?? "")
            .toLowerCase()
            .includes(query),
      );
    }, [biens, search]);

  return (
    <section className="space-y-6">
      <Link
        to={ROUTES.BIENS}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600 dark:text-slate-400"
      >
        <ArrowLeft
          size={18}
          className="rtl:rotate-180"
        />

        {tr(
          "Retour aux biens",
          "العودة إلى الممتلكات",
        )}
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            <Archive className="text-orange-600" />

            {tr(
              "Archive des biens cédés",
              "أرشيف الممتلكات المفوّتة",
            )}
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {tr(
              "Les biens cédés sont retirés de la liste active et conservés ici.",
              "يتم حذف الممتلكات المفوّتة من اللائحة النشطة والاحتفاظ بها هنا.",
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void load()
          }
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          <RefreshCw
            size={18}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          {tr(
            "Actualiser",
            "تحديث",
          )}
        </button>
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(
            event,
          ) =>
            setSearch(
              event.target.value,
            )
          }
          placeholder={tr(
            "Rechercher par désignation, inventaire ou affectation...",
            "البحث بالتسمية أو رقم الجرد أو الجهة المستعملة...",
          )}
          className="h-12 w-full rounded-xl border border-slate-300 bg-white ps-11 pe-4 text-sm outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-800"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800">
          {tr(
            "Chargement des archives...",
            "جارٍ تحميل الأرشيف...",
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-800">
          <Archive
            size={36}
            className="mx-auto text-slate-400"
          />

          <p className="mt-3 font-semibold text-slate-700 dark:text-slate-200">
            {tr(
              "Aucun bien archivé",
              "لا توجد ممتلكات مؤرشفة",
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
                    {tr(
                      "Bien",
                      "الممتلك",
                    )}
                  </th>

                  <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                    {tr(
                      "Affectation",
                      "الجهة المستعملة",
                    )}
                  </th>

                  <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                    {tr(
                      "Date de cession",
                      "تاريخ التفويت",
                    )}
                  </th>

                  <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                    {tr(
                      "Statut",
                      "الحالة",
                    )}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map(
                  (bien) => (
                    <tr
                      key={
                        bien.key
                      }
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                          {
                            bien.designation
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {
                            bien.inventoryNumber
                          }
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {bien.assignment ??
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {bien.archivedAt ??
                          "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                          {tr(
                            "Archivé après cession",
                            "مؤرشف بعد التفويت",
                          )}
                        </span>
                      </td>
                    </tr>
                  ),
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
