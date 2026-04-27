import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { menuApi, type CreateMenuItemPayload, type UpdateMenuItemPayload } from "../../services/menuApi";
import type { DietType, MealType, MenuItem } from "../../types/api";

interface MenuState {
  list: MenuItem[];
  search: string;
  dietFilter: "ALL" | DietType;
  mealTypeFilter: "ALL" | MealType;
  categoryFilter: "ALL" | string;
  loading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  list: [],
  search: "",
  dietFilter: "ALL",
  mealTypeFilter: "ALL",
  categoryFilter: "ALL",
  loading: false,
  error: null,
};

export const fetchMenuItemsThunk = createAsyncThunk(
  "menu/fetch",
  async (filters: { diet?: DietType; type?: MealType; category?: string } | undefined, { rejectWithValue }) => {
    try {
      return await menuApi.list(filters);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createMenuItemThunk = createAsyncThunk(
  "menu/create",
  async (payload: CreateMenuItemPayload, { rejectWithValue }) => {
    try {
      return await menuApi.create(payload);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const toggleMenuAvailabilityThunk = createAsyncThunk(
  "menu/toggle",
  async (payload: { id: string; isAvailable: boolean }, { rejectWithValue }) => {
    try {
      return await menuApi.update(payload.id, { isAvailable: payload.isAvailable });
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateMenuItemThunk = createAsyncThunk(
  "menu/update",
  async (payload: { id: string; data: UpdateMenuItemPayload }, { rejectWithValue }) => {
    try {
      return await menuApi.update(payload.id, payload.data);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteMenuItemThunk = createAsyncThunk(
  "menu/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await menuApi.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setMenuSearch(state, action) {
      state.search = action.payload as string;
    },
    setDietFilter(state, action) {
      state.dietFilter = action.payload as "ALL" | DietType;
    },
    setMealTypeFilter(state, action) {
      state.mealTypeFilter = action.payload as "ALL" | MealType;
    },
    setCategoryFilter(state, action) {
      state.categoryFilter = action.payload as "ALL" | string;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchMenuItemsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItemsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchMenuItemsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to fetch menu items";
      })
      .addCase(createMenuItemThunk.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(toggleMenuAvailabilityThunk.fulfilled, (state, action) => {
        const idx = state.list.findIndex((x) => x.id === action.payload.id);
        if (idx >= 0) state.list[idx] = { ...state.list[idx], ...action.payload };
      })
      .addCase(updateMenuItemThunk.fulfilled, (state, action) => {
        const idx = state.list.findIndex((x) => x.id === action.payload.id);
        if (idx >= 0) state.list[idx] = { ...state.list[idx], ...action.payload };
      })
      .addCase(deleteMenuItemThunk.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item.id !== action.payload);
      });
  },
});

export const { setMenuSearch, setDietFilter, setMealTypeFilter, setCategoryFilter } =
  menuSlice.actions;
export default menuSlice.reducer;
