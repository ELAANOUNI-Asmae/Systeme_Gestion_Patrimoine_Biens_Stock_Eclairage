import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

function ResetSuccessCard() {
  return (
    <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <div className="flex flex-col items-center text-center">
        <CheckCircle
          size={70}
          className="mb-5 text-green-500"
        />

        <h1 className="mb-3 text-2xl font-bold text-slate-800">
          Mot de passe réinitialisé
        </h1>

        <p className="mb-8 text-slate-600">
          Votre mot de passe a été modifié avec succès. Vous
          pouvez maintenant vous connecter avec votre nouveau
          mot de passe.
        </p>

        <Link
          to="/login"
          className="w-full rounded-lg bg-orange-500 px-4 py-3 text-center font-semibold text-white transition hover:bg-orange-600"
        >
          Se connecter
        </Link>
      </div>
    </section>
  );
}

export default ResetSuccessCard;