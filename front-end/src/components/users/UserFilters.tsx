import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { UserFilters as UserFiltersType } from "../../types/user";

import { getRoleLabel } from "../../utils/roleLabels";

type UserFiltersProps = {
  filters: UserFiltersType;
  roles: string[];
  onChange: (filters: UserFiltersType) => void;
};

function UserFilters({
  filters,
  roles,
  onChange,
}: UserFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:grid-cols-[1fr_220px]">
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
              search: event.target.value,
            })
          }
          placeholder={t("users.searchPlaceholder")}
          className="h-11 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-4 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <select
        value={filters.role}
        onChange={(event) =>
          onChange({
            ...filters,
            role: event.target.value,
          })
        }
        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
        <option value="">
          {t("users.allRoles")}
        </option>

        {roles.map((role) => (
          <option
            key={role}
            value={role}
          >
            {getRoleLabel(
              role,
              t,
            )}
          </option>
        ))}
      </select>
    </div>
  );
}

export default UserFilters;