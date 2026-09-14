import type {
  ElementType,
} from "react";

import {
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  Package,
  Lightbulb,
  Bell,
  UserRound,
  FileBarChart,
} from "lucide-react";

import {
  ROUTES,
} from "../constants/routes";

import {
  NOTIFICATION_ACCESS_PERMISSIONS,
  REPORT_ACCESS_PERMISSIONS,
  PERMISSIONS,
  type Permission,
} from "../constants/permissions";

export interface MenuItem {
  id: number;
  labelKey: string;
  path: string;
  icon: ElementType;

  // permission unique
  permission?: Permission;

  // au moins une permission de cette liste
  permissions?: Permission[];
}

export const menuItems: MenuItem[] = [
  {
    id: 1,
    labelKey: "menu.dashboard",
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },

  {
    id: 2,
    labelKey: "menu.users",
    path: ROUTES.USERS,
    icon: Users,
    permission:
      PERMISSIONS.GET_ALL_PROFILS,
  },

  {
    id: 3,
    labelKey: "menu.roles",
    path: ROUTES.ROLES,
    icon: Shield,
    permission:
      PERMISSIONS.GET_ALL_ROLES,
  },

  {
    id: 4,
    labelKey: "menu.assets",
    path: ROUTES.BIENS,
    icon: Building2,
    permission:
      PERMISSIONS.GET_ALL_ASSETS,
  },

  {
    id: 5,
    labelKey: "menu.stock",
    path: ROUTES.STOCK,
    icon: Package,
    permission:
      PERMISSIONS.GET_ALL_ITEMS,
  },

  {
    id: 6,
    labelKey: "menu.lighting",
    path: ROUTES.LIGHTING,
    icon: Lightbulb,
    permission:
      PERMISSIONS.GET_ALL_LIGHT_POINT,
  },

  {
    id: 7,
    labelKey: "menu.reports",
    path: ROUTES.REPORTS,
    icon: FileBarChart,
    permissions: REPORT_ACCESS_PERMISSIONS,
  },

  {
    id: 8,
    labelKey:
      "menu.notifications",
    path:
      ROUTES.NOTIFICATIONS,
    icon: Bell,
    permissions:
      NOTIFICATION_ACCESS_PERMISSIONS,
  },

  /*
   * Le profil personnel utilise /user/me.
   * Cet endpoint n'a pas de @PreAuthorize :
   * tout utilisateur authentifié peut donc
   * consulter son propre profil.
   */
  {
    id: 9,
    labelKey: "menu.profile",
    path: ROUTES.PROFILE,
    icon: UserRound,
  },

  /*
   * SETTINGS reste masqué pour le moment.
   * MANAGE_SETTINGS n'existe pas dans le Backend.
   */
];