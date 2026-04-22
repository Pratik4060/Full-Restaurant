import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { customersApi } from "../../services/customersApi";
import type { CustomerSummaryCards, CustomerTableRow, PaginationMeta, RevenuePeriod } from "../../types/api";

interface CustomersState {
  summary: CustomerSummaryCards | null;
  rows: CustomerTableRow[];
  pagination: PaginationMeta;
  period: RevenuePeriod;
  search: string;
  loading: boolean;
  deleting: boolean;
  error: string | null;
}

const initialState: CustomersState = {
  summary: null,
  rows: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  period: "weekly",
  search: "",
  loading: false,
  deleting: false,
  error: null,
};

export const fetchCustomersSummaryThunk = createAsyncThunk(
  "customers/summary",
  async (period: RevenuePeriod, { rejectWithValue }) => {
    try {
      return await customersApi.summary(period);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchCustomersTableThunk = createAsyncThunk(
  "customers/table",
  async (
    params: { period: RevenuePeriod; search?: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      return await customersApi.list(params);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteCustomerThunk = createAsyncThunk(
  "customers/deleteOne",
  async (id: string, { rejectWithValue }) => {
    try {
      await customersApi.deleteOne(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteCustomersThunk = createAsyncThunk(
  "customers/deleteMany",
  async (ids: string[], { rejectWithValue }) => {
    try {
      await customersApi.deleteMany(ids);
      return ids;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setCustomersPeriod(state, action) {
      state.period = action.payload as RevenuePeriod;
      state.pagination.page = 1;
    },
    setCustomersSearch(state, action) {
      state.search = action.payload as string;
      state.pagination.page = 1;
    },
    setCustomersPage(state, action) {
      state.pagination.page = action.payload as number;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCustomersSummaryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomersSummaryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.cards;
        state.period = action.payload.period;
      })
      .addCase(fetchCustomersSummaryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to fetch customer summary";
      })
      .addCase(fetchCustomersTableThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomersTableThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCustomersTableThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to fetch customers";
      })
      .addCase(deleteCustomerThunk.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteCustomerThunk.fulfilled, (state, action) => {
        state.deleting = false;
        state.rows = state.rows.filter((row) => row.id !== action.payload);
      })
      .addCase(deleteCustomerThunk.rejected, (state, action) => {
        state.deleting = false;
        state.error = (action.payload as string) ?? "Failed to delete customer";
      })
      .addCase(deleteCustomersThunk.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteCustomersThunk.fulfilled, (state, action) => {
        state.deleting = false;
        state.rows = state.rows.filter((row) => !action.payload.includes(row.id));
      })
      .addCase(deleteCustomersThunk.rejected, (state, action) => {
        state.deleting = false;
        state.error = (action.payload as string) ?? "Failed to delete customers";
      });
  },
});

export const { setCustomersPage, setCustomersPeriod, setCustomersSearch } = customersSlice.actions;
export default customersSlice.reducer;
