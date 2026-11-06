"use client";

import { useCallback, useEffect, useState } from "react";
import { getProductReviews } from "@/lib/api";
import type { ReviewResponse } from "shared";

interface UseProductReviewsProps {
    productId: string;
    limit?: number;
}

export function useProductReviews({
    productId,
    limit = 5,
}: UseProductReviewsProps) {
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getProductReviews(productId, {
                page,
                limit,
            });

            setReviews(response.data);
            setTotalPages(response.totalPages);
            setTotalReviews(response.total);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to retrieve product reviews."
            );
        } finally {
            setLoading(false);
        }
    }, [productId, page, limit]);

    useEffect(() => {
        void fetchReviews();
    }, [fetchReviews]);

    return {
        reviews,
        page,
        setPage,
        totalPages,
        totalReviews,
        loading,
        error,
        refetch: fetchReviews,
    };
}