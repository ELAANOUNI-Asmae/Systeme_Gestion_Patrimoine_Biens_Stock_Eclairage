import { Eye, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import type { User } from "../../types/user";

type UserTableProps = {
  users: User[];
  onDelete: (user: User) => void;
};

function UserTable({ users, onDelete }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="font-semibold text-slate-700">
          Aucun utilisateur trouvé
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Modifiez les critères de recherche ou ajoutez un utilisateur.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Utilisateur
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Téléphone
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                CIN
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rôle
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr
                key={user.id}
                className="transition hover:bg-slate-50"
              >
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
                      {user.firstname.charAt(0)}
                      {user.lastname.charAt(0)}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {user.firstname} {user.lastname}
                      </p>

                      <p className="text-sm text-slate-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {user.phone}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {user.cin}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                    {user.role.name}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <Link
                      to={`/utilisateurs/${user.id}`}
                      title="Voir"
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye size={18} />
                    </Link>

                    <Link
                      to={`/utilisateurs/${user.id}/modifier`}
                      title="Modifier"
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Pencil size={18} />
                    </Link>

                    <button
                      type="button"
                      title="Supprimer"
                      onClick={() => onDelete(user)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserTable;