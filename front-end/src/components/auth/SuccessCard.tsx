import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

function SuccessCard() {
    return (
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

            <div className="flex flex-col items-center text-center">

                <CheckCircle
                    size={70}
                    className="mb-5 text-green-500"
                />

                <h1 className="mb-3 text-2xl font-bold text-slate-800">
                    Email envoyé
                </h1>

                <p className="mb-8 text-slate-600">
                    Si un compte existe avec cette adresse e-mail,
                    un lien de réinitialisation a été envoyé.
                    Veuillez vérifier votre boîte de réception.
                </p>

                <Link
                    to="/login"
                    className="w-full rounded-lg bg-orange-500 px-4 py-3 text-center font-semibold text-white transition hover:bg-orange-600"
                >
                    Retour à la connexion
                </Link>

            </div>

        </div>
    );
}

export default SuccessCard;