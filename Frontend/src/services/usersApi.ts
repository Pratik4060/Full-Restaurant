import { http } from "./http";
import type {
  UserRole,
  UserRow,
  UserSummaryResponse,
  UsersTableResponse,
} from "../types/api";

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

export const usersApi = {
  summary() {
    return http<UserSummaryResponse>("/users/summary");
  },
  list(params?: { search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return http<UsersTableResponse>(`/users${qs ? `?${qs}` : ""}`);
  },
  create(payload: CreateUserPayload) {
    return http<UserRow>("/users", { method: "POST", body: payload });
  },
  update(id: string, payload: UpdateUserPayload) {
    return http<UserRow>(`/users/${id}`, { method: "PATCH", body: payload });
  },
  updateStatus(id: string, isActive: boolean) {
    return http<UserRow>(`/users/${id}/status`, { method: "PATCH", body: { isActive } });
  },
  deleteOne(id: string) {
    return http<{ deleted: true }>(`/users/${id}`, { method: "DELETE" });
  },
};
