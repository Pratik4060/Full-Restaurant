import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { offersApi, type CreateOfferPayload, type UpdateOfferPayload } from "../../services/offerApi";
import type { Offer } from "../../types/api";

interface OffersState {
  list: Offer[];
  search: string;
  loading: boolean;
  mutating: boolean;
  error: string | null;
}

const initialState: OffersState = {
  list: [],
  search: "",
  loading: false,
  mutating: false,
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

export const updateOfferThunk = createAsyncThunk(
  "offers/update",
  async (payload: { id: string; data: UpdateOfferPayload }, { rejectWithValue }) => {
    try {
      return await offersApi.update(payload.id, payload.data);
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

export const deleteOfferThunk = createAsyncThunk(
  "offers/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await offersApi.remove(id);
      return id;
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
      .addCase(createOfferThunk.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(createOfferThunk.fulfilled, (state, action) => {
        state.mutating = false;
        state.list.unshift(action.payload);
      })
      .addCase(createOfferThunk.rejected, (state, action) => {
        state.mutating = false;
        state.error = (action.payload as string) ?? "Failed to create offer";
      })
      .addCase(toggleOfferThunk.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(toggleOfferThunk.fulfilled, (state, action) => {
        state.mutating = false;
        const idx = state.list.findIndex((x) => x.id === action.payload.id);
        if (idx >= 0) state.list[idx] = { ...state.list[idx], ...action.payload };
      })
      .addCase(toggleOfferThunk.rejected, (state, action) => {
        state.mutating = false;
        state.error = (action.payload as string) ?? "Failed to update offer";
      })
      .addCase(updateOfferThunk.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(updateOfferThunk.fulfilled, (state, action) => {
        state.mutating = false;
        const idx = state.list.findIndex((x) => x.id === action.payload.id);
        if (idx >= 0) state.list[idx] = { ...state.list[idx], ...action.payload };
      })
      .addCase(updateOfferThunk.rejected, (state, action) => {
        state.mutating = false;
        state.error = (action.payload as string) ?? "Failed to update offer";
      })
      .addCase(deleteOfferThunk.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(deleteOfferThunk.fulfilled, (state, action) => {
        state.mutating = false;
        state.list = state.list.filter((offer) => offer.id !== action.payload);
      })
      .addCase(deleteOfferThunk.rejected, (state, action) => {
        state.mutating = false;
        state.error = (action.payload as string) ?? "Failed to delete offer";
      });
  },
});

export const { setOfferSearch } = offersSlice.actions;
export default offersSlice.reducer;
