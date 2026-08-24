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
  FileText,
  Settings,
  Bell,
  UserRound,
} from "lucide-react";

import { ROUTES } from "../constants/routes";
import { PERMISSIONS } from "../constants/permissions";

import type {
  Permission,
} from "../constants/permissions";

export interface MenuItem {
  id: number;
  labelKey: string;
  path: string;
  icon: ElementType;
  permission?: Permission;
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
      PERMISSIONS.GET_ALL_USERS,
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
      PERMISSIONS.GET_ALL_ARTICLES,
  },

  {
    id: 6,
    labelKey: "menu.lighting",
    path: ROUTES.LIGHTING,
    icon: Lightbulb,
    permission:
      PERMISSIONS.GET_ALL_LIGHTS,
  },

  {
    id: 7,
    labelKey: "menu.reports",
    path: ROUTES.REPORTS,
    icon: FileText,
    permission:
      PERMISSIONS.GENERATE_REPORT,
  },

  {
    id: 8,
    labelKey:
      "menu.notifications",
    path:
      ROUTES.NOTIFICATIONS,
    icon: Bell,
  },

  {
    id: 9,
    labelKey: "menu.profile",
    path: ROUTES.PROFILE,
    icon: UserRound,
  },

  {
    id: 10,
    labelKey: "menu.settings",
    path: ROUTES.SETTINGS,
    icon: Settings,
    permission:
      PERMISSIONS.MANAGE_SETTINGS,
  },
];