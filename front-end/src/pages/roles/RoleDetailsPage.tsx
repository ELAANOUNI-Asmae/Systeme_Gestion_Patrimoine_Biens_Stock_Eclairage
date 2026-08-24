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

import { useTranslation } from "react-i18next";

import PermissionGuard from "../../components/common/PermissionGuard";

import { PERMISSIONS } from "../../constants/permissions";
import { ROUTES } from "../../constants/routes";

import { roleService } from "../../services/roleService";

import {
  getPermissionLabel,
  getRoleLabel,
} from "../../utils/roleLabels";

import type { Role } from "../../types/role";

function RoleDetailsPage() {
  const { id } = useParams();

  const { t } =
    useTranslation();

  const [role, setRole] =
    useState<Role | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadRole = async () => {
      try {
        const data =
          await roleService.getById(
            Number(id),
          );

        setRole(data);
      } catch {
        setError(
          t("roles.pages.notFound"),
        );
      } finally {
        setLoading(false);
      }
    };

    void loadRole();
  }, [id, t]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        {t("roles.pages.loading")}
      </div>
    );
  }

  if (!role) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  const roleLabel =
    getRoleLabel(
      role.name,
      t,
    );

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link
          to={ROUTES.ROLES}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
        >
          <ArrowLeft
            size={18}
            className="rtl:rotate-180"
          />

          {t("roles.pages.back")}
        </Link>

        <PermissionGuard
          permission={
            PERMISSIONS.UPDATE_ROLE
          }
        >
          <Link
            to={`/roles/${role.id}/modifier`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            <Pencil size={18} />

            {t("roles.edit")}
          </Link>
        </PermissionGuard>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6 dark:border-slate-700">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
            <Shield size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {roleLabel}
            </h1>

            <p className="mt-1 text-xs font-medium text-slate-400">
              {role.name}
            </p>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {t(
                "roles.pages.permissionsCount",
                {
                  count:
                    role.permissions.length,
                },
              )}
            </p>
          </div>
        </div>

        <h2 className="mt-6 font-semibold text-slate-900 dark:text-white">
          {t(
            "roles.pages.associatedPermissions",
          )}
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {role.permissions.map(
            (permission) => (
              <div
                key={permission.id}
                className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-900"
              >
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {getPermissionLabel(
                      permission.permission,
                      t,
                    )}
                  </p>

                  <p className="mt-1 text-xs font-mono text-slate-500 dark:text-slate-400">
                    {
                      permission.permission
                    }
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      </article>
    </section>
  );
}

export default RoleDetailsPage;