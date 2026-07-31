import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import UserForm from "../../components/users/UserForm";
import { userService } from "../../services/userService";
import type { UserFormData } from "../../types/user";

function AddUserPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: UserFormData) => {
    if (!data.pwd) {
      setError("Le mot de passe est obligatoire.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await userService.create(data);
      navigate("/utilisateurs");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Une erreur est survenue.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          to="/utilisateurs"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-orange-600"
        >
          <ArrowLeft size={18} />
          Retour aux utilisateurs
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
          Ajouter un utilisateur
        </h1>

        <p className="mt-2 text-slate-600">
          Remplissez les informations du nouveau compte.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <UserForm
        submitLabel="Créer l'utilisateur"
        loading={loading}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

export default AddUserPage;