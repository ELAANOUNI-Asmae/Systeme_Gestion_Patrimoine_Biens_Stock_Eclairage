import { useState } from "react";
import { Link } from "react-router-dom";

import Logo from "../common/Logo";
import Input from "../common/Input";
import Button from "../common/Button";

import { forgotPassword } from "../../services/authService";

type ForgotPasswordFormProps = {
  onSuccess: () => void;
};

function ForgotPasswordForm({
  onSuccess,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Veuillez saisir votre adresse e-mail.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      setError("Adresse e-mail invalide.");
      return;
    }

    try {
      setLoading(true);

      await forgotPassword(cleanEmail);

      onSuccess();
    } catch (err) {
      console.error(err);

      setError(
        "Impossible d'envoyer le lien. Veuillez réessayer."
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
          Mot de passe oublié
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Entrez votre adresse e-mail pour recevoir un lien de
          réinitialisation.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
      >
        <Input
          label="Adresse e-mail"
          type="email"
          name="email"
          placeholder="exemple@email.com"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          disabled={loading}
        />

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Envoi en cours..."
            : "Envoyer le lien"}
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

export default ForgotPasswordForm;