
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  CalendarDays,
  History,
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
import { stockService } from "../../services/stockService";
import {
  calculateTotalTtc,
  type StockMovement,
  type StockMovementType,
} from "../../types/stock";

type MovementFilter =
  | "ALL"
  | StockMovementType;

function StockHistoryPage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const [movements, setMovements] =
    useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] =
    useState<MovementFilter>("ALL");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setMovements(await stockService.getMovements());
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return movements.filter((movement) => {
      const matchesSearch =
        !q ||
        movement.articleDesignation.toLowerCase().includes(q) ||
        movement.articleDesignationAr.toLowerCase().includes(q) ||
        movement.reason.toLowerCase().includes(q) ||
        movement.performedBy.toLowerCase().includes(q) ||
        (movement.reference ?? "").toLowerCase().includes(q);

      const matchesType =
        typeFilter === "ALL" ||
        movement.type === typeFilter;

      const matchesDate =
        !dateFilter ||
        movement.date === dateFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesDate
      );
    });
  }, [movements, search, typeFilter, dateFilter]);

  return (
    <section className="space-y-6">
      <div>
        <Link
          to={ROUTES.STOCK}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600"
        >
          <ArrowLeft size={18} className="rtl:rotate-180" />
          {tr("Retour au stock", "العودة إلى المخزون")}
        </Link>

        <h1 className="mt-4 flex items-center gap-3 text-2xl font-bold sm:text-3xl">
          <History className="text-orange-600" />
          {tr("Historique du stock", "سجل المخزون")}
        </h1>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:grid-cols-[1fr_220px_220px]">
        <div className="relative">
          <Search
            size={19}
            className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder={tr(
              "Article, motif, référence ou agent",
              "المادة أو السبب أو المرجع أو الموظف",
            )}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-4 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(
              event.target.value as MovementFilter,
            )
          }
          className="h-11 rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
        >
          <option value="ALL">
            {tr("Tous les types", "كل الأنواع")}
          </option>
          <option value="ENTRY">
            {tr("Entrées", "الإدخالات")}
          </option>
          <option value="EXIT">
            {tr("Sorties", "الإخراجات")}
          </option>
        </select>

        <div className="relative">
          <CalendarDays
            size={18}
            className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(event.target.value)
            }
            className="h-11 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-3 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            {tr("Chargement", "جارٍ التحميل")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {tr("Aucun mouvement", "لا توجد حركات")}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.map((movement) => {
              const entry = movement.type === "ENTRY";
              const designation =
                isArabic
                  ? movement.articleDesignationAr
                  : movement.articleDesignation;
              const totalTtc = calculateTotalTtc(
                movement.quantity,
                movement.unitPriceHt,
                movement.vatRate,
              );

              return (
                <article key={movement.id} className="p-5">
                  <div className="flex gap-4">
                    <div
                      className={[
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                        entry
                          ? "bg-green-100 text-green-600"
                          : "bg-orange-100 text-orange-600",
                      ].join(" ")}
                    >
                      {entry ? (
                        <ArrowDownToLine size={21} />
                      ) : (
                        <ArrowUpFromLine size={21} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <div>
                          <h2 className="font-semibold">
                            {designation}
                          </h2>
                          <p className="mt-1 text-sm">
                            {entry
                              ? tr("Entrée", "إدخال")
                              : tr("Sortie", "إخراج")}{" "}
                            · {movement.quantity}
                          </p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            {movement.reason}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            {tr("PU HT", "ثمن الوحدة بدون الضريبة")}:{" "}
                            {movement.unitPriceHt.toFixed(2)} DH ·{" "}
                            {tr("TVA", "الضريبة")}:{" "}
                            {movement.vatRate.toFixed(2)}% ·{" "}
                            {tr("Total TTC", "الإجمالي شامل الضريبة")}:{" "}
                            {totalTtc.toFixed(2)} DH
                          </p>
                        </div>

                        <div className="text-sm text-slate-500 sm:text-end">
                          <p>{movement.date}</p>
                          <p className="mt-1">
                            {movement.performedBy}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default StockHistoryPage;
