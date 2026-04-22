import { http } from "./http";
import type { Order, OrderStatus } from "../types/api";

export interface CreateOrderPayload {
  customerName: string;
  tableNumber: string;
  guestCount?: number;
  customerPhone?: string;
  items: Array<{ menuItemId: string; quantity: number }>;
}

export const ordersApi = {
  list(filters?: { status?: OrderStatus; search?: string }) {
    const query = new URLSearchParams();
    if (filters?.status) query.set("status", filters.status);
    if (filters?.search) query.set("search", filters.search);
    const qs = query.toString();
    return http<Order[]>(`/orders${qs ? `?${qs}` : ""}`);
  },
  create(payload: CreateOrderPayload) {
    return http<Order>("/orders", { method: "POST", body: payload });
  },
  updateStatus(id: string, status: OrderStatus) {
    return http<Order>(`/orders/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },
};
