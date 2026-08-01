"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log error to server/service monitoring (e.g., Sentry)
        console.error("Route Error Boundary Caught:", error);
    }, [error]);

    return (
        <div className="container mx-auto px-4 py-24 flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
                <AlertTriangle className="h-8 w-8" />
            </div>

            <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl mb-2">
                Something went wrong
            </h1>
            <p className="text-muted-foreground max-w-md text-sm sm:text-base mb-8">
                We encountered an issue loading this section. You can try recovering or return to the storefront.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button onClick={() => reset()} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </Button>
                <Link href="/">
                    <Button variant="outline" className="gap-2">
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Button>
                </Link>
            </div>
        </div>
    );
}