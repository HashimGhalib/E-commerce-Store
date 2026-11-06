import StarRating from "./StarRating";

interface ReviewSummaryProps {
    averageRating: number;
    totalReviews: number;
}

export default function ReviewSummary({
    averageRating,
    totalReviews,
}: ReviewSummaryProps) {
    const rating = Math.max(0, Math.min(5, averageRating));

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <h3 className="text-4xl font-bold">
                    {rating.toFixed(1)}
                </h3>

                <div className="flex flex-col gap-1">
                    <StarRating rating={rating} />

                    <p className="text-sm text-muted-foreground">
                        Based on {totalReviews}{" "}
                        {totalReviews === 1 ? "review" : "reviews"}
                    </p>
                </div>
            </div>
        </div>
    );
}