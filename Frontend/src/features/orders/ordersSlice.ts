import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ordersApi, type CreateOrderPayload } from "../../services/ordersApi";
import { readCachedJson, writeCachedJson } from "../../lib/sliceCache";
import type { Order, OrderStatus } from "../../types/api";

interface OrdersState {
  list: Order[];
  search: string;
  statusFilter: "ALL" | OrderStatus;
  loading: boolean;
  error: string | null;
  optimisticStatusById: Record<string, OrderStatus>;
}

const ORDERS_CACHE_KEY = "admin-orders-cache";

const initialState: OrdersState = readCachedJson<OrdersState>(ORDERS_CACHE_KEY, {
  list: [],
  search: "",
  statusFilter: "ALL",
  loading: false,
  error: null,
  optimisticStatusById: {},
});

export const fetchOrdersThunk = createAsyncThunk(
  "orders/fetch",
  async (payload: { status?: OrderStatus; search?: string } | undefined, { rejectWithValue }) => {
    try {
      return await ordersApi.list(payload);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createOrderThunk = createAsyncThunk(
  "orders/create",
  async (payload: CreateOrderPayload, { rejectWithValue }) => {
    try {
      return await ordersApi.create(payload);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateOrderStatusThunk = createAsyncThunk(
  "orders/status",
  async (payload: { id: string; status: OrderStatus }, { rejectWithValue }) => {
    try {
      return await ordersApi.updateStatus(payload.id, payload.status);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrdersSearch(state, action) {
      state.search = action.payload as string;
    },
    setOrdersStatusFilter(state, action) {
      state.statusFilter = action.payload as "ALL" | OrderStatus;
    },
    optimisticSetOrderStatus(state, action) {
      const { id, status } = action.payload as { id: string; status: OrderStatus };
      const current = state.list.find((o) => o.id === id);
      if (!current) return;

      state.optimisticStatusById[id] = current.status;
      current.status = status;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchOrdersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        writeCachedJson(ORDERS_CACHE_KEY, state);
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to fetch orders";
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        writeCachedJson(ORDERS_CACHE_KEY, state);
      })
      .addCase(updateOrderStatusThunk.pending, (state, action) => {
        const { id, status } = action.meta.arg;
        const current = state.list.find((o) => o.id === id);
        if (!current) return;

        state.optimisticStatusById[id] = current.status;
        current.status = status;
      })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        const idx = state.list.findIndex((o) => o.id === action.payload.id);
        if (idx >= 0) {
          const current = state.list[idx];
          state.list[idx] = {
            ...current,
            ...action.payload,
            items: action.payload.items?.length ? action.payload.items : current.items,
          };
        }
        delete state.optimisticStatusById[action.payload.id];
        writeCachedJson(ORDERS_CACHE_KEY, state);
      })
      .addCase(updateOrderStatusThunk.rejected, (state, action) => {
        const { id } = action.meta.arg;
        const previousStatus = state.optimisticStatusById[id];
        if (previousStatus) {
          const current = state.list.find((o) => o.id === id);
          if (current) {
            current.status = previousStatus;
          }
          delete state.optimisticStatusById[id];
          writeCachedJson(ORDERS_CACHE_KEY, state);
        }
      });
  },
});

export const { setOrdersSearch, setOrdersStatusFilter, optimisticSetOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;
