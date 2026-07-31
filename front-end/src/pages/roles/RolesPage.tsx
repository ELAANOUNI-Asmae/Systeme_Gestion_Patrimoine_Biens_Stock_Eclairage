import {
  Plus,
  Search,
  Shield,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import RoleTable from "../../components/roles/RoleTable";
import { roleService } from "../../services/roleService";
import type { Role } from "../../types/role";

function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await roleService.getAll();
      setRoles(data);
    } catch {
      setError("Impossible de charger les rôles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRoles();
  }, []);

  const filteredRoles = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return roles.filter((role) =>
      role.name.toLowerCase().includes(normalizedSearch),
    );
  }, [roles, search]);

  const handleDelete = async (role: Role) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le rôle ${role.name} ?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await roleService.remove(role.id);
      await loadRoles();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de supprimer le rôle.",
      );
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            <Shield className="text-orange-600" />
            Gestion des rôles
          </h1>

          <p className="mt-2 text-slate-600">
            Gérez les rôles et leurs permissions.
          </p>
        </div>

        <Link
          to="/roles/ajouter"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          <Plus size={19} />
          Ajouter un rôle
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Search
          size={19}
          className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Rechercher un rôle..."
          className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      <p className="text-sm text-slate-500">
        {filteredRoles.length} rôle(s)
      </p>

      {loading ? (
        <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">
          Chargement des rôles...
        </div>
      ) : (
        <RoleTable
          roles={filteredRoles}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}

export default RolesPage;