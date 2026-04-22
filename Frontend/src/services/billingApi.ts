import { http } from "./http";
import type {
  BillingSummaryResponse,
  PaymentMethod,
  PendingPaymentsResponse,
  ProcessedPayment,
  RecentPaymentsResponse,
  RevenuePeriod,
} from "../types/api";

const withQuery = (path: string, params: { period: RevenuePeriod; search?: string; page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  query.set("period", params.period);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  return `${path}?${query.toString()}`;
};

export const billingApi = {
  summary(period: RevenuePeriod) {
    return http<BillingSummaryResponse>(`/billing/summary?period=${period}`);
  },
  pendingPayments(params: { period: RevenuePeriod; search?: string; page?: number; limit?: number }) {
    return http<PendingPaymentsResponse>(withQuery("/billing/pending-payments", params));
  },
  recentPayments(params: { period: RevenuePeriod; search?: string; page?: number; limit?: number }) {
    return http<RecentPaymentsResponse>(withQuery("/billing/recent-payments", params));
  },
  processPayment(payload: { orderId: string; method: PaymentMethod }) {
    return http<ProcessedPayment>("/billing/payments", { method: "POST", body: payload });
  },
  deletePendingOrder(id: string) {
    return http<{ deleted: true }>(`/billing/orders/${id}`, { method: "DELETE" });
  },
  deletePayment(id: string) {
    return http<{ deleted: true }>(`/billing/payments/${id}`, { method: "DELETE" });
  },
};
