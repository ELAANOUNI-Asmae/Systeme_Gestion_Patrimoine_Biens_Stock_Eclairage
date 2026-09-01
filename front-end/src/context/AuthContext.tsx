import {
  createContext,
  useEffect,
  useState,
} from "react";

import type {
  AuthContextType,
  AuthUser,
  LoginRequest,
} from "../types/auth";

import {
  mockAuthUsers,
} from "../mock/auth";

import type {
  Permission,
} from "../constants/permissions";

const USER_STORAGE_KEY =
  "user";

export const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType,
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    user,
    setUser,
  ] =
    useState<AuthUser | null>(
      null,
    );

  useEffect(() => {
    const storedUser =
      localStorage.getItem(
        USER_STORAGE_KEY,
      );

    if (!storedUser) {
      return;
    }

    try {
      setUser(
        JSON.parse(
          storedUser,
        ) as AuthUser,
      );
    } catch {
      localStorage.removeItem(
        USER_STORAGE_KEY,
      );
    }
  }, []);

  const login = async (
    credentials: LoginRequest,
  ) => {
    const email =
      credentials.email
        .trim()
        .toLowerCase();

    const foundUser =
      mockAuthUsers.find(
        (item) =>
          item.email.toLowerCase() ===
            email &&
          item.password ===
            credentials.password,
      );

    if (!foundUser) {
      return false;
    }

    const authenticatedUser: AuthUser =
      {
        id: foundUser.id,
        firstName:
          foundUser.firstName,
        lastName:
          foundUser.lastName,
        email:
          foundUser.email,
        role: foundUser.role,
      };

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(
        authenticatedUser,
      ),
    );

    setUser(
      authenticatedUser,
    );

    return true;
  };

  const logout = () => {
    localStorage.removeItem(
      USER_STORAGE_KEY,
    );

    setUser(null);
  };

  const hasPermission = (
    permission: Permission,
  ) =>
    Boolean(
      user?.role.permissions.includes(
        permission,
      ),
    );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated:
          user !== null,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
