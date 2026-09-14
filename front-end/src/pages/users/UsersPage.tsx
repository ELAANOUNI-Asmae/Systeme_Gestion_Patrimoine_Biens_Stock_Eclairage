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

type PendingAction =
  | {
      type: "delete";
      user: User;
    }
  | {
      type: "toggle";
      user: User;
    }
  | null;

function UsersPage() {
  const {
    t,
    i18n,
  } =
    useTranslation();

  const isArabic =
    i18n.language.startsWith(
      "ar",
    );

  const tr = (
    fr: string,
    ar: string,
  ) =>
    isArabic
      ? ar
      : fr;

  const [
    users,
    setUsers,
  ] =
    useState<User[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    pendingAction,
    setPendingAction,
  ] =
    useState<PendingAction>(
      null,
    );

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState(false);

  const [
    toast,
    setToast,
  ] =
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

  const [
    filters,
    setFilters,
  ] =
    useState<UserFiltersType>({
      search: "",
      role: "",
    });

  const loadUsers =
    async () => {
      try {
        setLoading(
          true,
        );

        const data =
          await userService.getAll();

        setUsers(
          data,
        );
      } catch {
        setToast({
          open: true,
          message: t(
            "users.loadError",
          ),
          type: "error",
        });
      } finally {
        setLoading(
          false,
        );
      }
    };

  useEffect(() => {
    void loadUsers();
  }, []);

  const roles =
    useMemo(
      () =>
        Array.from(
          new Set(
            users.map(
              (user) =>
                user.role.name,
            ),
          ),
        ),
      [
        users,
      ],
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
              .includes(
                search,
              ) ||
            `${user.firstnameAr} ${user.lastnameAr}`
              .toLowerCase()
              .includes(
                search,
              ) ||
            user.email
              .toLowerCase()
              .includes(
                search,
              ) ||
            user.cin
              .toLowerCase()
              .includes(
                search,
              );

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
    }, [
      filters,
      users,
    ]);

  const handleConfirmedAction =
    async () => {
      if (
        !pendingAction
      ) {
        return;
      }

      const {
        user,
      } =
        pendingAction;

      try {
        setActionLoading(
          true,
        );

        if (
          pendingAction.type ===
          "delete"
        ) {
          await userService.remove(
            user.id,
          );

          setToast({
            open: true,
            message: t(
              "users.deleteSuccess",
              {
                name:
                  `${user.firstname} ${user.lastname}`,
              },
            ),
            type: "success",
          });
        } else {
          const nextActive =
            !user.active;

          await userService.setActive(
            user.id,
            nextActive,
          );

          setToast({
            open: true,
            message:
              nextActive
                ? tr(
                    "Utilisateur activé avec succès.",
                    "تم تفعيل المستخدم بنجاح.",
                  )
                : tr(
                    "Utilisateur désactivé avec succès.",
                    "تم تعطيل المستخدم بنجاح.",
                  ),
            type: "success",
          });
        }

        setPendingAction(
          null,
        );

        await loadUsers();
      } catch {
        setToast({
          open: true,
          message:
            pendingAction.type ===
            "delete"
              ? t(
                  "users.deleteError",
                )
              : tr(
                  "Impossible de modifier le statut de l’utilisateur.",
                  "تعذر تغيير حالة المستخدم.",
                ),
          type: "error",
        });
      } finally {
        setActionLoading(
          false,
        );
      }
    };

  const dialogTitle =
    pendingAction?.type ===
    "delete"
      ? t(
          "users.deleteTitle",
        )
      : pendingAction?.user.active
        ? tr(
            "Désactiver l’utilisateur",
            "تعطيل المستخدم",
          )
        : tr(
            "Activer l’utilisateur",
            "تفعيل المستخدم",
          );

  const dialogMessage =
    !pendingAction
      ? ""
      : pendingAction.type ===
          "delete"
        ? t(
            "users.deleteMessage",
            {
              name:
                `${pendingAction.user.firstname} ${pendingAction.user.lastname}`,
            },
          )
        : pendingAction.user.active
          ? tr(
              `Désactiver ${pendingAction.user.firstname} ${pendingAction.user.lastname} ? Le compte restera enregistré mais l’accès sera bloqué.`,
              `هل تريد تعطيل ${pendingAction.user.firstnameAr} ${pendingAction.user.lastnameAr}؟ سيبقى الحساب محفوظاً لكن سيتم منع الولوج.`,
            )
          : tr(
              `Activer ${pendingAction.user.firstname} ${pendingAction.user.lastname} ?`,
              `هل تريد تفعيل ${pendingAction.user.firstnameAr} ${pendingAction.user.lastnameAr}؟`,
            );

  return (
    <section className="space-y-6">
      <Toast
        open={
          toast.open
        }
        message={
          toast.message
        }
        type={
          toast.type
        }
        onClose={() =>
          setToast(
            (
              previous,
            ) => ({
              ...previous,
              open: false,
            }),
          )
        }
      />

      <ConfirmDialog
        open={
          pendingAction !==
          null
        }
        title={
          dialogTitle
        }
        message={
          dialogMessage
        }
        confirmLabel={
          pendingAction?.type ===
          "delete"
            ? t(
                "users.delete",
              )
            : pendingAction?.user.active
              ? tr(
                  "Désactiver",
                  "تعطيل",
                )
              : tr(
                  "Activer",
                  "تفعيل",
                )
        }
        loading={
          actionLoading
        }
        onConfirm={() => {
          void handleConfirmedAction();
        }}
        onCancel={() =>
          setPendingAction(
            null,
          )
        }
      />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            <Users className="text-orange-600 dark:text-orange-400" />

            {t(
              "users.title",
            )}
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
            to={
              ROUTES.ADD_USER
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            <Plus
              size={19}
            />

            {t(
              "users.add",
            )}
          </Link>
        </PermissionGuard>
      </div>

      <UserFilters
        filters={
          filters
        }
        roles={
          roles
        }
        onChange={
          setFilters
        }
      />

      <div className="text-sm text-slate-500 dark:text-slate-400">
        {t(
          "users.count",
          {
            count:
              filteredUsers.length,
          },
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          {t(
            "users.loading",
          )}
        </div>
      ) : (
        <UserTable
          users={
            filteredUsers
          }
          onDelete={(
            user,
          ) =>
            setPendingAction({
              type: "delete",
              user,
            })
          }
          onToggleActive={(
            user,
          ) =>
            setPendingAction({
              type: "toggle",
              user,
            })
          }
        />
      )}
    </section>
  );
}

export default UsersPage;
