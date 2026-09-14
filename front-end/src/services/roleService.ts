import api from "./api";

import type {
  Permission,
  Role,
  RoleFormData,
} from "../types/role";

type BackendRole = {
  id: number;
  name: string;
  permissions?: Permission[];
};

function normalizePermission(
  permission: Permission,
): Permission {
  return {
    id: permission.id,

    name:
      permission.name ?? "",

    permission:
      permission.permission ||
      permission.name ||
      "",
  };
}

function normalizeRole(
  role: BackendRole,
): Role {
  return {
    id: role.id,

    name: role.name,

    permissions:
      (role.permissions ?? []).map(
        normalizePermission,
      ),
  };
}

function buildPayload(
  data: RoleFormData,
) {
  return {
    name:
      data.name
        .trim()
        .toUpperCase(),

    permission_ids:
      data.permissionIds,
  };
}

export const roleService = {
  async getAll(): Promise<
    Role[]
  > {
    const response =
      await api.get<
        BackendRole[]
      >(
        "/sgpbse/role/all",
      );

    return response.data.map(
      normalizeRole,
    );
  },

  async getById(
    id: number,
  ): Promise<Role> {
    const roles =
      await this.getAll();

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

    return role;
  },

  async getPermissions(): Promise<
    Permission[]
  > {
    const response =
      await api.get<
        Permission[]
      >(
        "/sgpbse/permission/all",
      );

    return response.data.map(
      normalizePermission,
    );
  },

  async create(
    data: RoleFormData,
  ): Promise<Role> {
    await api.post(
      "/sgpbse/role/create",
      buildPayload(data),
    );

    const roles =
      await this.getAll();

    const normalizedName =
      data.name
        .trim()
        .toUpperCase();

    const createdRole =
      roles.find(
        (role) =>
          role.name.toUpperCase() ===
          normalizedName,
      );

    if (!createdRole) {
      throw new Error(
        "ROLE_NOT_FOUND_AFTER_CREATE",
      );
    }

    return createdRole;
  },

  async update(
    id: number,
    data: RoleFormData,
  ): Promise<Role> {
    await api.put(
      `/sgpbse/role/update/${id}`,
      buildPayload(data),
    );

    return this.getById(
      id,
    );
  },

  async remove(
    id: number,
  ): Promise<void> {
    const role =
      await this.getById(
        id,
      );

    if (
      role.name.toUpperCase() ===
      "ADMIN"
    ) {
      throw new Error(
        "ADMIN_ROLE_PROTECTED",
      );
    }

    await api.delete(
      `/sgpbse/role/delete/${id}`,
    );
  },
};