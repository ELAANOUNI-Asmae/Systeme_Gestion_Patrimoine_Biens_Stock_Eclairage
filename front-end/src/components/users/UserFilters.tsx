import { Search } from "lucide-react";

import type { UserFilters as UserFiltersType } from "../../types/user";

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
  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
      <div className="relative">
        <Search
          size={19}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
          placeholder="Rechercher par nom, e-mail ou CIN..."
          className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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
        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      >
        <option value="">Tous les rôles</option>

        {roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>
  );
}

export default UserFilters;