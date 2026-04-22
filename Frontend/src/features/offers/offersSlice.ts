import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { offersApi, type CreateOfferPayload } from "../../services/offerApi";
import type { Offer } from "../../types/api";

interface OffersState {
  list: Offer[];
  search: string;
  loading: boolean;
  error: string | null;
}

const initialState: OffersState = {
  list: [],
  search: "",
  loading: false,
  error: null,
};

export const fetchOffersThunk = createAsyncThunk("offers/fetch", async (_, { rejectWithValue }) => {
  try {
    return await offersApi.list();
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const createOfferThunk = createAsyncThunk(
  "offers/create",
  async (payload: CreateOfferPayload, { rejectWithValue }) => {
    try {
      return await offersApi.create(payload);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const toggleOfferThunk = createAsyncThunk(
  "offers/toggle",
  async (payload: { id: string; isActive: boolean }, { rejectWithValue }) => {
    try {
      return await offersApi.update(payload.id, { isActive: payload.isActive });
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const offersSlice = createSlice({
  name: "offers",
  initialState,
  reducers: {
    setOfferSearch(state, action) {
      state.search = action.payload as string;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchOffersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchOffersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to fetch offers";
      })
      .addCase(createOfferThunk.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(toggleOfferThunk.fulfilled, (state, action) => {
        const idx = state.list.findIndex((x) => x.id === action.payload.id);
        if (idx >= 0) state.list[idx] = { ...state.list[idx], ...action.payload };
      });
  },
});

export const { setOfferSearch } = offersSlice.actions;
export default offersSlice.reducer;
