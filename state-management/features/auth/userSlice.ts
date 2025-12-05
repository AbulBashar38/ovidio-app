import { User } from "@/type/auth";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../store";



// Define the initial state using that type
const initialState: User = {
  id: "",
  email: "",
  firstName: "",
  lastName: "",
  role: "",
  emailVerifiedAt: "",
  creditsRemaining: 0,
  profilePhotoKey: "",
  profilePhotoUrl: "",
  createdAt: "",
  updatedAt: "",
};

export const userSlice = createSlice({
  name: "user",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.role = action.payload.role;
      state.emailVerifiedAt = action.payload.emailVerifiedAt;
      state.creditsRemaining = action.payload.creditsRemaining;
      state.profilePhotoKey = action.payload.profilePhotoKey;
      state.profilePhotoUrl = action.payload.profilePhotoUrl;
      state.createdAt = action.payload.createdAt;
      state.updatedAt = action.payload.updatedAt;
    },
    setEmailVerified: (state, action: PayloadAction<string>) => {
      state.emailVerifiedAt = action.payload;
    },
    clearUser: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { setUser, setEmailVerified, clearUser } = userSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectUser = (state: RootState) => state.user;

export default userSlice.reducer;
