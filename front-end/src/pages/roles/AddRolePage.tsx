import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

import RoleForm from "../../components/roles/RoleForm";

import { ROUTES } from "../../constants/routes";
import { roleService } from "../../services/roleService";

import type {
  Permission,
  RoleFormData,
} from "../../types/role";

function AddRolePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [permissions, setPermissions] =
    useState<Permission[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const data =
          await roleService.getPermissions();

        setPermissions(data);
      } catch {
        setError(
          t("roles.pages.genericError"),
        );
      }
    };

    void loadPermissions();
  }, [t]);

  const handleSubmit = async (
    data: RoleFormData,
  ) => {
    try {
      setLoading(true);
      setError("");

      await roleService.create(data);

      navigate(ROUTES.ROLES);
    } catch {
      setError(
        t("roles.pages.genericError"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
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

        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          {t("roles.pages.addTitle")}
        </h1>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <RoleForm
        permissions={permissions}
        submitLabel={t(
          "roles.pages.create",
        )}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

export default AddRolePage;