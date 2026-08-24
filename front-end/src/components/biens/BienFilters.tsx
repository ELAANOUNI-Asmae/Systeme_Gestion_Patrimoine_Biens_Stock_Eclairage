import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  assetStatuses,
  assetTypes,
} from "../../mock/biens";

import type {
  BienFilters as BienFiltersType,
} from "../../types/bien";

function BienFilters({
  filters,
  onChange,
}: {
  filters: BienFiltersType;
  onChange: (
    filters: BienFiltersType,
  ) => void;
}) {
  const { t } =
    useTranslation();

  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:grid-cols-[1fr_220px_220px]">
      <div className="relative">
        <Search
          size={19}
          className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={filters.search}
          onChange={(event) =>
            onChange({
              ...filters,
              search:
                event.target.value,
            })
          }
          placeholder={t(
            "biens.searchPlaceholder",
          )}
          className="h-11 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-4 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <select
        value={filters.type}
        onChange={(event) =>
          onChange({
            ...filters,
            type:
              event.target
                .value as BienFiltersType["type"],
          })
        }
        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
        <option value="">
          {t("biens.allTypes")}
        </option>

        {assetTypes.map(
          (type) => (
            <option
              key={type}
              value={type}
            >
              {t(
                `biens.types.${type}`,
              )}
            </option>
          ),
        )}
      </select>

      <select
        value={filters.status}
        onChange={(event) =>
          onChange({
            ...filters,
            status:
              event.target
                .value as BienFiltersType["status"],
          })
        }
        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
        <option value="">
          {t(
            "biens.allStatuses",
          )}
        </option>

        {assetStatuses.map(
          (status) => (
            <option
              key={status}
              value={status}
            >
              {t(
                `biens.statuses.${status}`,
              )}
            </option>
          ),
        )}
      </select>
    </div>
  );
}

export default BienFilters;