import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { usersApi, type CreateUserPayload, type UpdateUserPayload } from "../../services/usersApi";
import type { PaginationMeta, UserRow, UserSummaryCards } from "../../types/api";

interface UsersState {
  summary: UserSummaryCards | null;
  rows: UserRow[];
  pagination: PaginationMeta;
  search: string;
  loading: boolean;
  mutating: boolean;
  error: string | null;
}

const initialState: UsersState = {
  summary: null,
  rows: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  search: "",
  loading: false,
  mutating: false,
  error: null,
};

export const fetchUsersSummaryThunk = createAsyncThunk(
  "users/summary",
  async (_, { rejectWithValue }) => {
    try {
      return await usersApi.summary();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchUsersThunk = createAsyncThunk(
  "users/fetch",
  async (params: { search?: string; page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      return await usersApi.list(params);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createUserThunk = createAsyncThunk(
  "users/create",
  async (payload: CreateUserPayload, { rejectWithValue }) => {
    try {
      return await usersApi.create(payload);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateUserThunk = createAsyncThunk(
  "users/update",
  async (payload: { id: string; data: UpdateUserPayload }, { rejectWithValue }) => {
    try {
      return await usersApi.update(payload.id, payload.data);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateUserStatusThunk = createAsyncThunk(
  "users/status",
  async (payload: { id: string; isActive: boolean }, { rejectWithValue }) => {
    try {
      return await usersApi.updateStatus(payload.id, payload.isActive);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteUserThunk = createAsyncThunk(
  "users/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await usersApi.deleteOne(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const replaceRow = (rows: UserRow[], row: UserRow) => rows.map((item) => (item.id === row.id ? row : item));

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsersSearch(state, action) {
      state.search = action.payload as string;
      state.pagination.page = 1;
    },
    setUsersPage(state, action) {
      state.pagination.page = action.payload as number;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchUsersSummaryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersSummaryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.cards;
      })
      .addCase(fetchUsersSummaryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to fetch users summary";
      })
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to fetch users";
      })
      .addCase(createUserThunk.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(createUserThunk.fulfilled, (state, action) => {
        state.mutating = false;
        state.rows.unshift(action.payload);
      })
      .addCase(createUserThunk.rejected, (state, action) => {
        state.mutating = false;
        state.error = (action.payload as string) ?? "Failed to create user";
      })
      .addCase(updateUserThunk.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.mutating = false;
        state.rows = replaceRow(state.rows, action.payload);
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.mutating = false;
        state.error = (action.payload as string) ?? "Failed to update user";
      })
      .addCase(updateUserStatusThunk.fulfilled, (state, action) => {
        state.rows = replaceRow(state.rows, action.payload);
      })
      .addCase(deleteUserThunk.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.mutating = false;
        state.rows = state.rows.filter((row) => row.id !== action.payload);
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.mutating = false;
        state.error = (action.payload as string) ?? "Failed to delete user";
      });
  },
});

export const { setUsersPage, setUsersSearch } = usersSlice.actions;
export default usersSlice.reducer;
