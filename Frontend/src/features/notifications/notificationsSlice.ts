import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface OrderNotification {
  id: string;
  orderNumber: string;
  customerName: string;
  tableNumber: string;
  totalAmount: number;
  createdAt: string;
}

interface NotificationsState {
  orderNotifications: OrderNotification[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  orderNotifications: [],
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addOrderNotification(state, action: PayloadAction<Omit<OrderNotification, "createdAt"> & { createdAt?: string }>) {
      if (state.orderNotifications.some((notification) => notification.id === action.payload.id)) return;

      state.orderNotifications.unshift({
        ...action.payload,
        createdAt: action.payload.createdAt ?? new Date().toISOString(),
      });
      state.orderNotifications = state.orderNotifications.slice(0, 20);
      state.unreadCount += 1;
    },
    markNotificationsRead(state) {
      state.unreadCount = 0;
    },
    clearNotifications(state) {
      state.orderNotifications = [];
      state.unreadCount = 0;
    },
  },
});

export const { addOrderNotification, clearNotifications, markNotificationsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
