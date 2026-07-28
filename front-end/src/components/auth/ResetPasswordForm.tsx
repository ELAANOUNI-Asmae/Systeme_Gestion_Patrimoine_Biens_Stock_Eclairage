import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import Logo from "../common/Logo";
import Button from "../common/Button";
import { resetPassword } from "../../services/authService";

type ResetPasswordFormProps = {
  token: string | null;
  onSuccess: () => void;
};

function ResetPasswordForm({
  token,
  onSuccess,
}: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError(
        "Le lien de réinitialisation est invalide ou incomplet."
      );
      return;
    }

    if (!password) {
      setError("Veuillez saisir un nouveau mot de passe.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (!confirmPassword) {
      setError("Veuillez confirmer le mot de passe.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(
        token,
        password,
        confirmPassword
      );

      onSuccess();
    } catch (err) {
      console.error(err);

      setError(
        "Impossible de réinitialiser le mot de passe. Le lien est peut-être invalide ou expiré."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>

      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-800">
          Réinitialiser le mot de passe
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Saisissez et confirmez votre nouveau mot de passe.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
      >
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Nouveau mot de passe
          </label>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Au moins 8 caractères"
              disabled={loading}
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((currentValue) => !currentValue)
              }
              className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 hover:text-slate-700"
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Confirmer le mot de passe
          </label>

          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={
                showConfirmPassword ? "text" : "password"
              }
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Répétez le mot de passe"
              disabled={loading}
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  (currentValue) => !currentValue
                )
              }
              className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 hover:text-slate-700"
              aria-label={
                showConfirmPassword
                  ? "Masquer la confirmation"
                  : "Afficher la confirmation"
              }
            >
              {showConfirmPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading}>
          {loading
            ? "Réinitialisation..."
            : "Réinitialiser le mot de passe"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="text-sm font-semibold text-orange-600 transition hover:text-orange-700"
        >
          ← Retour à la connexion
        </Link>
      </div>
    </section>
  );
}

export default ResetPasswordForm;