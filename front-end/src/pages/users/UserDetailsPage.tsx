import {
  ArrowLeft,
  Pencil,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import PermissionGuard from "../../components/common/PermissionGuard";
import UserCard from "../../components/users/UserCard";

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
} from "../../types/user";

function UserDetailsPage() {
  const {
    id,
  } =
    useParams();

  const {
    t,
  } =
    useTranslation();

  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(() => {
    const loadUser =
      async () => {
        try {
          const data =
            await userService.getById(
              Number(
                id,
              ),
            );

          setUser(
            data,
          );
        } catch {
          setError(
            t(
              "users.pages.notFound",
            ),
          );
        } finally {
          setLoading(
            false,
          );
        }
      };

    void loadUser();
  }, [
    id,
    t,
  ]);

  if (
    loading
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        {t(
          "users.pages.detailsLoading",
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link
          to={
            ROUTES.USERS
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
        >
          <ArrowLeft
            size={18}
            className="rtl:rotate-180"
          />

          {t(
            "users.pages.back",
          )}
        </Link>

        <PermissionGuard
          permission={
            PERMISSIONS.UPDATE_USER
          }
        >
          <Link
            to={`/utilisateurs/${user.id}/modifier`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            <Pencil
              size={18}
            />

            {t(
              "users.modify",
            )}
          </Link>
        </PermissionGuard>
      </div>

      <UserCard
        user={
          user
        }
      />
    </section>
  );
}

export default UserDetailsPage;
