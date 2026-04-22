import { http } from "./http";
import type {
  CustomerSummaryResponse,
  CustomerTableResponse,
  RevenuePeriod,
} from "../types/api";

export const customersApi = {
  summary(period: RevenuePeriod) {
    return http<CustomerSummaryResponse>(`/customers/summary?period=${period}`);
  },
  list(params: { period: RevenuePeriod; search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    query.set("period", params.period);
    if (params.search) query.set("search", params.search);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    return http<CustomerTableResponse>(`/customers?${query.toString()}`);
  },
  deleteOne(id: string) {
    return http<{ deleted: true }>(`/customers/${id}`, { method: "DELETE" });
  },
  deleteMany(ids: string[]) {
    return http<{ deletedCount: number }>("/customers", {
      method: "DELETE",
      body: { ids },
    });
  },
};
