import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { billingApi } from "../../services/billingApi";
import type {
  BillingSummaryCards,
  PaginationMeta,
  PaymentMethod,
  PendingPaymentRow,
  ProcessedPayment,
  RecentPaymentRow,
  RevenuePeriod,
} from "../../types/api";

interface BillingState {
  summary: BillingSummaryCards | null;
  period: RevenuePeriod;
  pendingRows: PendingPaymentRow[];
  recentRows: RecentPaymentRow[];
  pendingSearch: string;
  recentSearch: string;
  pendingPagination: PaginationMeta;
  recentPagination: PaginationMeta;
  loading: boolean;
  mutating: boolean;
  error: string | null;
  lastProcessedPayment: ProcessedPayment | null;
}

const defaultPagination: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

const initialState: BillingState = {
  summary: null,
  period: "weekly",
  pendingRows: [],
  recentRows: [],
  pendingSearch: "",
  recentSearch: "",
  pendingPagination: defaultPagination,
  recentPagination: defaultPagination,
  loading: false,
  mutating: false,
  error: null,
  lastProcessedPayment: null,
};

export const fetchBillingSummaryThunk = createAsyncThunk(
  "billing/summary",
  async (period: RevenuePeriod, { rejectWithValue }) => {
    try {
      return await billingApi.summary(period);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchPendingPaymentsThunk = createAsyncThunk(
  "billing/pending",
  async (
    params: { period: RevenuePeriod; search?: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      return await billingApi.pendingPayments(params);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchRecentPaymentsThunk = createAsyncThunk(
  "billing/recent",
  async (
    params: { period: RevenuePeriod; search?: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      return await billingApi.recentPayments(params);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const processPaymentThunk = createAsyncThunk(
  "billing/process",
  async (payload: { orderId: string; method: PaymentMethod }, { rejectWithValue }) => {
    try {
      return await billingApi.processPayment(payload);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deletePendingOrderThunk = createAsyncThunk(
  "billing/deletePendingOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      await billingApi.deletePendingOrder(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deletePaymentThunk = createAsyncThunk(
  "billing/deletePayment",
  async (id: string, { rejectWithValue }) => {
    try {
      await billingApi.deletePayment(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    setBillingPeriod(state, action) {
      state.period = action.payload as RevenuePeriod;
      state.pendingPagination.page = 1;
      state.recentPagination.page = 1;
    },
    setPendingSearch(state, action) {
      state.pendingSearch = action.payload as string;
      state.pendingPagination.page = 1;
    },
    setRecentSearch(state, action) {
      state.recentSearch = action.payload as string;
      state.recentPagination.page = 1;
    },
    setPendingPage(state, action) {
      state.pendingPagination.page = action.payload as number;
    },
    setRecentPage(state, action) {
      state.recentPagination.page = action.payload as number;
    },
    clearLastProcessedPayment(state) {
      state.lastProcessedPayment = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchBillingSummaryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillingSummaryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.cards;
        state.period = action.payload.period;
      })
      .addCase(fetchBillingSummaryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to fetch billing summary";
      })
      .addCase(fetchPendingPaymentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingPaymentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRows = action.payload.rows;
        state.pendingPagination = action.payload.pagination;
      })
      .addCase(fetchPendingPaymentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to fetch pending payments";
      })
      .addCase(fetchRecentPaymentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentPaymentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.recentRows = action.payload.rows;
        state.recentPagination = action.payload.pagination;
      })
      .addCase(fetchRecentPaymentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to fetch recent payments";
      })
      .addCase(processPaymentThunk.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(processPaymentThunk.fulfilled, (state, action) => {
        state.mutating = false;
        state.lastProcessedPayment = action.payload;
      })
      .addCase(processPaymentThunk.rejected, (state, action) => {
        state.mutating = false;
        state.error = (action.payload as string) ?? "Failed to process payment";
      })
      .addCase(deletePendingOrderThunk.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(deletePendingOrderThunk.fulfilled, (state, action) => {
        state.mutating = false;
        state.pendingRows = state.pendingRows.filter((row) => row.id !== action.payload);
      })
      .addCase(deletePendingOrderThunk.rejected, (state, action) => {
        state.mutating = false;
        state.error = (action.payload as string) ?? "Failed to delete pending order";
      })
      .addCase(deletePaymentThunk.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(deletePaymentThunk.fulfilled, (state, action) => {
        state.mutating = false;
        state.recentRows = state.recentRows.filter((row) => row.id !== action.payload);
      })
      .addCase(deletePaymentThunk.rejected, (state, action) => {
        state.mutating = false;
        state.error = (action.payload as string) ?? "Failed to delete payment";
      });
  },
});

export const {
  clearLastProcessedPayment,
  setBillingPeriod,
  setPendingPage,
  setPendingSearch,
  setRecentPage,
  setRecentSearch,
} = billingSlice.actions;
export default billingSlice.reducer;
