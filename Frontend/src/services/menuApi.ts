import { http } from "./http";
import type { DietType, MealType, MenuItem } from "../types/api";

export interface CreateMenuItemPayload {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  prepTimeMins: number;
  type: MealType;
  category: string;
  subCategory?: string;
  diet: DietType;
  isBestseller?: boolean;
  isAvailable?: boolean;
}

export type UpdateMenuItemPayload = Partial<CreateMenuItemPayload>;

export const menuApi = {
  list(filters?: { diet?: DietType; type?: MealType; category?: string; subCategory?: string }) {
    const query = new URLSearchParams();
    if (filters?.diet) query.set("diet", filters.diet);
    if (filters?.type) query.set("type", filters.type);
    if (filters?.category) query.set("category", filters.category);
    if (filters?.subCategory) query.set("subCategory", filters.subCategory);
    const qs = query.toString();
    return http<MenuItem[]>(`/menu-items${qs ? `?${qs}` : ""}`);
  },
  create(payload: CreateMenuItemPayload) {
    return http<MenuItem>("/menu-items", { method: "POST", body: payload });
  },
  update(id: string, payload: UpdateMenuItemPayload) {
    return http<MenuItem>(`/menu-items/${id}`, { method: "PUT", body: payload });
  },
  remove(id: string) {
    return http<void>(`/menu-items/${id}`, { method: "DELETE" });
  },
};
