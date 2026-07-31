import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import UserForm from "../../components/users/UserForm";
import { userService } from "../../services/userService";
import type {
  User,
  UserFormData,
} from "../../types/user";

function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await userService.getById(Number(id));
        setUser(data);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Utilisateur introuvable.",
        );
      } finally {
        setLoadingPage(false);
      }
    };

    void loadUser();
  }, [id]);

  const handleSubmit = async (data: UserFormData) => {
    try {
      setSaving(true);
      setError("");

      await userService.update(Number(id), data);
      navigate("/utilisateurs");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Une erreur est survenue.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">
        Chargement de l'utilisateur...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error || "Utilisateur introuvable."}
      </div>
    );
  }

  const initialValues: UserFormData = {
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    gender: user.gender,
    phone: user.phone,
    cin: user.cin,
    pwd: "",
    roleId: user.role.id,
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
          Modifier l'utilisateur
        </h1>

        <p className="mt-2 text-slate-600">
          Modifiez les informations du compte sélectionné.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <UserForm
        initialValues={initialValues}
        submitLabel="Enregistrer les modifications"
        loading={saving}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

export default EditUserPage;