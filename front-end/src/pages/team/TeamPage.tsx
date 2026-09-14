import { ArrowLeft, Code2 } from "lucide-react";
import { Link } from "react-router-dom";

function TeamPage() {
  const members = [
    {
      name: "Fatima Azzahrae Sarghini",
      role: "Développement & intégration SGPBSE",
      github: "https://github.com/fati-smart",
      linkedin:
        "https://www.linkedin.com/in/fatima-azzahrae-sarghini-74a38b350/",
    },
    {
      name: "Asmae Elaanouni",
      role: "Développement & intégration SGPBSE",
      github: "https://github.com/ELAANOUNI-Asmae",
      linkedin:
        "https://www.linkedin.com/in/asmae-elaanouni-831751243/",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-orange-500 dark:text-slate-300"
        >
          <ArrowLeft size={18} />
          Retour
        </Link>

        <div className="mb-10 text-center">
          <Code2
            className="mx-auto mb-4 text-orange-500"
            size={42}
          />

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Équipe du projet SGPBSE
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
            Conception et développement de la plateforme de gestion du
            patrimoine, du stock et de l’éclairage public.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {members.map((member) => (
            <div
              key={member.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {member.name}
              </h2>

              <p className="mt-2 text-sm font-medium text-orange-500">
                {member.role}
              </p>

              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                Élève ingénieure en Développement Logiciel et Applicatif
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={member.github}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-500 hover:text-orange-500 dark:border-slate-700 dark:text-slate-300"
                >
                  GitHub
                </a>

                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeamPage;
