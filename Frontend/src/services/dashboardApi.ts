import { http } from "./http";
import type {
  DashboardSummary,
  Offer,
  OrderStatusPoint,
  PopularItemsResponse,
  RevenuePeriod,
  RevenueResponse,
} from "../types/api";

export const dashboardApi = {
  summary: () => http<DashboardSummary>("/dashboard/summary"),
  revenue: (period: RevenuePeriod = "weekly") => http<RevenueResponse>(`/dashboard/revenue?period=${period}`),
  orderStatus: () => http<OrderStatusPoint[]>("/dashboard/order-status"),
  activeOffers: () => http<Offer[]>("/dashboard/active-offers"),
  popularItems: () => http<PopularItemsResponse>("/dashboard/popular-items"),
};
