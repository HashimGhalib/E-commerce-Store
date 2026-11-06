import type { ReviewResponse } from "shared";
import ReviewCard from "./ReviewCard";

interface ReviewListProps {
    reviews: ReviewResponse[];
}

export default function ReviewList({
    reviews,
}: ReviewListProps) {
    if (reviews.length === 0) {
        return (
            <div className="py-10 text-center">
                <h3 className="font-semibold">
                    No reviews yet
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                    Be the first to review this product.
                </p>
            </div>
        );
    }

    return (
        <div>
            {reviews.map((review) => (
                <ReviewCard
                    key={review._id}
                    review={review}
                />
            ))}
        </div>
    );
}