import {
  useState,
  type FormEvent,
} from "react";

import {
  ArrowLeft,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import Logo from "../common/Logo";
import Input from "../common/Input";
import Button from "../common/Button";

import {
  forgotPassword,
} from "../../services/authService";

import {
  ROUTES,
} from "../../constants/routes";

type ForgotPasswordFormProps = {
  onSuccess: () => void;
};

function ForgotPasswordForm({
  onSuccess,
}: ForgotPasswordFormProps) {
  const {
    t,
  } = useTranslation();

  const [
    email,
    setEmail,
  ] = useState("");

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

    const cleanEmail =
      email.trim();

    if (!cleanEmail) {
      setError(
        t(
          "auth.forgot.emailRequired",
        ),
      );

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail,
      )
    ) {
      setError(
        t(
          "auth.forgot.emailInvalid",
        ),
      );

      return;
    }

    try {
      setLoading(true);

      await forgotPassword(
        cleanEmail,
      );

      onSuccess();
    } catch {
      setError(
        t(
          "auth.forgot.sendError",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg transition-colors dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>

      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {t(
            "auth.forgot.title",
          )}
        </h1>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t(
            "auth.forgot.description",
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
        <Input
          id="forgot-email"
          label={t(
            "auth.email",
          )}
          type="email"
          name="email"
          placeholder={t(
            "auth.emailPlaceholder",
          )}
          value={email}
          onChange={(
            event,
          ) => {
            setEmail(
              event.target.value,
            );

            setError("");
          }}
          disabled={
            loading
          }
          autoComplete="email"
        />

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
                "auth.forgot.sending",
              )
            : t(
                "auth.forgot.send",
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

export default ForgotPasswordForm;
