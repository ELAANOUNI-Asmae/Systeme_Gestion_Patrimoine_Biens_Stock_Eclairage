import { NavLink } from "react-router-dom";

import { menuItems } from "../../config/menu";
import { SIDEBAR_ICON_SIZE } from "../../constants/ui";

function Sidebar() {
  return (
    <aside className="w-full shrink-0 border-r border-slate-200 bg-white lg:w-64">
      <nav className="p-4" aria-label="Navigation principale">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-xl px-4 py-3",
                      "transition-all duration-200",
                      isActive
                        ? "bg-orange-100 font-semibold text-orange-700"
                        : "text-slate-700 hover:bg-orange-50 hover:text-orange-600",
                    ].join(" ")
                  }
                >
                  <Icon
                    size={SIDEBAR_ICON_SIZE}
                    aria-hidden="true"
                  />

                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;