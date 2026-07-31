import { mockRoles, mockUsers } from "../mock/users";
import type { User, UserFormData } from "../types/user";

let users: User[] = [...mockUsers];

const delay = (milliseconds = 250) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const userService = {
  async getAll(): Promise<User[]> {
    await delay();
    return [...users];
  },

  async getById(id: number): Promise<User> {
    await delay();

    const user = users.find((item) => item.id === id);

    if (!user) {
      throw new Error("Utilisateur introuvable.");
    }

    return { ...user };
  },

  async create(data: UserFormData): Promise<User> {
    await delay();

    const role = mockRoles.find((item) => item.id === data.roleId);

    if (!role) {
      throw new Error("Rôle invalide.");
    }

    const emailExists = users.some(
      (item) => item.email.toLowerCase() === data.email.toLowerCase(),
    );

    if (emailExists) {
      throw new Error("Cette adresse e-mail est déjà utilisée.");
    }

    const newUser: User = {
      id: Math.max(0, ...users.map((item) => item.id)) + 1,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      gender: data.gender,
      phone: data.phone,
      cin: data.cin.toUpperCase(),
      role,
    };

    users = [newUser, ...users];

    return newUser;
  },

  async update(id: number, data: UserFormData): Promise<User> {
    await delay();

    const userIndex = users.findIndex((item) => item.id === id);

    if (userIndex === -1) {
      throw new Error("Utilisateur introuvable.");
    }

    const role = mockRoles.find((item) => item.id === data.roleId);

    if (!role) {
      throw new Error("Rôle invalide.");
    }

    const emailExists = users.some(
      (item) =>
        item.id !== id &&
        item.email.toLowerCase() === data.email.toLowerCase(),
    );

    if (emailExists) {
      throw new Error("Cette adresse e-mail est déjà utilisée.");
    }

    const updatedUser: User = {
      id,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      gender: data.gender,
      phone: data.phone,
      cin: data.cin.toUpperCase(),
      role,
    };

    users[userIndex] = updatedUser;

    return updatedUser;
  },

  async remove(id: number): Promise<void> {
    await delay();
    users = users.filter((item) => item.id !== id);
  },
};