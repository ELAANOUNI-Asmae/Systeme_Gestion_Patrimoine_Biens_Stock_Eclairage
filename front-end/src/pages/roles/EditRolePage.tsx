import {
  ArrowLeft,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import RoleForm from "../../components/roles/RoleForm";

import {
  ROUTES,
} from "../../constants/routes";

import {
  roleService,
} from "../../services/roleService";

import type {
  Permission,
  Role,
  RoleFormData,
} from "../../types/role";

function EditRolePage() {
  const {
    id,
  } =
    useParams();

  const navigate =
    useNavigate();

  const {
    t,
  } =
    useTranslation();

  const [
    role,
    setRole,
  ] =
    useState<Role | null>(
      null,
    );

  const [
    permissions,
    setPermissions,
  ] =
    useState<Permission[]>(
      [],
    );

  const [
    loadingPage,
    setLoadingPage,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(() => {
    const loadData =
      async () => {
        try {
          const [
            roleData,
            permissionData,
          ] =
            await Promise.all([
              roleService.getById(
                Number(id),
              ),

              roleService
                .getPermissions(),
            ]);

          setRole(
            roleData,
          );

          setPermissions(
            permissionData,
          );
        } catch {
          setError(
            t(
              "roles.pages.notFound",
            ),
          );
        } finally {
          setLoadingPage(
            false,
          );
        }
      };

    void loadData();
  }, [
    id,
    t,
  ]);

  const handleSubmit =
    async (
      data: RoleFormData,
    ) => {
      try {
        setSaving(
          true,
        );

        setError("");

        await roleService.update(
          Number(id),
          data,
        );

        navigate(
          ROUTES.ROLES,
        );
      } catch {
        setError(
          t(
            "roles.pages.genericError",
          ),
        );
      } finally {
        setSaving(
          false,
        );
      }
    };

  if (loadingPage) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        {t(
          "roles.pages.loading",
        )}
      </div>
    );
  }

  if (!role) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
        {error ||
          t(
            "roles.pages.notFound",
          )}
      </div>
    );
  }

  const initialValues:
    RoleFormData = {
    name:
      role.name,

    permissionIds:
      role.permissions.map(
        (
          permission,
        ) =>
          permission.id,
      ),
  };

  return (
    <section className="mx-auto flex h-[calc(100dvh-7.5rem)] min-h-0 max-w-5xl flex-col gap-4 overflow-hidden">
      <div className="shrink-0">
        <Link
          to={
            ROUTES.ROLES
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
        >
          <ArrowLeft
            size={18}
            className="rtl:rotate-180"
          />

          {t(
            "roles.pages.back",
          )}
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          {t(
            "roles.pages.editTitle",
          )}
        </h1>
      </div>

      {error && (
        <div className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <RoleForm
        permissions={
          permissions
        }
        initialValues={
          initialValues
        }
        submitLabel={t(
          "roles.pages.save",
        )}
        loading={
          saving
        }
        onSubmit={
          handleSubmit
        }
      />
    </section>
  );
}

export default EditRolePage;