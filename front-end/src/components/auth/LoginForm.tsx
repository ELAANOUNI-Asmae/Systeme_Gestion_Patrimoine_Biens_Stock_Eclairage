import {
  useState,
  type FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import Button from "../common/Button";
import Input from "../common/Input";

import {
  useAuth,
} from "../../hooks/useAuth";

import {
  ROUTES,
} from "../../constants/routes";

type FormErrors = {
  email?: string;
  password?: string;
  general?: string;
};

function LoginForm() {
  const navigate =
    useNavigate();

  const {
    login,
  } = useAuth();

  const {
    t,
  } = useTranslation();

  const [email, setEmail] =
    useState(
      () =>
        localStorage.getItem(
          "rememberedEmail",
        ) ?? "",
    );

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    rememberMe,
    setRememberMe,
  ] = useState(
    () =>
      Boolean(
        localStorage.getItem(
          "rememberedEmail",
        ),
      ),
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    errors,
    setErrors,
  ] = useState<FormErrors>(
    {},
  );

  const validateForm =
    (): boolean => {
      const newErrors: FormErrors =
        {};

      if (!email.trim()) {
        newErrors.email =
          t(
            "auth.emailRequired",
          );
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email.trim(),
        )
      ) {
        newErrors.email =
          t(
            "auth.emailInvalid",
          );
      }

      if (!password.trim()) {
        newErrors.password =
          t(
            "auth.passwordRequired",
          );
      } else if (
        password.length < 8
      ) {
        newErrors.password =
          t(
            "auth.passwordMin",
          );
      }

      setErrors(newErrors);

      return (
        Object.keys(newErrors)
          .length === 0
      );
    };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      loading ||
      !validateForm()
    ) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const loginSucceeded =
        await login({
          email:
            email.trim(),
          password,
        });

      if (!loginSucceeded) {
        setErrors({
          general: t(
            "auth.invalidCredentials",
          ),
        });

        return;
      }

      if (rememberMe) {
        localStorage.setItem(
          "rememberedEmail",
          email.trim(),
        );
      } else {
        localStorage.removeItem(
          "rememberedEmail",
        );
      }

      navigate(
        ROUTES.DASHBOARD,
        {
          replace: true,
        },
      );
    } catch {
      setErrors({
        general: t(
          "auth.loginError",
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-5"
      noValidate
    >
      {errors.general && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
        >
          {errors.general}
        </div>
      )}

      <Input
        id="email"
        label={t(
          "auth.email",
        )}
        type="email"
        placeholder={t(
          "auth.emailPlaceholder",
        )}
        value={email}
        onChange={(event) => {
          setEmail(
            event.target.value,
          );

          if (
            errors.email ||
            errors.general
          ) {
            setErrors(
              (
                previousErrors,
              ) => ({
                ...previousErrors,
                email: undefined,
                general:
                  undefined,
              }),
            );
          }
        }}
        error={errors.email}
        autoComplete="email"
        disabled={loading}
      />

      <Input
        id="password"
        label={t(
          "auth.password",
        )}
        type="password"
        placeholder={t(
          "auth.passwordPlaceholder",
        )}
        value={password}
        onChange={(event) => {
          setPassword(
            event.target.value,
          );

          if (
            errors.password ||
            errors.general
          ) {
            setErrors(
              (
                previousErrors,
              ) => ({
                ...previousErrors,
                password:
                  undefined,
                general:
                  undefined,
              }),
            );
          }
        }}
        error={
          errors.password
        }
        autoComplete="current-password"
        disabled={loading}
      />

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={
              rememberMe
            }
            onChange={(
              event,
            ) =>
              setRememberMe(
                event.target
                  .checked,
              )
            }
            disabled={
              loading
            }
            className="h-4 w-4 rounded border-slate-300 accent-orange-500"
          />

          {t(
            "auth.rememberMe",
          )}
        </label>

        <button
          type="button"
          onClick={() =>
            navigate(
              ROUTES.FORGOT_PASSWORD,
            )
          }
          disabled={
            loading
          }
          className="font-semibold text-orange-600 transition hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-orange-400 dark:hover:text-orange-300"
        >
          {t(
            "auth.forgotPassword",
          )}
        </button>
      </div>

      <Button
        type="submit"
        loading={loading}
        disabled={loading}
      >
        {loading
          ? t(
              "auth.loginLoading",
            )
          : t(
              "auth.login",
            )}
      </Button>

      <div className="rounded-xl border border-orange-100 bg-orange-50 p-3 text-xs text-slate-600 dark:border-orange-900/40 dark:bg-orange-950/20 dark:text-slate-300">
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          {t("auth.secureAccess")}
        </p>

        <p className="mt-2">
          {t("auth.credentialsNotice")}
        </p>
      </div>
    </form>
  );
}

export default LoginForm;