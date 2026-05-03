import { useEffect, useRef } from "react";
import { BrowserRouter } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { logout } from "./features/auth/authSlice";
import { fetchBillingSummaryThunk, fetchPendingPaymentsThunk, fetchRecentPaymentsThunk } from "./features/billing/billingSlice";
import { fetchCustomersSummaryThunk, fetchCustomersTableThunk } from "./features/customers/customersSlice";
import { fetchDashboardThunk } from "./features/dashboard/dashboardSlice";
import { fetchMenuItemsThunk } from "./features/menu/menuSlice";
import { fetchOffersThunk } from "./features/offers/offersSlice";
import { fetchOrdersThunk } from "./features/orders/ordersSlice";
import { addOrderNotification } from "./features/notifications/notificationsSlice";
import { API_BASE_URL } from "./config/env";
import { AppRouter } from "./routes/AppRouter";

type RealtimeEntity =
  | "menu-items"
  | "offers"
  | "orders"
  | "customers"
  | "billing"
  | "dashboard";

type OrderCreatedPayload = {
  timestamp?: string;
  order?: {
    id: string;
    orderNumber: string;
    customerName: string;
    tableNumber: string;
    totalAmount: number;
  };
};

function AuthSessionListener() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleExpiredSession = () => {
      dispatch(logout());
      navigate("/login", { replace: true });
    };

    window.addEventListener("admin-auth-expired", handleExpiredSession);
    return () => window.removeEventListener("admin-auth-expired", handleExpiredSession);
  }, [dispatch, navigate]);

  return null;
}

function RealtimeSyncListener() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const revenuePeriod = useAppSelector((state) => state.dashboard.revenuePeriod);
  const customersState = useAppSelector((state) => state.customers);
  const billingState = useAppSelector((state) => state.billing);
  const ordersState = useAppSelector((state) => state.orders);
  const queuedEntitiesRef = useRef<Set<RealtimeEntity>>(new Set());
  const flushTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof EventSource === "undefined") return;

    const flush = () => {
      flushTimerRef.current = null;
      const entities = new Set(queuedEntitiesRef.current);
      queuedEntitiesRef.current.clear();

      if (entities.size === 0) return;

      const affectsDashboard =
        entities.has("dashboard") ||
        entities.has("menu-items") ||
        entities.has("offers") ||
        entities.has("orders") ||
        entities.has("customers") ||
        entities.has("billing");

      if (location.pathname.startsWith("/dashboard") && affectsDashboard) {
        void dispatch(fetchDashboardThunk(revenuePeriod));
      }

      if (location.pathname.startsWith("/menu-items") && entities.has("menu-items")) {
        void dispatch(fetchMenuItemsThunk(undefined));
      }

      if (location.pathname.startsWith("/offers") && entities.has("offers")) {
        void dispatch(fetchOffersThunk());
      }

      if (
        location.pathname.startsWith("/orders") &&
        (entities.has("orders") || entities.has("billing"))
      ) {
        void dispatch(
          fetchOrdersThunk({
            ...(ordersState.statusFilter !== "ALL" ? { status: ordersState.statusFilter } : {}),
            ...(ordersState.search ? { search: ordersState.search } : {}),
          })
        );
      }

      if (
        location.pathname.startsWith("/customers") &&
        (entities.has("customers") || entities.has("orders") || entities.has("billing"))
      ) {
        void dispatch(fetchCustomersSummaryThunk(customersState.period));
        void dispatch(
          fetchCustomersTableThunk({
            period: customersState.period,
            ...(customersState.search ? { search: customersState.search } : {}),
            page: customersState.pagination.page,
            limit: customersState.pagination.limit,
          })
        );
      }

      if (
        location.pathname.startsWith("/billing") &&
        (entities.has("billing") || entities.has("orders") || entities.has("customers"))
      ) {
        void dispatch(fetchBillingSummaryThunk(billingState.period));
        void dispatch(
          fetchPendingPaymentsThunk({
            period: billingState.period,
            ...(billingState.pendingSearch ? { search: billingState.pendingSearch } : {}),
            page: billingState.pendingPagination.page,
            limit: billingState.pendingPagination.limit,
          })
        );
        void dispatch(
          fetchRecentPaymentsThunk({
            period: billingState.period,
            ...(billingState.recentSearch ? { search: billingState.recentSearch } : {}),
            page: billingState.recentPagination.page,
            limit: billingState.recentPagination.limit,
          })
        );
      }
    };

    const queueFlush = () => {
      if (flushTimerRef.current !== null) return;
      flushTimerRef.current = window.setTimeout(flush, 250);
    };

    const eventSource = new EventSource(`${API_BASE_URL}/events`);

    eventSource.addEventListener("invalidate", (event) => {
      const payload = JSON.parse((event as MessageEvent<string>).data) as { entities?: RealtimeEntity[] };
      (payload.entities ?? []).forEach((entity) => queuedEntitiesRef.current.add(entity));
      queueFlush();
    });

    eventSource.addEventListener("order-created", (event) => {
      const payload = JSON.parse((event as MessageEvent<string>).data) as OrderCreatedPayload;
      if (!payload.order) return;

      dispatch(
        addOrderNotification({
          ...payload.order,
          createdAt: payload.timestamp,
        })
      );
    });

    return () => {
      eventSource.close();
      if (flushTimerRef.current !== null) {
        window.clearTimeout(flushTimerRef.current);
      }
    };
  }, [
    billingState.pendingPagination.limit,
    billingState.pendingPagination.page,
    billingState.pendingSearch,
    billingState.period,
    billingState.recentPagination.limit,
    billingState.recentPagination.page,
    billingState.recentSearch,
    customersState.pagination.limit,
    customersState.pagination.page,
    customersState.period,
    customersState.search,
    dispatch,
    location.pathname,
    ordersState.search,
    ordersState.statusFilter,
    revenuePeriod,
  ]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthSessionListener />
      <RealtimeSyncListener />
      <AppRouter />
    </BrowserRouter>
  );
}
