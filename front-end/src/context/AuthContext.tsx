import {
  createContext,
  useEffect,
  useState,
} from "react";

import type {
  AuthContextType,
  AuthUser,
  CurrentUserResponse,
  LoginRequest,
} from "../types/auth";

import type {
  Permission,
} from "../constants/permissions";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
} from "../services/authService";



const USER_STORAGE_KEY =
  "user";

export const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType,
  );

function splitFullName(
  fullName: string | null,
  email: string,
) {
  const normalized =
    fullName?.trim() ?? "";

  if (
    normalized === "" ||
    normalized.toLowerCase() ===
      "null null"
  ) {
    return {
      firstName:
        email.split("@")[0],
      lastName: "",
    };
  }

  const parts =
    normalized
      .split(/\s+/)
      .filter(Boolean);

  return {
    firstName:
      parts[0] ?? "",
    lastName:
      parts.slice(1).join(" "),
  };
}

function mapCurrentUser(
  profile: CurrentUserResponse,
): AuthUser {
  const names =
    splitFullName(
      profile.fullname_fr,
      profile.email,
    );

  return {
    id: profile.id,
    firstName:
      names.firstName,
    lastName:
      names.lastName,
    email:
      profile.email,
    role: {
      id:
        profile.role.id,
      name:
        profile.role.name,
      permissions:
        profile.role.permissions.map(
          (permission) =>
            permission.name,
        ),
    },
  };
}

function getStoredUser():
  | AuthUser
  | null {
  const raw =
    localStorage.getItem(
      USER_STORAGE_KEY,
    );

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(
      raw,
    ) as AuthUser;
  } catch {
    localStorage.removeItem(
      USER_STORAGE_KEY,
    );

    return null;
  }
}

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
      getStoredUser,
    );

  useEffect(() => {
    let active = true;

    const restoreSession =
      async () => {
        try {
          const profile =
            await getCurrentUser();

          if (!active) {
            return;
          }

          const authenticatedUser =
            mapCurrentUser(
              profile,
            );

          localStorage.setItem(
            USER_STORAGE_KEY,
            JSON.stringify(
              authenticatedUser,
            ),
          );

          setUser(
            authenticatedUser,
          );
        } catch {
          if (!active) {
            return;
          }

          localStorage.removeItem(
            USER_STORAGE_KEY,
          );

          setUser(null);
        }
      };

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const login = async (
    credentials: LoginRequest,
  ) => {
    try {
      await loginUser(
        credentials,
      );

      const profile =
        await getCurrentUser();

      const authenticatedUser =
        mapCurrentUser(
          profile,
        );

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
    } catch {
      localStorage.removeItem(
        USER_STORAGE_KEY,
      );

      setUser(null);

      return false;
    }
  };

  useEffect(() => {
    const refreshProfile = async () => {
      try {
        const profile = await getCurrentUser();
        const authenticatedUser = mapCurrentUser(profile);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authenticatedUser));
        setUser(authenticatedUser);
      } catch {
        // Keep the current session state; the normal auth flow handles logout.
      }
    };

    const handler = () => {
      void refreshProfile();
    };

    window.addEventListener("profile-updated", handler);
    return () => window.removeEventListener("profile-updated", handler);
  }, []);

  const logout = () => {
    localStorage.removeItem(
      USER_STORAGE_KEY,
    );

    setUser(null);

    void logoutUser().catch(
      () => undefined,
    );
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