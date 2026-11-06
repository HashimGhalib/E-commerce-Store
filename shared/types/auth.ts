
import type { AuthProvider } from "./user";
import type { Role } from "../constants/roles";

// Registration request
export interface RegisterInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

// Login request
export interface LoginInput {
    email: string;
    password: string;
}

// Public user information
export interface AuthUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    provider: AuthProvider;
    image?: string;
    role: Role;
}

// Authentication response
export interface AuthResponse {
    user: AuthUser;
    accessToken: string;
}
