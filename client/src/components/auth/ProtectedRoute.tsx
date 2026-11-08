
"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;

            router.replace(redirectUrl);
        }
    }, [isLoading, isAuthenticated, pathname, router]);

    // Wait until session restoration is complete.
    if (isLoading) {
        return <div className="flex min-h-[60vh] items-center justify-center">
            <p>Checking your session...</p>
        </div>;
    }

    // Do not render protected content while redirecting.
    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
