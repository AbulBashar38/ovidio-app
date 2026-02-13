// Need to use the React-specific entry point to import createApi
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { router } from "expo-router";
import { ENDPOINTS } from "./endpoint";
import { clearAuth, setAuth } from "./features/auth/authSlice";
import { clearUser, setUser } from "./features/auth/userSlice";

// RootState type defined locally to avoid circular dependency
interface RootState {
  auth: {
    token: string | null;
    refreshToken: string | null;
    emailVerified: boolean;
  };
}

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;

    // If we have a token set in state, let's assume that we should be passing it.
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

// Type for refresh token response
interface RefreshTokenResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    emailVerifiedAt: string | null;
    creditsRemaining: number;
    profilePhotoKey: string | null;
    profilePhotoUrl: string | null;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

// Helper function to handle logout (persistor is imported dynamically to avoid circular dependency)
const handleLogout = async (apiInstance: any) => {
  apiInstance.dispatch(clearAuth());
  apiInstance.dispatch(clearUser());
  apiInstance.dispatch(apiInstance.util?.resetApiState?.());

  // Dynamic import to avoid circular dependency
  const { persistor } = await import("./store");
  await persistor.purge();

  router.replace("/(auth)/login");
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // wait until the mutex is available without locking it
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // checking whether the mutex is locked
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshToken = (api.getState() as RootState).auth.refreshToken;

        if (!refreshToken) {
          // No refresh token, logout
          console.log("🔐 No refresh token available, logging out...");
          await handleLogout(api);
          return result;
        }

        console.log("🔄 Access token expired, attempting refresh...");

        const refreshResult = await baseQuery(
          {
            url: ENDPOINTS.refresh,
            method: "POST",
            body: { refreshToken },
          },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          const data = refreshResult.data as RefreshTokenResponse;

          console.log("✅ Token refreshed successfully");

          // Store the new tokens
          api.dispatch(
            setAuth({
              token: data.accessToken,
              refreshToken: data.refreshToken,
              emailVerified: data.user.emailVerifiedAt ? true : false,
            }),
          );

          // Update user data from refresh response
          api.dispatch(
            setUser({
              id: data.user.id,
              email: data.user.email,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              role: data.user.role,
              emailVerifiedAt: data.user.emailVerifiedAt || "",
              creditsRemaining: data.user.creditsRemaining,
              profilePhotoKey: data.user.profilePhotoKey || "",
              profilePhotoUrl: data.user.profilePhotoUrl || "",
              createdAt: data.user.createdAt,
              updatedAt: data.user.updatedAt,
            }),
          );

          // Retry the initial query with new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh failed - logout
          console.log("❌ Token refresh failed, logging out...");
          await handleLogout(api);
        }
      } catch (error) {
        console.error("❌ Error during token refresh:", error);
        await handleLogout(api);
      } finally {
        // release must be called once the mutex should be released again.
        release();
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({}),
});
