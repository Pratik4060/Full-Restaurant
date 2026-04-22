import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi } from "../../services/authApi";
import { tokenStorage } from "../../lib/token";
import type { Admin } from "../../types/api";

interface AuthState {
  token: string | null;
  admin: Admin | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: tokenStorage.get(),
  admin: null,
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authApi.login(payload);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.admin = null;
      tokenStorage.clear();
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.admin = action.payload.admin;
        tokenStorage.set(action.payload.token);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Login failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
