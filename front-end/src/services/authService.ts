import api from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export async function loginUser(data: LoginRequest) {
  const response = await api.post(
      "/sgpbse/auth/login",
      {
        email: data.email,
        pwd: data.password,
      }
  );

  return response.data;
}

export async function logoutUser() {
  const response = await api.post("/sgpbse/auth/logout");

  return response.data;
}