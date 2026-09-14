import {
  NavLink,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import {
  menuItems,
} from "../../config/menu";

import {
  SIDEBAR_ICON_SIZE,
} from "../../constants/ui";

import {
  useAuth,
} from "../../hooks/useAuth";

type SidebarProps = {
  onNavigate?: () => void;
};

function Sidebar({
  onNavigate,
}: SidebarProps) {
  const {
    hasPermission,
  } = useAuth();

  const {
    t,
  } = useTranslation();

  const visibleMenuItems =
    menuItems.filter(
      (item) => {
        if (
          item.permission
        ) {
          return hasPermission(
            item.permission,
          );
        }

        if (
          item.permissions &&
          item.permissions.length >
            0
        ) {
          return item.permissions.some(
            (permission) =>
              hasPermission(
                permission,
              ),
          );
        }

        return true;
      },
    );

  return (
    <aside className="relative h-full w-full shrink-0 overflow-hidden border-e border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-950 lg:min-h-[calc(100vh-4.5rem)] lg:w-72">
      <div className="moroccan-pattern absolute inset-x-0 top-0 h-20 bg-linear-to-br from-orange-50 via-white to-teal-50 dark:from-orange-950/20 dark:via-slate-950 dark:to-teal-950/20" />

      <nav
        className="relative z-10 p-4 pt-6"
        aria-label="Navigation principale"
      >
        <ul className="space-y-2">
          {visibleMenuItems.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <li
                  key={
                    item.id
                  }
                >
                  <NavLink
                    to={
                      item.path
                    }
                    onClick={
                      onNavigate
                    }
                    className={({
                      isActive,
                    }) =>
                      [
                        "sidebar-link flex items-center gap-3 rounded-2xl px-4 py-3.5",
                        isActive
                          ? "sidebar-link-active font-semibold"
                          : "text-slate-600 hover:bg-orange-50 hover:text-orange-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-orange-300",
                      ].join(
                        " ",
                      )
                    }
                  >
                    <span className="sidebar-link-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100/80 dark:bg-slate-800/80">
                      <Icon
                        size={
                          SIDEBAR_ICON_SIZE
                        }
                        aria-hidden="true"
                      />
                    </span>

                    <span className="truncate">
                      {t(
                        item.labelKey,
                      )}
                    </span>
                  </NavLink>
                </li>
              );
            },
          )}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;