import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { dashboardApi } from "../../services/dashboardApi";
import type {
  DashboardSummary,
  Offer,
  OrderStatusPoint,
  PopularItemsResponse,
  RevenuePeriod,
  RevenueResponse,
} from "../../types/api";

interface DashboardState {
  summary: DashboardSummary | null;
  revenue: RevenueResponse | null;
  revenuePeriod: RevenuePeriod;
  orderStatus: OrderStatusPoint[];
  activeOffers: Offer[];
  popularItems: PopularItemsResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  revenue: null,
  revenuePeriod: "weekly",
  orderStatus: [],
  activeOffers: [],
  popularItems: null,
  loading: false,
  error: null,
};

export const fetchDashboardThunk = createAsyncThunk(
  "dashboard/fetch",
  async (period: RevenuePeriod = "weekly", { rejectWithValue }) => {
  try {
    const [summary, revenue, orderStatus, activeOffers, popularItems] = await Promise.all([
      dashboardApi.summary(),
      dashboardApi.revenue(period),
      dashboardApi.orderStatus(),
      dashboardApi.activeOffers(),
      dashboardApi.popularItems(),
    ]);
    return { summary, revenue, orderStatus, activeOffers, popularItems, period };
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setRevenuePeriod(state, action) {
      state.revenuePeriod = action.payload as RevenuePeriod;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchDashboardThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
        state.revenue = action.payload.revenue;
        state.revenuePeriod = action.payload.period;
        state.orderStatus = action.payload.orderStatus;
        state.activeOffers = action.payload.activeOffers;
        state.popularItems = action.payload.popularItems;
      })
      .addCase(fetchDashboardThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to fetch dashboard";
      });
  },
});

export const { setRevenuePeriod } = dashboardSlice.actions;
export default dashboardSlice.reducer;
