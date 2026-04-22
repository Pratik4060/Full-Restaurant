import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "../components/layout/AppLayout";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { CustomersPage } from "../pages/CustomersPage";
import { OrdersPage } from "../pages/OrdersPage";
import { MenuItemsPage } from "../pages/MenuItemsPage";
import { OffersPage } from "../pages/OffersPage";
import { BillingPage } from "../pages/BillingPage";
import { UsersPage } from "../pages/UsersPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="menu-items" element={<MenuItemsPage />} />
        <Route path="offers" element={<OffersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
    </Routes>
  );
}
