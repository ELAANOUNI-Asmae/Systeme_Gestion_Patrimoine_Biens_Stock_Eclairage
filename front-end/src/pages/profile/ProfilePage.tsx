import {
  BadgeCheck,
  IdCard,
  KeyRound,
  Mail,
  Phone,
  Save,
  Shield,
  UserRound,
  VenusAndMars,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  useTranslation,
} from "react-i18next";

import {
  useAuth,
} from "../../hooks/useAuth";

import {
  userService,
} from "../../services/userService";

import type {
  User,
} from "../../types/user";

function ProfilePage() {
  const {
    t,
    i18n,
  } = useTranslation();

  const {
    user: authUser,
  } = useAuth();

  const isArabic =
    i18n.language.startsWith(
      "ar",
    );

  const [
    profileUser,
    setProfileUser,
  ] = useState<User | null>(
    null,
  );

  const [
    firstname,
    setFirstname,
  ] = useState("");

  const [
    lastname,
    setLastname,
  ] = useState("");

  const [
    firstnameAr,
    setFirstnameAr,
  ] = useState("");

  const [
    lastnameAr,
    setLastnameAr,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    loadingPage,
    setLoadingPage,
  ] = useState(true);

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(false);

  const [
    profileError,
    setProfileError,
  ] = useState("");

  const [
    profileSuccess,
    setProfileSuccess,
  ] = useState("");

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    passwordLoading,
    setPasswordLoading,
  ] = useState(false);

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [
    passwordSuccess,
    setPasswordSuccess,
  ] = useState("");

  const applyUserData =
    useCallback(
      (data: User) => {
        setProfileUser(
          data,
        );

        setFirstname(
          data.firstname,
        );

        setLastname(
          data.lastname,
        );

        setFirstnameAr(
          data.firstnameAr,
        );

        setLastnameAr(
          data.lastnameAr,
        );

        setPhone(
          data.phone,
        );
      },
      [],
    );

  const loadProfile =
    useCallback(
      async () => {
        if (!authUser) {
          setProfileUser(
            null,
          );

          setLoadingPage(
            false,
          );

          return;
        }

        try {
          const data =
            await userService.getCurrentProfile();

          applyUserData(
            data,
          );

          setProfileError(
            "",
          );
        } catch {
          setProfileError(
            t(
              "profile.errors.load",
            ),
          );
        } finally {
          setLoadingPage(
            false,
          );
        }
      },
      [
        authUser,
        applyUserData,
        t,
      ],
    );

  useEffect(() => {
    setLoadingPage(
      true,
    );

    void loadProfile();
  }, [loadProfile]);

  /*
   * Si l'administrateur modifie
   * l'utilisateur actuellement
   * connecté, on recharge le profil.
   */
  useEffect(() => {
    const handleUserUpdated =
      (event: Event) => {
        const customEvent =
          event as CustomEvent<{
            userId?: number;
          }>;

        if (
          !authUser
        ) {
          return;
        }

        if (
          !customEvent.detail
            ?.userId ||
          customEvent.detail
            .userId ===
            authUser.id
        ) {
          void loadProfile();
        }
      };

    window.addEventListener(
      "user-updated",
      handleUserUpdated,
    );

    return () => {
      window.removeEventListener(
        "user-updated",
        handleUserUpdated,
      );
    };
  }, [
    authUser,
    loadProfile,
  ]);

  const handleProfileSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !authUser ||
        !profileUser
      ) {
        return;
      }

      setProfileError("");
      setProfileSuccess("");

      if (
        !firstname.trim() ||
        !lastname.trim() ||
        !firstnameAr.trim() ||
        !lastnameAr.trim() ||
        !phone.trim()
      ) {
        setProfileError(
          t(
            "profile.errors.required",
          ),
        );

        return;
      }

      try {
        setProfileLoading(
          true,
        );

        const updated =
          await userService.updateProfile(
            {
              firstname,
              lastname,
              firstnameAr,
              lastnameAr,
              phone,
            },
          );

        applyUserData(
          updated,
        );

        /*
         * Informe le Header que
         * le profil a été modifié.
         */
        window.dispatchEvent(
          new CustomEvent(
            "profile-updated",
            {
              detail: {
                userId:
                  updated.id,
              },
            },
          ),
        );

        setProfileSuccess(
          t(
            "profile.success.updated",
          ),
        );
      } catch {
        setProfileError(
          t(
            "profile.errors.update",
          ),
        );
      } finally {
        setProfileLoading(
          false,
        );
      }
    };

  const handlePasswordSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setPasswordError("");
      setPasswordSuccess("");

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        setPasswordError(
          t(
            "profile.errors.required",
          ),
        );

        return;
      }

      if (
        newPassword.length < 8
      ) {
        setPasswordError(
          t(
            "profile.errors.passwordLength",
          ),
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setPasswordError(
          t(
            "profile.errors.passwordMismatch",
          ),
        );

        return;
      }

      if (
        currentPassword ===
        newPassword
      ) {
        setPasswordError(
          t(
            "profile.errors.samePassword",
          ),
        );

        return;
      }

      try {
        setPasswordLoading(
          true,
        );

        await userService.changePassword(
          currentPassword,
          newPassword,
        );

        setCurrentPassword(
          "",
        );

        setNewPassword(
          "",
        );

        setConfirmPassword(
          "",
        );

        setPasswordSuccess(
          t(
            "profile.success.passwordChanged",
          ),
        );
      } catch {
        setPasswordError(
          t(
            "profile.errors.passwordChange",
          ),
        );
      } finally {
        setPasswordLoading(
          false,
        );
      }
    };

  const inputClassName =
    "mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-orange-500/20";

  const readOnlyClassName =
    "mt-2 flex min-h-11 w-full items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300";

  if (loadingPage) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        {t(
          "profile.page.loading",
        )}
      </div>
    );
  }

  if (
    !authUser ||
    !profileUser
  ) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
        {profileError ||
          t(
            "profile.errors.load",
          )}
      </section>
    );
  }

  const displayedName =
    isArabic
      ? `${profileUser.firstnameAr} ${profileUser.lastnameAr}`
      : `${profileUser.firstname} ${profileUser.lastname}`;

  const initials =
    isArabic
      ? `${profileUser.firstnameAr.charAt(
          0,
        )}${profileUser.lastnameAr.charAt(
          0,
        )}`
      : `${profileUser.firstname.charAt(
          0,
        )}${profileUser.lastname.charAt(
          0,
        )}`;

  return (
    <section className="space-y-6">
      {/* PAGE TITLE */}

      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          <UserRound className="text-orange-600 dark:text-orange-400" />

          {t(
            "profile.page.title",
          )}
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {t(
            "profile.page.description",
          )}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        {/* SUMMARY */}

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold uppercase text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
            {initials}
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            {displayedName}
          </h2>

          <p
            className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400"
            dir="ltr"
          >
            {profileUser.email}
          </p>

          <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 dark:border-slate-700">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
              <Shield
                size={19}
                className="text-orange-600 dark:text-orange-400"
              />

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t(
                    "profile.card.role",
                  )}
                </p>

                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {t(
                    `roles.names.${profileUser.role.name}`,
                    {
                      defaultValue:
                        profileUser
                          .role
                          .name,
                    },
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
              <BadgeCheck
                size={19}
                className="text-green-600 dark:text-green-400"
              />

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t(
                    "profile.card.permissions",
                  )}
                </p>

                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {
                    profileUser
                      .role
                      .permissions
                      .length
                  }{" "}
                  {t(
                    "profile.card.permissionCount",
                  )}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* CONTENT */}

        <div className="space-y-6">
          {/* PERSONAL INFORMATION */}

          <form
            onSubmit={
              handleProfileSubmit
            }
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <UserRound className="text-orange-600 dark:text-orange-400" />

              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t(
                    "profile.information.title",
                  )}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t(
                    "profile.information.description",
                  )}
                </p>
              </div>
            </div>

            {profileError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-400">
                {profileSuccess}
              </div>
            )}

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t(
                  "profile.fields.firstNameFr",
                )}

                <input
                  type="text"
                  value={firstname}
                  onChange={(
                    event,
                  ) =>
                    setFirstname(
                      event.target
                        .value,
                    )
                  }
                  disabled={
                    profileLoading
                  }
                  className={
                    inputClassName
                  }
                />
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t(
                  "profile.fields.lastNameFr",
                )}

                <input
                  type="text"
                  value={lastname}
                  onChange={(
                    event,
                  ) =>
                    setLastname(
                      event.target
                        .value,
                    )
                  }
                  disabled={
                    profileLoading
                  }
                  className={
                    inputClassName
                  }
                />
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t(
                  "profile.fields.firstNameAr",
                )}

                <input
                  type="text"
                  dir="rtl"
                  value={
                    firstnameAr
                  }
                  onChange={(
                    event,
                  ) =>
                    setFirstnameAr(
                      event.target
                        .value,
                    )
                  }
                  disabled={
                    profileLoading
                  }
                  className={
                    inputClassName
                  }
                />
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t(
                  "profile.fields.lastNameAr",
                )}

                <input
                  type="text"
                  dir="rtl"
                  value={
                    lastnameAr
                  }
                  onChange={(
                    event,
                  ) =>
                    setLastnameAr(
                      event.target
                        .value,
                    )
                  }
                  disabled={
                    profileLoading
                  }
                  className={
                    inputClassName
                  }
                />
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-2">
                {t(
                  "profile.fields.phone",
                )}

                <div className="relative">
                  <Phone
                    size={18}
                    className="pointer-events-none absolute inset-s-3 top-1/2 mt-1 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(
                      event,
                    ) =>
                      setPhone(
                        event.target
                          .value,
                      )
                    }
                    disabled={
                      profileLoading
                    }
                    className={`${inputClassName} ps-10`}
                  />
                </div>
              </label>
            </div>

            {/* ACCOUNT READ ONLY */}

            <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {t(
                  "profile.account.title",
                )}
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t(
                  "profile.account.description",
                )}
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-2">
                  {t(
                    "profile.fields.email",
                  )}

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute inset-s-3 top-1/2 mt-1 -translate-y-1/2 text-slate-400"
                    />

                    <div
                      className={`${readOnlyClassName} ps-10`}
                      dir="ltr"
                    >
                      {
                        profileUser.email
                      }
                    </div>
                  </div>
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t(
                    "profile.fields.cin",
                  )}

                  <div className="relative">
                    <IdCard
                      size={18}
                      className="absolute inset-s-3 top-1/2 mt-1 -translate-y-1/2 text-slate-400"
                    />

                    <div
                      className={`${readOnlyClassName} ps-10`}
                      dir="ltr"
                    >
                      {
                        profileUser.cin
                      }
                    </div>
                  </div>
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t(
                    "profile.fields.gender",
                  )}

                  <div className="relative">
                    <VenusAndMars
                      size={18}
                      className="absolute inset-s-3 top-1/2 mt-1 -translate-y-1/2 text-slate-400"
                    />

                    <div
                      className={`${readOnlyClassName} ps-10`}
                    >
                      {t(
                        `users.gender.${profileUser.gender}`,
                        {
                          defaultValue:
                            profileUser.gender,
                        },
                      )}
                    </div>
                  </div>
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-2">
                  {t(
                    "profile.card.role",
                  )}

                  <div
                    className={
                      readOnlyClassName
                    }
                  >
                    {t(
                      `roles.names.${profileUser.role.name}`,
                      {
                        defaultValue:
                          profileUser
                            .role
                            .name,
                      },
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={
                    profileLoading
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save
                    size={18}
                  />

                  {profileLoading
                    ? t(
                        "profile.actions.saving",
                      )
                    : t(
                        "profile.actions.save",
                      )}
                </button>
            </div>
          </form>

          {/* PASSWORD */}

          <form
              onSubmit={
                handlePasswordSubmit
              }
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6"
            >
              <div className="flex items-center gap-3">
                <KeyRound className="text-orange-600 dark:text-orange-400" />

                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t(
                      "profile.password.title",
                    )}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {t(
                      "profile.password.description",
                    )}
                  </p>
                </div>
              </div>

              {passwordError && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                  {
                    passwordError
                  }
                </div>
              )}

              {passwordSuccess && (
                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-400">
                  {
                    passwordSuccess
                  }
                </div>
              )}

              <div className="mt-6 space-y-5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t(
                    "profile.fields.currentPassword",
                  )}

                  <input
                    type="password"
                    value={
                      currentPassword
                    }
                    onChange={(
                      event,
                    ) =>
                      setCurrentPassword(
                        event.target
                          .value,
                      )
                    }
                    className={
                      inputClassName
                    }
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t(
                    "profile.fields.newPassword",
                  )}

                  <input
                    type="password"
                    value={
                      newPassword
                    }
                    onChange={(
                      event,
                    ) =>
                      setNewPassword(
                        event.target
                          .value,
                      )
                    }
                    className={
                      inputClassName
                    }
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t(
                    "profile.fields.confirmPassword",
                  )}

                  <input
                    type="password"
                    value={
                      confirmPassword
                    }
                    onChange={(
                      event,
                    ) =>
                      setConfirmPassword(
                        event.target
                          .value,
                      )
                    }
                    className={
                      inputClassName
                    }
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={
                    passwordLoading
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  <KeyRound
                    size={18}
                  />

                  {passwordLoading
                    ? t(
                        "profile.actions.changing",
                      )
                    : t(
                        "profile.actions.changePassword",
                      )}
                </button>
              </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;