import {
  mockRoles,
  mockUsers,
} from "../mock/users";

import type {
  User,
  UserFormData,
} from "../types/user";

let users: User[] = [
  ...mockUsers,
];

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

export type ProfileUpdateData = {
  firstname: string;
  lastname: string;

  firstnameAr: string;
  lastnameAr: string;

  phone: string;
};

export const userService = {
  async getAll(): Promise<
    User[]
  > {
    await delay();

    return users.map(
      (user) => ({
        ...user,
      }),
    );
  },

  async getById(
    id: number,
  ): Promise<User> {
    await delay();

    const user = users.find(
      (item) =>
        item.id === id,
    );

    if (!user) {
      throw new Error(
        "USER_NOT_FOUND",
      );
    }

    return {
      ...user,
    };
  },

  async create(
    data: UserFormData,
  ): Promise<User> {
    await delay();

    const role =
      mockRoles.find(
        (item) =>
          item.id ===
          data.roleId,
      );

    if (!role) {
      throw new Error(
        "INVALID_ROLE",
      );
    }

    const emailExists =
      users.some(
        (item) =>
          item.email.toLowerCase() ===
          data.email
            .trim()
            .toLowerCase(),
      );

    if (emailExists) {
      throw new Error(
        "EMAIL_ALREADY_USED",
      );
    }

    const newUser: User = {
      id:
        Math.max(
          0,
          ...users.map(
            (item) =>
              item.id,
          ),
        ) + 1,

      firstname:
        data.firstname.trim(),

      lastname:
        data.lastname.trim(),

      firstnameAr:
        data.firstnameAr.trim(),

      lastnameAr:
        data.lastnameAr.trim(),

      email:
        data.email
          .trim()
          .toLowerCase(),

      gender:
        data.gender,

      phone:
        data.phone.trim(),

      cin:
        data.cin
          .trim()
          .toUpperCase(),

      role,
    };

    users = [
      newUser,
      ...users,
    ];

    return {
      ...newUser,
    };
  },

  async update(
    id: number,
    data: UserFormData,
  ): Promise<User> {
    await delay();

    const userIndex =
      users.findIndex(
        (item) =>
          item.id === id,
      );

    if (
      userIndex === -1
    ) {
      throw new Error(
        "USER_NOT_FOUND",
      );
    }

    const role =
      mockRoles.find(
        (item) =>
          item.id ===
          data.roleId,
      );

    if (!role) {
      throw new Error(
        "INVALID_ROLE",
      );
    }

    const emailExists =
      users.some(
        (item) =>
          item.id !== id &&
          item.email.toLowerCase() ===
            data.email
              .trim()
              .toLowerCase(),
      );

    if (emailExists) {
      throw new Error(
        "EMAIL_ALREADY_USED",
      );
    }

    const updatedUser:
      User = {
      id,

      firstname:
        data.firstname.trim(),

      lastname:
        data.lastname.trim(),

      firstnameAr:
        data.firstnameAr.trim(),

      lastnameAr:
        data.lastnameAr.trim(),

      email:
        data.email
          .trim()
          .toLowerCase(),

      gender:
        data.gender,

      phone:
        data.phone.trim(),

      cin:
        data.cin
          .trim()
          .toUpperCase(),

      role,
    };

    users[userIndex] =
      updatedUser;

    return {
      ...updatedUser,
    };
  },

  async updateProfile(
    id: number,
    data:
      ProfileUpdateData,
  ): Promise<User> {
    await delay();

    const userIndex =
      users.findIndex(
        (item) =>
          item.id === id,
      );

    if (
      userIndex === -1
    ) {
      throw new Error(
        "USER_NOT_FOUND",
      );
    }

    const currentUser =
      users[userIndex];

    const updatedUser:
      User = {
      ...currentUser,

      firstname:
        data.firstname.trim(),

      lastname:
        data.lastname.trim(),

      firstnameAr:
        data.firstnameAr.trim(),

      lastnameAr:
        data.lastnameAr.trim(),

      phone:
        data.phone.trim(),
    };

    users[userIndex] =
      updatedUser;

    return {
      ...updatedUser,
    };
  },

  async remove(
    id: number,
  ): Promise<void> {
    await delay();

    users =
      users.filter(
        (item) =>
          item.id !== id,
      );
  },
};