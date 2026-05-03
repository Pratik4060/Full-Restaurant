import { http } from "./http";
import type { DietType, MealType, MenuItem } from "../types/api";

export interface CreateMenuItemPayload {
  name: string;
  description: string;
  price: number;
  prepTimeMins: number;
  type: MealType;
  category: string;
  subCategory?: string;
  diet: DietType;
  isBestseller?: boolean;
  isAvailable?: boolean;
  image?: File | null;
}

export type UpdateMenuItemPayload = Partial<CreateMenuItemPayload>;

const buildMenuItemFormData = (
  payload: CreateMenuItemPayload | UpdateMenuItemPayload,
) => {
  const formData = new FormData();

  if (payload.name !== undefined) formData.append("name", payload.name);
  if (payload.description !== undefined)
    formData.append("description", payload.description);
  if (payload.price !== undefined)
    formData.append("price", String(payload.price));
  if (payload.prepTimeMins !== undefined)
    formData.append("prepTimeMins", String(payload.prepTimeMins));
  if (payload.type !== undefined) formData.append("type", payload.type);
  if (payload.category !== undefined)
    formData.append("category", payload.category);
  if (payload.subCategory !== undefined)
    formData.append("subCategory", payload.subCategory);
  if (payload.diet !== undefined) formData.append("diet", payload.diet);
  if (payload.isBestseller !== undefined)
    formData.append("isBestseller", String(payload.isBestseller));
  if (payload.isAvailable !== undefined)
    formData.append("isAvailable", String(payload.isAvailable));
  if ("image" in payload && payload.image)
    formData.append("image", payload.image);

  return formData;
};

export const menuApi = {
  list(filters?: {
    diet?: DietType;
    type?: MealType;
    category?: string;
    subCategory?: string;
  }) {
    const query = new URLSearchParams();
    if (filters?.diet) query.set("diet", filters.diet);
    if (filters?.type) query.set("type", filters.type);
    if (filters?.category) query.set("category", filters.category);
    if (filters?.subCategory) query.set("subCategory", filters.subCategory);
    const qs = query.toString();
    return http<MenuItem[]>(`/menu-items${qs ? `?${qs}` : ""}`);
  },
  create(payload: CreateMenuItemPayload) {
    return http<MenuItem>("/menu-items", {
      method: "POST",
      body: buildMenuItemFormData(payload),
    });
  },
  update(id: string, payload: UpdateMenuItemPayload) {
    return http<MenuItem>(`/menu-items/${id}`, {
      method: "PUT",
      body: buildMenuItemFormData(payload),
    });
  },
  remove(id: string) {
    return http<void>(`/menu-items/${id}`, { method: "DELETE" });
  },
};
