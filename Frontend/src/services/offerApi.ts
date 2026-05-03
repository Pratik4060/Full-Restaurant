import { http } from "./http";
import type { Offer } from "../types/api";

export interface CreateOfferPayload {
  title: string;
  description: string;
  discountText: string;
  isActive?: boolean;
  validFrom?: string;
  validUntil?: string;
  image?: File | null;
}

export type UpdateOfferPayload = Partial<CreateOfferPayload>;

const buildOfferFormData = (
  payload: CreateOfferPayload | UpdateOfferPayload,
) => {
  const formData = new FormData();

  if (payload.title !== undefined) formData.append("title", payload.title);
  if (payload.description !== undefined)
    formData.append("description", payload.description);
  if (payload.discountText !== undefined)
    formData.append("discountText", payload.discountText);
  if (payload.isActive !== undefined)
    formData.append("isActive", String(payload.isActive));
  if (payload.validFrom !== undefined)
    formData.append("validFrom", payload.validFrom);
  if (payload.validUntil !== undefined)
    formData.append("validUntil", payload.validUntil);
  if ("image" in payload && payload.image)
    formData.append("image", payload.image);

  return formData;
};

export const offersApi = {
  list() {
    return http<Offer[]>("/offers");
  },
  create(payload: CreateOfferPayload) {
    return http<Offer>("/offers", {
      method: "POST",
      body: buildOfferFormData(payload),
    });
  },
  update(id: string, payload: UpdateOfferPayload) {
    return http<Offer>(`/offers/${id}`, {
      method: "PUT",
      body: buildOfferFormData(payload),
    });
  },
  remove(id: string) {
    return http<void>(`/offers/${id}`, { method: "DELETE" });
  },
};
