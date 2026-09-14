import api from "./api";

import type {
  CurrentUserResponse,
  LoginRequest,
} from "../types/auth";

export async function loginUser(
  data: LoginRequest,
) {
  const response = await api.post(
    "/sgpbse/auth/login",
    {
      email: data.email
        .trim()
        .toLowerCase(),
      pwd: data.password,
    },
  );

  return response.data;
}

export async function getCurrentUser() {
  const response =
    await api.get<CurrentUserResponse>(
      "/sgpbse/user/me",
    );

  return response.data;
}

export async function logoutUser() {
  const response = await api.post(
    "/sgpbse/auth/logout",
  );

  return response.data;
}

export async function forgotPassword(
  email: string,
) {
  const response = await api.post(
    "/sgpbse/auth/forgot_password",
    {
      email,
    },
  );

  return response.data;
}

export async function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string,
) {
  const response = await api.post(
    "/sgpbse/auth/reset_password",
    {
      token,
      newPassword,
      confirmPassword,
    },
  );

  return response.data;
}