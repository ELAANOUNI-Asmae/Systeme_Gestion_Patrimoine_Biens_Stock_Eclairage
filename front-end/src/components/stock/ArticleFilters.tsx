
import { Barcode, Search } from "lucide-react";
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
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

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
          placeholder={tr(
            "Référence, code-barres, marque ou désignation",
            "المرجع أو الباركود أو العلامة أو التسمية",
          )}
          className="h-11 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />

        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Barcode size={14} />
          {tr(
            "Le lecteur code-barres USB/Bluetooth peut écrire directement dans cette barre.",
            "يمكن لقارئ الباركود USB/Bluetooth الكتابة مباشرة في شريط البحث.",
          )}
        </p>
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

        {tr(
          "Stock faible uniquement",
          "المخزون المنخفض فقط",
        )}
      </label>
    </div>
  );
}

export default ArticleFilters;
