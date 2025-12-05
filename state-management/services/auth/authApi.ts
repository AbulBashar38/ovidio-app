import { api } from "@/state-management/apiConfig";
import { ENDPOINTS } from "@/state-management/endpoint";
import type { GetUserResponse, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@/type/auth";

const authApi = api.enhanceEndpoints({
    addTagTypes: ["user"],
}).injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation<RegisterResponse, RegisterRequest>({
            query: (data) => ({
                url: ENDPOINTS.register,
                method: "POST",
                body: data,
            }),
        }),
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (data) => ({
                url: ENDPOINTS.login,
                method: "POST",
                body: data,
            }),

        }),
        getUser: builder.query<GetUserResponse, void>({
            query: () => ({
                url: ENDPOINTS.me,
                method: "GET",
            }),
            providesTags: ["user"],
        }),
        updateProfilePhoto: builder.mutation<void, { imageUrl: string }>({
            query: (body) => ({
                url: "/auth/profile/photo",
                method: "POST",
                body,
            }),
            invalidatesTags: ["user"],
        }),
        forgotPassword: builder.mutation<void, { email: string }>({
            query: (data) => ({
                url: "/auth/password/forgot",
                method: "POST",
                body: data,
            }),
        }),
    }),
});

export const { useRegisterMutation, useLoginMutation, useGetUserQuery, useUpdateProfilePhotoMutation, useForgotPasswordMutation } = authApi;