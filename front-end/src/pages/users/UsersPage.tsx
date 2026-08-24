import {
  Plus,
  Users,
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

import UserFilters from "../../components/users/UserFilters";
import UserTable from "../../components/users/UserTable";

import {
  PERMISSIONS,
} from "../../constants/permissions";

import {
  ROUTES,
} from "../../constants/routes";

import {
  userService,
} from "../../services/userService";

import type {
  User,
  UserFilters as UserFiltersType,
} from "../../types/user";

function UsersPage() {
  const { t } = useTranslation();

  const [users, setUsers] =
    useState<User[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    userToDelete,
    setUserToDelete,
  ] = useState<User | null>(
    null,
  );

  const [deleting, setDeleting] =
    useState(false);

  const [toast, setToast] =
    useState<{
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

  const [filters, setFilters] =
    useState<UserFiltersType>({
      search: "",
      role: "",
    });

  const loadUsers = async () => {
    try {
      setLoading(true);

      const data =
        await userService.getAll();

      setUsers(data);
    } catch {
      setToast({
        open: true,
        message: t(
          "users.loadError",
        ),
        type: "error",
      });
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
        new Set(
          users.map(
            (user) =>
              user.role.name,
          ),
        ),
      ),
    [users],
  );

  const filteredUsers =
    useMemo(() => {
      const search =
        filters.search
          .trim()
          .toLowerCase();

      return users.filter(
        (user) => {
          const matchesSearch =
            !search ||
            `${user.firstname} ${user.lastname}`
              .toLowerCase()
              .includes(search) ||
            `${user.firstnameAr} ${user.lastnameAr}`
              .toLowerCase()
              .includes(search) ||
            user.email
              .toLowerCase()
              .includes(search) ||
            user.cin
              .toLowerCase()
              .includes(search);

          const matchesRole =
            !filters.role ||
            user.role.name ===
              filters.role;

          return (
            matchesSearch &&
            matchesRole
          );
        },
      );
    }, [filters, users]);

  const requestDelete = (
    user: User,
  ) => {
    setUserToDelete(user);
  };

  const handleDelete =
    async () => {
      if (!userToDelete) {
        return;
      }

      try {
        setDeleting(true);

        await userService.remove(
          userToDelete.id,
        );

        const deletedName =
          `${userToDelete.firstname} ${userToDelete.lastname}`;

        setUserToDelete(null);

        setToast({
          open: true,
          message: t(
            "users.deleteSuccess",
            {
              name: deletedName,
            },
          ),
          type: "success",
        });

        await loadUsers();
      } catch {
        setToast({
          open: true,
          message: t(
            "users.deleteError",
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
          userToDelete !== null
        }
        title={t(
          "users.deleteTitle",
        )}
        message={
          userToDelete
            ? t(
                "users.deleteMessage",
                {
                  name: `${userToDelete.firstname} ${userToDelete.lastname}`,
                },
              )
            : ""
        }
        confirmLabel={t(
          "users.delete",
        )}
        loading={deleting}
        onConfirm={() => {
          void handleDelete();
        }}
        onCancel={() =>
          setUserToDelete(null)
        }
      />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            <Users className="text-orange-600 dark:text-orange-400" />

            {t("users.title")}
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {t(
              "users.description",
            )}
          </p>
        </div>

        <PermissionGuard
          permission={
            PERMISSIONS.CREATE_USER
          }
        >
          <Link
            to={ROUTES.ADD_USER}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            <Plus size={19} />

            {t("users.add")}
          </Link>
        </PermissionGuard>
      </div>

      <UserFilters
        filters={filters}
        roles={roles}
        onChange={setFilters}
      />

      <div className="text-sm text-slate-500 dark:text-slate-400">
        {t("users.count", {
          count:
            filteredUsers.length,
        })}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          {t("users.loading")}
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          onDelete={
            requestDelete
          }
        />
      )}
    </section>
  );
}

export default UsersPage;