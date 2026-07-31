import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import { Link } from "react-router-dom";

import type { Role } from "../../types/role";

type RoleTableProps = {
  roles: Role[];
  onDelete: (role: Role) => void;
};

function RoleTable({
  roles,
  onDelete,
}: RoleTableProps) {
  if (roles.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="font-semibold text-slate-700">
          Aucun rôle trouvé
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
                Rôle
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Permissions
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {roles.map((role) => (
              <tr
                key={role.id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                    {role.name}
                  </span>
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {role.permissions.length} permission(s)
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <Link
                      to={`/roles/${role.id}`}
                      title="Voir"
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye size={18} />
                    </Link>

                    <Link
                      to={`/roles/${role.id}/modifier`}
                      title="Modifier"
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Pencil size={18} />
                    </Link>

                    <button
                      type="button"
                      title="Supprimer"
                      onClick={() => onDelete(role)}
                      disabled={role.name === "ADMIN"}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
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

export default RoleTable;