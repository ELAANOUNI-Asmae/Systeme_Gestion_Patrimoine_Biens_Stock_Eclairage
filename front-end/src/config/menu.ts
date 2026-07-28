import type { ElementType } from "react";

import {
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  Settings,
} from "lucide-react";

import { ROUTES } from "../constants/routes";

export interface MenuItem {
  id: number;
  label: string;
  path: string;
  icon: ElementType;
}

export const menuItems: MenuItem[] = [
  {
    id: 1,
    label: "Tableau de bord",
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    id: 2,
    label: "Utilisateurs",
    path: ROUTES.USERS,
    icon: Users,
  },
  {
    id: 3,
    label: "Rôles",
    path: ROUTES.ROLES,
    icon: Shield,
  },
  {
    id: 4,
    label: "Biens",
    path: ROUTES.BIENS,
    icon: Building2,
  },
  {
    id: 5,
    label: "Paramètres",
    path: ROUTES.SETTINGS,
    icon: Settings,
  },
];