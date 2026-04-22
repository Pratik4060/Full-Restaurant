import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ordersApi, type CreateOrderPayload } from "../../services/ordersApi";
import type { Order, OrderStatus } from "../../types/api";

interface OrdersState {
  list: Order[];
  search: string;
  statusFilter: "ALL" | OrderStatus;
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  list: [],
  search: "",
  statusFilter: "ALL",
  loading: false,
  error: null,
};

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
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to fetch orders";
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        const idx = state.list.findIndex((o) => o.id === action.payload.id);
        if (idx >= 0) state.list[idx] = { ...state.list[idx], ...action.payload };
      });
  },
});

export const { setOrdersSearch, setOrdersStatusFilter } = ordersSlice.actions;
export default ordersSlice.reducer;
