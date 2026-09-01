import {
  useState,
  type FormEvent,
} from "react";

import {
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import Logo from "../common/Logo";
import Button from "../common/Button";

import {
  resetPassword,
} from "../../services/authService";

import {
  ROUTES,
} from "../../constants/routes";

type ResetPasswordFormProps = {
  token: string | null;
  onSuccess: () => void;
};

function ResetPasswordForm({
  token,
  onSuccess,
}: ResetPasswordFormProps) {
  const {
    t,
  } = useTranslation();

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (!token) {
      setError(
        t(
          "auth.reset.invalidToken",
        ),
      );

      return;
    }

    if (!password) {
      setError(
        t(
          "auth.reset.passwordRequired",
        ),
      );

      return;
    }

    if (
      password.length < 8
    ) {
      setError(
        t(
          "auth.reset.passwordMin",
        ),
      );

      return;
    }

    if (!confirmPassword) {
      setError(
        t(
          "auth.reset.confirmRequired",
        ),
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        t(
          "auth.reset.mismatch",
        ),
      );

      return;
    }

    try {
      setLoading(true);

      await resetPassword(
        token,
        password,
        confirmPassword,
      );

      onSuccess();
    } catch {
      setError(
        t(
          "auth.reset.error",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordVisibilityLabel =
    showPassword
      ? t(
          "auth.reset.hidePassword",
        )
      : t(
          "auth.reset.showPassword",
        );

  const confirmationVisibilityLabel =
    showConfirmPassword
      ? t(
          "auth.reset.hideConfirmation",
        )
      : t(
          "auth.reset.showConfirmation",
        );

  return (
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg transition-colors dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>

      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {t(
            "auth.reset.title",
          )}
        </h1>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t(
            "auth.reset.description",
          )}
        </p>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-5"
        noValidate
      >
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            {t(
              "auth.reset.newPassword",
            )}
          </label>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(
                event,
              ) => {
                setPassword(
                  event.target.value,
                );

                setError("");
              }}
              placeholder={t(
                "auth.reset.newPasswordPlaceholder",
              )}
              disabled={
                loading
              }
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pe-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/10 dark:disabled:bg-slate-800"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (current) =>
                    !current,
                )
              }
              disabled={
                loading
              }
              title={
                passwordVisibilityLabel
              }
              aria-label={
                passwordVisibilityLabel
              }
              className="absolute inset-y-0 inset-e-0 flex items-center px-4 text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed dark:text-slate-400 dark:hover:text-slate-200"
            >
              {showPassword ? (
                <EyeOff
                  size={19}
                />
              ) : (
                <Eye
                  size={19}
                />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            {t(
              "auth.reset.confirmPassword",
            )}
          </label>

          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={
                confirmPassword
              }
              onChange={(
                event,
              ) => {
                setConfirmPassword(
                  event.target.value,
                );

                setError("");
              }}
              placeholder={t(
                "auth.reset.confirmPasswordPlaceholder",
              )}
              disabled={
                loading
              }
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pe-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/10 dark:disabled:bg-slate-800"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  (current) =>
                    !current,
                )
              }
              disabled={
                loading
              }
              title={
                confirmationVisibilityLabel
              }
              aria-label={
                confirmationVisibilityLabel
              }
              className="absolute inset-y-0 inset-e-0 flex items-center px-4 text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed dark:text-slate-400 dark:hover:text-slate-200"
            >
              {showConfirmPassword ? (
                <EyeOff
                  size={19}
                />
              ) : (
                <Eye
                  size={19}
                />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={
            loading
          }
        >
          {loading
            ? t(
                "auth.reset.loading",
              )
            : t(
                "auth.reset.submit",
              )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to={
            ROUTES.LOGIN
          }
          className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 transition hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
        >
          <ArrowLeft
            size={17}
            className="rtl:rotate-180"
          />

          {t(
            "auth.forgot.backToLogin",
          )}
        </Link>
      </div>
    </section>
  );
}

export default ResetPasswordForm;
