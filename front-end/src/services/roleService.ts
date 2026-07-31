import {
  initialMockRoles,
  mockPermissions,
} from "../mock/roles";

import type {
  Permission,
  Role,
  RoleFormData,
} from "../types/role";

let roles: Role[] = [...initialMockRoles];

const delay = (milliseconds = 250) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const roleService = {
  async getAll(): Promise<Role[]> {
    await delay();
    return roles.map((role) => ({
      ...role,
      permissions: [...role.permissions],
    }));
  },

  async getById(id: number): Promise<Role> {
    await delay();

    const role = roles.find((item) => item.id === id);

    if (!role) {
      throw new Error("Rôle introuvable.");
    }

    return {
      ...role,
      permissions: [...role.permissions],
    };
  },

  async getPermissions(): Promise<Permission[]> {
    await delay();
    return [...mockPermissions];
  },

  async create(data: RoleFormData): Promise<Role> {
    await delay();

    const normalizedName = data.name.trim().toUpperCase();

    const alreadyExists = roles.some(
      (role) => role.name.toUpperCase() === normalizedName,
    );

    if (alreadyExists) {
      throw new Error("Un rôle avec ce nom existe déjà.");
    }

    const permissions = mockPermissions.filter((permission) =>
      data.permissionIds.includes(permission.id),
    );

    const newRole: Role = {
      id: Math.max(0, ...roles.map((role) => role.id)) + 1,
      name: normalizedName,
      permissions,
    };

    roles = [newRole, ...roles];

    return newRole;
  },

  async update(
    id: number,
    data: RoleFormData,
  ): Promise<Role> {
    await delay();

    const roleIndex = roles.findIndex((role) => role.id === id);

    if (roleIndex === -1) {
      throw new Error("Rôle introuvable.");
    }

    const normalizedName = data.name.trim().toUpperCase();

    const alreadyExists = roles.some(
      (role) =>
        role.id !== id &&
        role.name.toUpperCase() === normalizedName,
    );

    if (alreadyExists) {
      throw new Error("Un rôle avec ce nom existe déjà.");
    }

    const permissions = mockPermissions.filter((permission) =>
      data.permissionIds.includes(permission.id),
    );

    const updatedRole: Role = {
      id,
      name: normalizedName,
      permissions,
    };

    roles[roleIndex] = updatedRole;

    return updatedRole;
  },

  async remove(id: number): Promise<void> {
    await delay();

    const protectedRole = roles.find(
      (role) => role.id === id && role.name === "ADMIN",
    );

    if (protectedRole) {
      throw new Error("Le rôle ADMIN ne peut pas être supprimé.");
    }

    roles = roles.filter((role) => role.id !== id);
  },
};