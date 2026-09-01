
import { Archive, ArrowLeft, Eye, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ROUTES } from "../../constants/routes";
import { bienService } from "../../services/bienService";
import type { Bien } from "../../types/bien";

function BiensArchivePage() {
  const { i18n } = useTranslation();
  const ar = i18n.language.startsWith("ar");
  const tr = (fr: string, arText: string) => (ar ? arText : fr);

  const [biens, setBiens] = useState<Bien[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setBiens(await bienService.getArchived());
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return biens.filter(
      (bien) =>
        !q ||
        bien.designation.toLowerCase().includes(q) ||
        bien.designationAr.toLowerCase().includes(q) ||
        bien.inventoryId.toLowerCase().includes(q),
    );
  }, [biens, search]);

  return (
    <section className="space-y-6">
      <Link
        to={ROUTES.BIENS}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600 dark:text-slate-400"
      >
        <ArrowLeft size={18} className="rtl:rotate-180" />
        {tr("Retour aux biens", "العودة إلى الممتلكات")}
      </Link>

      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          <Archive className="text-orange-600" />
          {tr("Archive des biens cédés", "أرشيف الممتلكات المفوّتة")}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {tr(
            "Cette page contient uniquement les biens cédés.",
            "تحتوي هذه الصفحة فقط على الممتلكات المفوّتة.",
          )}
        </p>
      </div>

      <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <Search
          size={19}
          className="pointer-events-none absolute inset-s-7 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={tr(
            "Rechercher par désignation ou inventaire",
            "البحث بالتسمية أو رقم الجرد",
          )}
          className="h-11 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-4 text-sm outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-900"
        />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-800">
          {tr("Chargement", "جارٍ التحميل")}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-800">
          {tr("Aucun bien cédé", "لا توجد ممتلكات مفوّتة")}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                    {tr("Bien", "الممتلك")}
                  </th>
                  <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                    {tr("Date de cession", "تاريخ التفويت")}
                  </th>
                  <th className="px-5 py-4 text-start text-xs font-semibold uppercase text-slate-500">
                    {tr("Statut", "الحالة")}
                  </th>
                  <th className="px-5 py-4 text-end text-xs font-semibold uppercase text-slate-500">
                    {tr("Action", "الإجراء")}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((bien) => (
                  <tr key={bien.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold">
                        {ar ? bien.designationAr : bien.designation}
                      </p>
                      <p className="text-xs text-slate-500">
                        {bien.inventoryId}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {bien.archive.archivedAt ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                        {tr("Cédé", "مفوّت")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-end">
                      <Link
                        to={`/biens/${bien.id}`}
                        className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10"
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default BiensArchivePage;
