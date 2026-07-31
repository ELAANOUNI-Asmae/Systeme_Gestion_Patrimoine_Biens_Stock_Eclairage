import {
  Boxes,
  Building2,
  Lightbulb,
  TriangleAlert,
  Users,
} from "lucide-react";

const statistics = [
  {
    id: 1,
    label: "Utilisateurs",
    value: 24,
    icon: Users,
  },
  {
    id: 2,
    label: "Biens enregistrés",
    value: 156,
    icon: Building2,
  },
  {
    id: 3,
    label: "Articles en stock",
    value: 428,
    icon: Boxes,
  },
  {
    id: 4,
    label: "Pannes signalées",
    value: 8,
    icon: Lightbulb,
  },
];

const activities = [
  "Un nouvel utilisateur a été ajouté.",
  "Une sortie de stock a été enregistrée.",
  "Un bien communal a été modifié.",
  "Une nouvelle panne d’éclairage a été signalée.",
];

const alerts = [
  "5 articles ont atteint le seuil minimal.",
  "3 interventions sont encore en attente.",
  "2 demandes de fourniture doivent être validées.",
];

function DashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Tableau de bord
        </h1>

        <p className="mt-2 text-slate-600">
          Vue générale sur les activités de la plateforme SGPBSE.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((statistic) => {
          const Icon = statistic.icon;

          return (
            <article
              key={statistic.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {statistic.label}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {statistic.value}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <Icon size={24} />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-orange-600" />

            <h2 className="text-lg font-semibold text-slate-900">
              Activités récentes
            </h2>
          </div>

          <ul className="mt-4 space-y-3">
            {activities.map((activity) => (
              <li
                key={activity}
                className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                {activity}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <TriangleAlert size={20} className="text-orange-600" />

            <h2 className="text-lg font-semibold text-slate-900">
              Alertes
            </h2>
          </div>

          <ul className="mt-4 space-y-3">
            {alerts.map((alert) => (
              <li
                key={alert}
                className="flex items-start gap-3 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-slate-700"
              >
                <TriangleAlert
                  size={18}
                  className="mt-0.5 shrink-0 text-orange-600"
                />

                <span>{alert}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export default DashboardPage;