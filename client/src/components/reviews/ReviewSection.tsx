"use client";

import { Button } from "@/components/ui/button";
import { useProductReviews } from "@/hooks/useProductReviews";

import ReviewSummary from "./ReviewSummary";
import ReviewList from "./ReviewList";
import ReviewPagination from "./ReviewPagination";
import ReviewSkeleton from "./ReviewSkeleton";

interface ReviewSectionProps {
    productId: string;
    averageRating?: number;
    totalReviews?: number;
}

export default function ReviewSection({
    productId,
    averageRating = 0,
    totalReviews: initialTotalReviews = 0,
}: ReviewSectionProps) {
    const {
        reviews,
        page,
        setPage,
        totalPages,
        totalReviews,
        loading,
        error,
        refetch,
    } = useProductReviews({
        productId,
        limit: 5,
    });

    const displayedTotal = loading
        ? initialTotalReviews
        : totalReviews;

    return (
        <section className="mt-16 border-t pt-10">
            <div className="mb-8">
                <h2 className="text-2xl font-bold">
                    Customer Reviews
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    See what customers are saying about this product.
                </p>
            </div>

            <ReviewSummary
                averageRating={averageRating}
                totalReviews={displayedTotal}
            />

            <div className="mt-8">
                {loading ? (
                    <ReviewSkeleton />
                ) : error ? (
                    <div className="py-8 text-center">
                        <p className="text-sm text-destructive">
                            {error}
                        </p>

                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => void refetch()}
                        >
                            Try again
                        </Button>
                    </div>
                ) : (
                    <>
                        <ReviewList reviews={reviews} />

                        <ReviewPagination
                            page={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </>
                )}
            </div>
        </section>
    );
}