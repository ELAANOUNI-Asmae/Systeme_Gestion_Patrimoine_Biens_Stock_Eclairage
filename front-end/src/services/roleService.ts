import {
  initialMockRoles,
  mockPermissions,
} from "../mock/roles";

import type {
  Permission,
  Role,
  RoleFormData,
} from "../types/role";

let roles: Role[] =
  initialMockRoles.map(
    (role) => ({
      ...role,
      permissions: [
        ...role.permissions,
      ],
    }),
  );

const delay = (
  milliseconds = 250,
) =>
  new Promise<void>(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds,
      );
    },
  );

export const roleService = {
  async getAll(): Promise<
    Role[]
  > {
    await delay();

    return roles.map(
      (role) => ({
        ...role,
        permissions: [
          ...role.permissions,
        ],
      }),
    );
  },

  async getById(
    id: number,
  ): Promise<Role> {
    await delay();

    const role =
      roles.find(
        (item) =>
          item.id === id,
      );

    if (!role) {
      throw new Error(
        "ROLE_NOT_FOUND",
      );
    }

    return {
      ...role,
      permissions: [
        ...role.permissions,
      ],
    };
  },

  async getPermissions(): Promise<
    Permission[]
  > {
    await delay();

    return mockPermissions.map(
      (permission) => ({
        ...permission,
      }),
    );
  },

  async create(
    data: RoleFormData,
  ): Promise<Role> {
    await delay();

    const normalizedName =
      data.name
        .trim()
        .toUpperCase();

    const alreadyExists =
      roles.some(
        (role) =>
          role.name.toUpperCase() ===
          normalizedName,
      );

    if (alreadyExists) {
      throw new Error(
        "ROLE_ALREADY_EXISTS",
      );
    }

    const permissions =
      mockPermissions.filter(
        (permission) =>
          data.permissionIds.includes(
            permission.id,
          ),
      );

    if (
      permissions.length ===
      0
    ) {
      throw new Error(
        "PERMISSION_REQUIRED",
      );
    }

    const newRole: Role = {
      id:
        Math.max(
          0,
          ...roles.map(
            (role) =>
              role.id,
          ),
        ) + 1,
      name: normalizedName,
      permissions,
    };

    roles = [
      newRole,
      ...roles,
    ];

    return {
      ...newRole,
      permissions: [
        ...newRole.permissions,
      ],
    };
  },

  async update(
    id: number,
    data: RoleFormData,
  ): Promise<Role> {
    await delay();

    const roleIndex =
      roles.findIndex(
        (role) =>
          role.id === id,
      );

    if (
      roleIndex === -1
    ) {
      throw new Error(
        "ROLE_NOT_FOUND",
      );
    }

    const normalizedName =
      data.name
        .trim()
        .toUpperCase();

    const alreadyExists =
      roles.some(
        (role) =>
          role.id !== id &&
          role.name.toUpperCase() ===
            normalizedName,
      );

    if (alreadyExists) {
      throw new Error(
        "ROLE_ALREADY_EXISTS",
      );
    }

    const permissions =
      mockPermissions.filter(
        (permission) =>
          data.permissionIds.includes(
            permission.id,
          ),
      );

    if (
      permissions.length ===
      0
    ) {
      throw new Error(
        "PERMISSION_REQUIRED",
      );
    }

    const updatedRole: Role = {
      id,
      name: normalizedName,
      permissions,
    };

    roles[roleIndex] =
      updatedRole;

    return {
      ...updatedRole,
      permissions: [
        ...updatedRole.permissions,
      ],
    };
  },

  async remove(
    id: number,
  ): Promise<void> {
    await delay();

    const role =
      roles.find(
        (item) =>
          item.id === id,
      );

    if (!role) {
      throw new Error(
        "ROLE_NOT_FOUND",
      );
    }

    if (
      role.name === "ADMIN"
    ) {
      throw new Error(
        "ADMIN_ROLE_PROTECTED",
      );
    }

    roles =
      roles.filter(
        (item) =>
          item.id !== id,
      );
  },
};
