import { http } from "./http";
import type { LoginResponse } from "../types/api";

export const authApi = {
  login(payload: { email: string; password: string }) {
    return http<LoginResponse>("/auth/login", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },
};
