import { Plus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import UserFilters from "../../components/users/UserFilters";
import UserTable from "../../components/users/UserTable";
import { userService } from "../../services/userService";
import type {
  User,
  UserFilters as UserFiltersType,
} from "../../types/user";

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<UserFiltersType>({
    search: "",
    role: "",
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const roles = useMemo(
    () =>
      Array.from(
        new Set(users.map((user) => user.role.name)),
      ),
    [users],
  );

  const filteredUsers = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !search ||
        `${user.firstname} ${user.lastname}`
          .toLowerCase()
          .includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.cin.toLowerCase().includes(search);

      const matchesRole =
        !filters.role || user.role.name === filters.role;

      return matchesSearch && matchesRole;
    });
  }, [filters, users]);

  const handleDelete = async (user: User) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer ${user.firstname} ${user.lastname} ?`,
    );

    if (!confirmed) {
      return;
    }

    await userService.remove(user.id);
    await loadUsers();
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            <Users className="text-orange-600" />
            Gestion des utilisateurs
          </h1>

          <p className="mt-2 text-slate-600">
            Consultez et gérez les comptes utilisateurs.
          </p>
        </div>

        <Link
          to="/utilisateurs/ajouter"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          <Plus size={19} />
          Ajouter un utilisateur
        </Link>
      </div>

      <UserFilters
        filters={filters}
        roles={roles}
        onChange={setFilters}
      />

      <div className="text-sm text-slate-500">
        {filteredUsers.length} utilisateur(s)
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">
          Chargement des utilisateurs...
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}

export default UsersPage;