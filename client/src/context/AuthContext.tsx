"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import type { AuthUser, LoginInput, RegisterInput } from "shared";

import {
    loginWithEmail,
    registerWithEmail,
    refreshAuthSession,
    logoutUser as logoutRequest,
} from "@/lib/auth-client";

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (input: LoginInput) => Promise<void>;
    register: (input: RegisterInput) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Restore the user's session when the application loads.
     */
    useEffect(() => {
        let isMounted = true;

        async function restoreSession() {
            try {
                const session = await refreshAuthSession();

                if (isMounted) {
                    setUser(session?.user ?? null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void restoreSession();

        return () => {
            isMounted = false;
        };
    }, []);

    /**
     * Log in an existing user.
     */
    const login = useCallback(async (input: LoginInput) => {
        const response = await loginWithEmail(input);

        if (!response.data?.user) {
            throw new Error("Login response did not contain user information.");
        }

        setUser(response.data.user);
    }, []);

    /**
     * Register a new user.
     */
    const register = useCallback(async (input: RegisterInput) => {
        const response = await registerWithEmail(input);

        if (!response.data?.user) {
            throw new Error("Registration response did not contain user information.");
        }

        setUser(response.data.user);
    }, []);

    /**
     * Log out the current user.
     */
    const logout = useCallback(async () => {
        try {
            await logoutRequest();
        } finally {
            setUser(null);
        }
    }, []);

    const value = useMemo<AuthContextType>(
        () => ({
            user,
            isLoading,
            isAuthenticated: Boolean(user),
            login,
            register,
            logout,
        }),
        [user, isLoading, login, register, logout]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Access authentication state and methods from components.
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider.");
    }

    return context;
}