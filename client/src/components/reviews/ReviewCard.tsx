import type { ReviewResponse } from "shared";
import StarRating from "./StarRating";

interface ReviewCardProps {
    review: ReviewResponse;
}

export default function ReviewCard({ review }: ReviewCardProps) {
    const reviewerName = review.user?.name || "Anonymous";

    const date = new Date(review.createdAt);

    const formattedDate = Number.isNaN(date.getTime())
        ? "Date unavailable"
        : new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(date);

    return (
        <article className="flex flex-col gap-3 border-b py-5 last:border-b-0">
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h4 className="font-semibold">
                        {reviewerName}
                    </h4>

                    <p className="text-xs text-muted-foreground">
                        {formattedDate}
                    </p>
                </div>

                <StarRating
                    rating={review.rating}
                    size="sm"
                />
            </div>

            <p className="text-sm leading-6 text-muted-foreground">
                {review.comment}
            </p>
        </article>
    );
}