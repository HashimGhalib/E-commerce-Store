"use client";

import { getApiBaseUrl } from "./api";
import type {
    ApiResponse,
    AuthResponse,
    LoginInput,
    RegisterInput,
} from "shared";

// Access token stays in memory; it is not stored in localStorage.
let accessToken: string | null = null;

// Prevent multiple components from refreshing simultaneously.
let refreshPromise: Promise<AuthResponse | null> | null = null;

export function setAccessToken(token: string): void {
    accessToken = token;
}

export function clearAccessToken(): void {
    accessToken = null;
}

/**
 * Refreshes the session and returns both the user and access token.
 */
export async function refreshAuthSession(): Promise<AuthResponse | null> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
                method: "POST",
                credentials: "include",
            });

            if (!response.ok) {
                clearAccessToken();
                return null;
            }

            const result: ApiResponse<AuthResponse> = await response.json();
            const session = result.data;

            if (!result.success || !session?.accessToken || !session.user) {
                clearAccessToken();
                return null;
            }

            setAccessToken(session.accessToken);
            return session;
        } catch {
            clearAccessToken();
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

/**
 * Refreshes the session and returns only the access token.
 * Used by authenticatedFetch().
 */
export async function refreshAccessToken(): Promise<string | null> {
    const session = await refreshAuthSession();
    return session?.accessToken ?? null;
}

async function authenticate(
    endpoint: "register" | "login",
    payload: RegisterInput | LoginInput
): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${getApiBaseUrl()}/auth/${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const result: ApiResponse<AuthResponse> = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ?? `Authentication failed (${response.status}).`
        );
    }

    if (!result.data?.accessToken || !result.data.user) {
        throw new Error("Authentication response is incomplete.");
    }

    setAccessToken(result.data.accessToken);

    return result;
}


// register
export function registerWithEmail(input: RegisterInput) {
    return authenticate("register", input);
}


// login
export function loginWithEmail(input: LoginInput) {
    return authenticate("login", input);
}

export async function authenticatedFetch(
    path: string,
    init: RequestInit = {}
): Promise<Response> {
    const makeRequest = (token: string | null) => {
        const headers = new Headers(init.headers);

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        return fetch(`${getApiBaseUrl()}${path}`, {
            ...init,
            headers,
            credentials: "include",
        });
    };

    const response = await makeRequest(accessToken);

    // Do not retry login, registration, refresh, or logout requests.
    const authEndpoints = [
        "/auth/login",
        "/auth/register",
        "/auth/refresh",
        "/auth/logout",
    ];

    if (
        response.status !== 401 ||
        authEndpoints.some((endpoint) => path.startsWith(endpoint))
    ) {
        return response;
    }

    const newToken = await refreshAccessToken();

    if (!newToken) return response;

    return makeRequest(newToken);
}

export async function logoutUser(): Promise<void> {
    try {
        const response = await fetch(`${getApiBaseUrl()}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Unable to complete logout.");
        }
    } finally {
        clearAccessToken();
    }
}