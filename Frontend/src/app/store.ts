import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import billingReducer from "../features/billing/billingSlice";
import customersReducer from "../features/customers/customersSlice";
import menuReducer from "../features/menu/menuSlice";
import offersReducer from "../features/offers/offersSlice";
import ordersReducer from "../features/orders/ordersSlice";
import usersReducer from "../features/users/usersSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    customers: customersReducer,
    billing: billingReducer,
    users: usersReducer,
    orders: ordersReducer,
    menu: menuReducer,
    offers: offersReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
