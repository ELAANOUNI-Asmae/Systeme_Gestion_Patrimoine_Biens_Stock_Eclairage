import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

type ArticleFiltersProps = {
  search: string;
  alertOnly: boolean;
  onSearchChange: (value: string) => void;
  onAlertOnlyChange: (value: boolean) => void;
};

function ArticleFilters({
  search,
  alertOnly,
  onSearchChange,
  onAlertOnlyChange,
}: ArticleFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:flex-row">
      <div className="relative flex-1">
        <Search
          size={19}
          className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder={t("stock.filters.searchPlaceholder")}
          className="h-11 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-orange-500/20"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200">
        <input
          type="checkbox"
          checked={alertOnly}
          onChange={(event) =>
            onAlertOnlyChange(event.target.checked)
          }
          className="h-4 w-4 accent-orange-600"
        />

        {t("stock.filters.lowStockOnly")}
      </label>
    </div>
  );
}

export default ArticleFilters;