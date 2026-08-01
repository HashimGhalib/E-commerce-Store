"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "@/lib/api";

export function useProductSearch(initialQuery = "") {
    const [query, setQuery] = useState(initialQuery);
    const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedQuery(query);
        }, 400);

        return () => clearTimeout(timeout);
    }, [query]);

    const { data: results, isLoading, isError } = useQuery({
        queryKey: ["product-search", debouncedQuery],
        queryFn: async () => {
            const data = await searchProducts(debouncedQuery);
            // Explicitly return an empty array if data is undefined or null
            return data ?? [];
        },
        enabled: debouncedQuery.trim().length > 0,
        staleTime: 30_000,
    });

    const resetSearch = () => {
        setQuery("");
        setDebouncedQuery("");
    };

    return {
        query,
        setQuery,
        results: results ?? [],
        isLoading,
        isError,
        hasQuery: debouncedQuery.trim().length > 0,
        resetSearch,
    };
}