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

import {
  Link,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PermissionGuard from "../../components/common/PermissionGuard";
import Toast from "../../components/common/Toast";
import RoleTable from "../../components/roles/RoleTable";

import {
  PERMISSIONS,
} from "../../constants/permissions";

import {
  ROUTES,
} from "../../constants/routes";

import {
  roleService,
} from "../../services/roleService";

import {
  getRoleLabel,
} from "../../utils/roleLabels";

import type {
  Role,
} from "../../types/role";

function RolesPage() {
  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith(
      "ar",
    );

  const [
    roles,
    setRoles,
  ] = useState<Role[]>([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    roleToDelete,
    setRoleToDelete,
  ] =
    useState<Role | null>(
      null,
    );

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    toast,
    setToast,
  ] = useState<{
    open: boolean;
    message: string;
    type:
      | "success"
      | "error"
      | "info";
  }>({
    open: false,
    message: "",
    type: "success",
  });

  const loadRoles = async () => {
    try {
      setLoading(true);

      const data =
        await roleService.getAll();

      setRoles(data);
    } catch {
      setToast({
        open: true,
        message: t(
          "roles.loadError",
        ),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRoles();
  }, []);

  const filteredRoles =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      if (
        !normalizedSearch
      ) {
        return roles;
      }

      return roles.filter(
        (role) => {
          const translatedName =
            getRoleLabel(
              role.name,
              t,
            ).toLowerCase();

          return (
            role.name
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            translatedName.includes(
              normalizedSearch,
            )
          );
        },
      );
    }, [
      roles,
      search,
      t,
    ]);

  const handleDelete =
    async () => {
      if (!roleToDelete) {
        return;
      }

      try {
        setDeleting(true);

        await roleService.remove(
          roleToDelete.id,
        );

        setRoleToDelete(
          null,
        );

        setToast({
          open: true,
          message: t(
            "roles.deleteSuccess",
          ),
          type: "success",
        });

        await loadRoles();
      } catch (
        caughtError
      ) {
        const code =
          caughtError instanceof Error
            ? caughtError.message
            : "";

        setToast({
          open: true,
          message:
            code ===
            "ADMIN_ROLE_PROTECTED"
              ? isArabic
                ? "لا يمكن حذف دور مدير النظام."
                : "Le rôle ADMIN ne peut pas être supprimé."
              : t(
                  "roles.deleteError",
                ),
          type: "error",
        });
      } finally {
        setDeleting(false);
      }
    };

  return (
    <section className="space-y-6">
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() =>
          setToast(
            (previous) => ({
              ...previous,
              open: false,
            }),
          )
        }
      />

      <ConfirmDialog
        open={
          roleToDelete !==
          null
        }
        title={t(
          "roles.deleteTitle",
        )}
        message={
          roleToDelete
            ? t(
                "roles.deleteMessage",
                {
                  name:
                    getRoleLabel(
                      roleToDelete.name,
                      t,
                    ),
                },
              )
            : ""
        }
        confirmLabel={t(
          "roles.delete",
        )}
        loading={deleting}
        onConfirm={() => {
          void handleDelete();
        }}
        onCancel={() =>
          setRoleToDelete(
            null,
          )
        }
      />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            <Shield className="text-orange-600 dark:text-orange-400" />

            {t(
              "roles.title",
            )}
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {t(
              "roles.description",
            )}
          </p>
        </div>

        <PermissionGuard
          permission={
            PERMISSIONS.CREATE_ROLE
          }
        >
          <Link
            to={ROUTES.ADD_ROLE}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            <Plus
              size={19}
            />

            {t(
              "roles.add",
            )}
          </Link>
        </PermissionGuard>
      </div>

      <div className="relative">
        <Search
          size={20}
          className="pointer-events-none absolute inset-s-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          placeholder={
            isArabic
              ? "البحث عن دور"
              : "Rechercher un rôle"
          }
          className="h-12 w-full rounded-2xl border border-slate-300 bg-white ps-11 pe-4 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t(
          "roles.count",
          {
            count:
              filteredRoles.length,
          },
        )}
      </p>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          {t(
            "roles.loading",
          )}
        </div>
      ) : (
        <RoleTable
          roles={filteredRoles}
          onDelete={
            setRoleToDelete
          }
        />
      )}
    </section>
  );
}

export default RolesPage;
