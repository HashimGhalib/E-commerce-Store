"use client";

import { useState, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";



interface ProvidersProps {
    children: ReactNode;
}


export default function Providers({ children }: ProvidersProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}