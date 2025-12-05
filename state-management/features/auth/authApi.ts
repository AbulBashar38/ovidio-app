import { api } from "@/state-management/apiConfig";
import { ENDPOINTS } from "@/state-management/endpoint";
import type { GetUserResponse, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@/type/auth";

const authApi = api.injectEndpoints({
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
        }),
    })
})

export const { useRegisterMutation, useLoginMutation, useGetUserQuery } = authApi;