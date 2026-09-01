import {
  ArrowLeft,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import UserForm from "../../components/users/UserForm";

import {
  ROUTES,
} from "../../constants/routes";

import {
  userService,
} from "../../services/userService";

import type {
  UserFormData,
} from "../../types/user";

function AddUserPage() {
  const navigate =
    useNavigate();

  const {
    t,
  } =
    useTranslation();

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const handleSubmit =
    async (
      data: UserFormData,
    ) => {
      if (
        !data.pwd
      ) {
        setError(
          t(
            "users.pages.passwordRequired",
          ),
        );

        return;
      }

      try {
        setLoading(
          true,
        );

        setError("");

        await userService.create(
          data,
        );

        navigate(
          ROUTES.USERS,
        );
      } catch {
        setError(
          t(
            "users.pages.genericError",
          ),
        );
      } finally {
        setLoading(
          false,
        );
      }
    };

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
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

        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          {t(
            "users.pages.addTitle",
          )}
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {t(
            "users.pages.addDescription",
          )}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <UserForm
        submitLabel={t(
          "users.pages.create",
        )}
        loading={
          loading
        }
        showPassword
        onSubmit={
          handleSubmit
        }
      />
    </section>
  );
}

export default AddUserPage;
