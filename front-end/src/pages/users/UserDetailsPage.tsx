import { ArrowLeft, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import UserCard from "../../components/users/UserCard";
import { userService } from "../../services/userService";
import type { User } from "../../types/user";

function UserDetailsPage() {
  const { id } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
      }
    };

    void loadUser();
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">
        Chargement de l'utilisateur...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link
          to="/utilisateurs"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-orange-600"
        >
          <ArrowLeft size={18} />
          Retour aux utilisateurs
        </Link>

        <Link
          to={`/utilisateurs/${user.id}/modifier`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          <Pencil size={18} />
          Modifier
        </Link>
      </div>

      <UserCard user={user} />
    </section>
  );
}

export default UserDetailsPage;