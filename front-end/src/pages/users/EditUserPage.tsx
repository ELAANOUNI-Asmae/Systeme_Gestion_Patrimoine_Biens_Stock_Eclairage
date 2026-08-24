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

import UserForm from "../../components/users/UserForm";

import {
  ROUTES,
} from "../../constants/routes";

import {
  userService,
} from "../../services/userService";

import type {
  User,
  UserFormData,
} from "../../types/user";

function EditUserPage() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const { t } =
    useTranslation();

  const [user, setUser] =
    useState<User | null>(
      null,
    );

  const [
    loadingPage,
    setLoadingPage,
  ] = useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadUser =
      async () => {
        try {
          const data =
            await userService.getById(
              Number(id),
            );

          setUser(data);
        } catch {
          setError(
            t(
              "users.pages.notFound",
            ),
          );
        } finally {
          setLoadingPage(
            false,
          );
        }
      };

    void loadUser();
  }, [id, t]);

  const handleSubmit = async (
    data: UserFormData,
  ) => {
    try {
      setSaving(true);
      setError("");

      const updatedUser =
        await userService.update(
          Number(id),
          data,
        );

      window.dispatchEvent(
        new CustomEvent(
          "user-updated",
          {
            detail: {
              userId:
                updatedUser.id,
            },
          },
        ),
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
      setSaving(false);
    }
  };

  if (loadingPage) {
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
        {error ||
          t(
            "users.pages.notFound",
          )}
      </div>
    );
  }

  const initialValues: UserFormData = {
    firstname:
      user.firstname,

    lastname:
      user.lastname,

    firstnameAr:
      user.firstnameAr,

    lastnameAr:
      user.lastnameAr,

    email:
      user.email,

    gender:
      user.gender,

    phone:
      user.phone,

    cin:
      user.cin,

    pwd: "",

    roleId:
      user.role.id,
  };

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          to={ROUTES.USERS}
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
            "users.pages.editTitle",
          )}
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {t(
            "users.pages.editDescription",
          )}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <UserForm
        initialValues={
          initialValues
        }
        submitLabel={t(
          "users.pages.save",
        )}
        loading={saving}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

export default EditUserPage;