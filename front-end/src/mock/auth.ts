import {
  PERMISSIONS,
} from "../constants/permissions";

import type {
  Permission,
} from "../constants/permissions";

export interface MockRole {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface MockUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: MockRole;
}

export const mockRoles = {
  ADMIN: {
    id: 1,
    name: "ADMIN",
    permissions: Object.values(PERMISSIONS),
  },

  AGENT: {
    id: 2,
    name: "AGENT",
    permissions: [
      PERMISSIONS.GET_ALL_ASSETS,
      PERMISSIONS.GET_ASSET_INFOS,
      PERMISSIONS.CREATE_ASSET,
      PERMISSIONS.UPDATE_ASSET,
      PERMISSIONS.GET_ALL_ARTICLES,
      PERMISSIONS.CREATE_ARTICLE,
      PERMISSIONS.UPDATE_ARTICLE,
      PERMISSIONS.CREATE_STOCK_ENTRY,
      PERMISSIONS.CREATE_STOCK_EXIT,
      PERMISSIONS.CREATE_SUPPLY_REQUEST,
      PERMISSIONS.GET_STOCK_HISTORY,
      PERMISSIONS.GET_STOCK_ALERTS,
      PERMISSIONS.GET_ALL_LIGHTS,
      PERMISSIONS.REPORT_FAILURE,
      PERMISSIONS.CREATE_INTERVENTION,
      PERMISSIONS.GENERATE_REPORT,
      PERMISSIONS.EXPORT_PDF,
      PERMISSIONS.EXPORT_EXCEL,
      PERMISSIONS.UPDATE_PROFILE,
      PERMISSIONS.CHANGE_PASSWORD,
    ],
  },
} satisfies Record<string, MockRole>;

export const mockAuthUsers: MockUser[] = [
  {
    id: 1,
    firstName: "Mohamed",
    lastName: "Alaoui",
    email: "admin@sgpbse.ma",
    password: "Admin@123",
    role: mockRoles.ADMIN,
  },
  {
    id: 2,
    firstName: "Agent",
    lastName: "Communal",
    email: "agent@sgpbse.ma",
    password: "Agent@123",
    role: mockRoles.AGENT,
  },
];
