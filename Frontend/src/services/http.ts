import { API_BASE_URL } from "../config/env";
import { tokenStorage } from "../lib/token";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function http<T>(
  path: string,
  options?: { method?: Method; body?: unknown; auth?: boolean }
): Promise<T> {
  const { method = "GET", body, auth = true } = options ?? {};
  const token = tokenStorage.get();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const data = (await res.json()) as T | { message?: string };

  if (!res.ok) {
    const message = (data as { message?: string }).message ?? "Request failed";
    if (res.status === 401 && auth && token) {
      tokenStorage.clear();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("admin-auth-expired"));
      }
    }
    throw new ApiError(message, res.status);
  }

  return data as T;
}
