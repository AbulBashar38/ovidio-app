export interface AuthState {
    token: string;
    refreshToken: string;
    emailVerified: boolean;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    emailVerifiedAt: string;
    creditsRemaining: number;
    profilePhotoKey: string;
    profilePhotoUrl: string;
    createdAt: string;
    updatedAt: string;
}

// API Types
export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface RegisterResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    emailVerified: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    emailVerified: boolean;
}

export interface GetUserResponse {
    user: User;
}

export interface ApiError {
    message: string;
}