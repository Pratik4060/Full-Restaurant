import { API_BASE_URL } from "../config/env";
import { tokenStorage } from "../lib/token";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

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
    throw new Error(message);
  }

  return data as T;
}
