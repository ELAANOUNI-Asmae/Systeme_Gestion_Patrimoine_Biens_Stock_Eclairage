import {
  ArrowLeft,
  CheckCircle2,
  Pencil,
  Shield,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { roleService } from "../../services/roleService";
import type { Role } from "../../types/role";

function RoleDetailsPage() {
  const { id } = useParams();

  const [role, setRole] =
    useState<Role | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRole = async () => {
      try {
        const data =
          await roleService.getById(Number(id));

        setRole(data);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Rôle introuvable.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadRole();
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">
        Chargement du rôle...
      </div>
    );
  }

  if (!role) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link
          to="/roles"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-orange-600"
        >
          <ArrowLeft size={18} />
          Retour aux rôles
        </Link>

        <Link
          to={`/roles/${role.id}/modifier`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          <Pencil size={18} />
          Modifier
        </Link>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
            <Shield size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {role.name}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {role.permissions.length} permission(s)
            </p>
          </div>
        </div>

        <h2 className="mt-6 font-semibold text-slate-900">
          Permissions associées
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {role.permissions.map((permission) => (
            <div
              key={permission.id}
              className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"
            >
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0 text-green-600"
              />

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {permission.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {permission.permission}
                </p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

export default RoleDetailsPage;