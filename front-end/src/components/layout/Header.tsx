import {
  Bell,
  Languages,
  LogOut,
  Menu,
  Moon,
  Sun,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import Logo from "../common/Logo";

import {
  useAuth,
} from "../../hooks/useAuth";

import {
  useTheme,
} from "../../hooks/useTheme";

import {
  ROUTES,
} from "../../constants/routes";

import {
  NOTIFICATION_ACCESS_PERMISSIONS,
} from "../../constants/permissions";

import {
  NOTIFICATIONS_CHANGED_EVENT,
  notificationService,
} from "../../services/notificationService";

type HeaderProps = {
  onMenuClick?: () => void;
};

function Header({
  onMenuClick,
}: HeaderProps) {
  const navigate =
    useNavigate();

  const {
    t,
    i18n,
  } = useTranslation();

  const {
    user,
    logout,
    hasPermission,
  } = useAuth();

  const {
    theme,
    toggleTheme,
  } = useTheme();

  const isArabic =
    i18n.language.startsWith(
      "ar",
    );

  const canAccessNotifications =
    NOTIFICATION_ACCESS_PERMISSIONS.some(
      (permission) =>
        hasPermission(
          permission,
        ),
    );

  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!canAccessNotifications) {
      setUnreadCount(0);
      return;
    }
    try {
      setUnreadCount(await notificationService.getUnreadCount());
    } catch {
      setUnreadCount(0);
    }
  }, [canAccessNotifications]);

  useEffect(() => {
    void refreshUnreadCount();
    const handler = () => void refreshUnreadCount();
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handler);
  }, [refreshUnreadCount]);

  const handleLogout = () => {
    logout();

    navigate(
      ROUTES.LOGIN,
      {
        replace: true,
      },
    );
  };

  const changeLanguage =
    async () => {
      const nextLanguage =
        isArabic
          ? "fr"
          : "ar";

      await i18n.changeLanguage(
        nextLanguage,
      );
    };

  const displayedName =
    user
      ? `${user.firstName} ${user.lastName}`.trim()
      : "";

  const initials =
    user
      ? `${
          user.firstName.charAt(
            0,
          )
        }${
          user.lastName.charAt(
            0,
          )
        }`
          .trim()
          .toUpperCase() ||
        user.email
          .charAt(0)
          .toUpperCase()
      : "U";

  const displayedRole =
    user?.role.name ?? "";

  return (
    <header className="sticky top-0 z-40 flex h-18 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-950/95 sm:px-6">
      {/* LEFT */}

      <div className="flex min-w-0 items-center gap-3">
        {/* MENU */}

        <button
          type="button"
          onClick={
            onMenuClick
          }
          aria-label={t(
            "header.menu",
          )}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Menu
            size={22}
          />
        </button>

        {/* APP */}

        <button
          type="button"
          onClick={() =>
            navigate(
              ROUTES.DASHBOARD,
            )
          }
          className="flex min-w-0 items-center gap-3 text-start"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-500/15">
            <Logo className="h-12 w-12 object-contain" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-extrabold text-slate-900 dark:text-white">
              {t(
                "app.name",
              )}
            </p>

            <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">
              {t(
                "app.subtitle",
              )}
            </p>
          </div>
        </button>
      </div>

      {/* RIGHT */}

      <div className="flex items-center gap-1 sm:gap-2">
        {/* LANGUAGE */}

        <button
          type="button"
          onClick={() => {
            void changeLanguage();
          }}
          title={t(
            "header.language",
          )}
          className="flex h-10 items-center gap-2 rounded-xl px-2.5 text-sm font-bold text-slate-600 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Languages
            size={19}
          />

          <span className="hidden sm:inline">
            {isArabic
              ? "FR"
              : "عربي"}
          </span>
        </button>

        {/* DARK MODE */}

        <button
          type="button"
          onClick={
            toggleTheme
          }
          title={
            theme === "dark"
              ? t(
                  "header.lightMode",
                )
              : t(
                  "header.darkMode",
                )
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-amber-400"
        >
          {theme ===
          "dark" ? (
            <Sun
              size={19}
            />
          ) : (
            <Moon
              size={19}
            />
          )}
        </button>

        {/* NOTIFICATIONS */}

        {canAccessNotifications && (
          <button
            type="button"
            onClick={() =>
              navigate(
                ROUTES.NOTIFICATIONS,
              )
            }
            title={t(
              "menu.notifications",
            )}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bell
              size={19}
            />

            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}

        <div className="mx-1 hidden h-7 w-px bg-slate-200 dark:bg-slate-800 md:block" />

        {/* CURRENT USER */}

        <div className="hidden text-end md:block">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {displayedName}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t(
              `roles.names.${displayedRole}`,
              {
                defaultValue:
                  displayedRole,
              },
            )}
          </p>
        </div>

        {/* PROFILE */}

        <button
          type="button"
          onClick={() =>
            navigate(
              ROUTES.PROFILE,
            )
          }
          title={t(
            "header.profile",
          )}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold uppercase text-orange-700 transition hover:scale-105 hover:bg-orange-200 dark:bg-orange-500/15 dark:text-orange-300"
        >
          {initials}
        </button>

        {/* LOGOUT */}

        <button
          type="button"
          onClick={
            handleLogout
          }
          title={t(
            "header.logout",
          )}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <LogOut
            size={19}
          />
        </button>
      </div>
    </header>
  );
}

export default Header;