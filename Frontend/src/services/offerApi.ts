import { http } from "./http";
import type { Offer } from "../types/api";

export interface CreateOfferPayload {
  title: string;
  description: string;
  discountText: string;
  imageUrl?: string;
  isActive?: boolean;
  validUntil?: string;
}

export type UpdateOfferPayload = Partial<CreateOfferPayload>;

export const offersApi = {
  list() {
    return http<Offer[]>("/offers");
  },
  create(payload: CreateOfferPayload) {
    return http<Offer>("/offers", { method: "POST", body: payload });
  },
  update(id: string, payload: UpdateOfferPayload) {
    return http<Offer>(`/offers/${id}`, { method: "PUT", body: payload });
  },
  remove(id: string) {
    return http<void>(`/offers/${id}`, { method: "DELETE" });
  },
};
