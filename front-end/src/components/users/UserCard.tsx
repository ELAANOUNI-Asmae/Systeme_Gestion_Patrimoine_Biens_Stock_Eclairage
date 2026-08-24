import {
  BadgeCheck,
  IdCard,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import { useTranslation } from "react-i18next";

import type { User } from "../../types/user";

import { getRoleLabel } from "../../utils/roleLabels";

type UserCardProps = {
  user: User;
};

function UserCard({
  user,
}: UserCardProps) {
  const { t, i18n } =
    useTranslation();

  const isArabic =
    i18n.language.startsWith("ar");

  const displayFirstName =
    isArabic
      ? user.firstnameAr
      : user.firstname;

  const displayLastName =
    isArabic
      ? user.lastnameAr
      : user.lastname;

  const information = [
    {
      label: t(
        "users.details.fullName",
      ),
      value: `${displayFirstName} ${displayLastName}`,
      icon: UserRound,
    },
    {
      label: t(
        "users.details.email",
      ),
      value: user.email,
      icon: Mail,
    },
    {
      label: t(
        "users.details.phone",
      ),
      value: user.phone,
      icon: Phone,
    },
    {
      label: t(
        "users.details.cin",
      ),
      value: user.cin,
      icon: IdCard,
    },
    {
      label: t(
        "users.details.gender",
      ),
      value:
        user.gender === "HOMME"
          ? t("users.form.male")
          : t("users.form.female"),
      icon: UserRound,
    },
    {
      label: t(
        "users.details.role",
      ),
      value: getRoleLabel(
        user.role.name,
        t,
      ),
      icon: BadgeCheck,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-col items-center border-b border-slate-100 pb-6 text-center dark:border-slate-700">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
          {displayFirstName.charAt(0)}
          {displayLastName.charAt(0)}
        </div>

        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
          {user.firstname} {" "}
          {user.lastname}
        </h2>

        <span className="mt-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
          {getRoleLabel(
            user.role.name,
            t,
          )}
        </span>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {information.map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <div
                key={
                  item.label
                }
                className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900"
              >
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <Icon
                    size={16}
                    className="text-orange-600 dark:text-orange-400"
                  />

                  {item.label}
                </dt>

                <dd className="mt-2 wrap-break-words font-medium text-slate-800 dark:text-slate-100">
                  {item.value}
                </dd>
              </div>
            );
          },
        )}
      </dl>
    </div>
  );
}

export default UserCard;