import {
  BadgeCheck,
  IdCard,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import type { User } from "../../types/user";

type UserCardProps = {
  user: User;
};

function UserCard({ user }: UserCardProps) {
  const information = [
    {
      label: "Nom complet",
      value: `${user.firstname} ${user.lastname}`,
      icon: UserRound,
    },
    {
      label: "Adresse e-mail",
      value: user.email,
      icon: Mail,
    },
    {
      label: "Téléphone",
      value: user.phone,
      icon: Phone,
    },
    {
      label: "CIN",
      value: user.cin,
      icon: IdCard,
    },
    {
      label: "Genre",
      value: user.gender === "HOMME" ? "Homme" : "Femme",
      icon: UserRound,
    },
    {
      label: "Rôle",
      value: user.role.name,
      icon: BadgeCheck,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center border-b border-slate-100 pb-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-700">
          {user.firstname.charAt(0)}
          {user.lastname.charAt(0)}
        </div>

        <h2 className="mt-4 text-xl font-bold text-slate-900">
          {user.firstname} {user.lastname}
        </h2>

        <span className="mt-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          {user.role.name}
        </span>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {information.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-xl bg-slate-50 p-4"
            >
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Icon size={16} className="text-orange-600" />
                {item.label}
              </dt>

              <dd className="mt-2 wrap-break-words font-medium text-slate-800">
                {item.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export default UserCard;