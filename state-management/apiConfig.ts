// Need to use the React-specific entry point to import createApi
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { router } from "expo-router";
import { ENDPOINTS } from "./endpoint";
import { clearAuth, setAuth } from "./features/auth/authSlice";
import { clearUser } from "./features/auth/userSlice";
import { RootState } from "./store";

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: "http://147.93.107.185:3007/api",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;

    // If we have a token set in state, let's assume that we should be passing it.
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

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
          api.dispatch(clearAuth());
          api.dispatch(clearUser());
          router.replace("/(auth)/login");
          return result;
        }

        const refreshResult = await baseQuery(
          {
            url: ENDPOINTS.refresh,
            method: "POST",
            body: { refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const data = refreshResult.data as any;
          // Store the new token
          api.dispatch(setAuth({
            token: data.accessToken,
            refreshToken: data.refreshToken,
            emailVerified: data.emailVerified
          }));

          // Retry the initial query
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh failed - logout
          api.dispatch(clearAuth());
          api.dispatch(clearUser());
          router.replace("/(auth)/login");
        }
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
  endpoints: (builder) => ({
  }),
});


