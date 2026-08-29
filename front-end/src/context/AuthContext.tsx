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

import { mockAuthUsers } from "../mock/auth";

import type { Permission } from "../constants/permissions";



export const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType,
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (
    credentials: LoginRequest,
  ) => {
    const foundUser = mockAuthUsers.find(
      (user) =>
        user.email === credentials.email &&
        user.password ===
          credentials.password,
    );

    if (!foundUser) {
      return false;
    }

    const authenticatedUser: AuthUser = {
      id: foundUser.id,
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      email: foundUser.email,
      role: foundUser.role,
    };

    localStorage.setItem(
      "user",
      JSON.stringify(authenticatedUser),
    );

    setUser(authenticatedUser);

    return true;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const hasPermission = (
    permission: Permission,
  ) => {
    if (!user) {
      return false;
    }

    return user.role.permissions.includes(
      permission,
    );
  };

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