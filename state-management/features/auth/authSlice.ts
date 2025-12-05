import { AuthState } from "@/type/auth";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../store";



// Define the initial state using that type
const initialState: AuthState = {
  token: "",
  refreshToken: "",
  emailVerified: false,
};

export const authSlice = createSlice({
  name: "auth",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ token: string; refreshToken: string; emailVerified: boolean }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.emailVerified = action.payload.emailVerified;
    },
    clearAuth: (state) => {
      state.token = "";
      state.refreshToken = "";
      state.emailVerified = false;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectAuth = (state: RootState) => state.auth;

export default authSlice.reducer;
