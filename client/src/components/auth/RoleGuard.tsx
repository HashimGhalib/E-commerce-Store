
"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import type { Role } from "shared";
import { useAuth } from "@/context/AuthContext";

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: Role[];
}

export function RoleGuard({
    children,
    allowedRoles,
}: RoleGuardProps) {
    const { user, isAuthenticated, isLoading } = useAuth();

    const router = useRouter();

    const hasPermission =
        user !== null && allowedRoles.includes(user.role);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

        if (!hasPermission) {
            router.replace("/unauthorized");
        }
    }, [
        isLoading,
        isAuthenticated,
        hasPermission,
        router,
    ]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p>Checking permissions...</p>
            </div>
        );
    }

    if (!isAuthenticated || !hasPermission) {
        return null;
    }

    return <>{children}</>;
}
