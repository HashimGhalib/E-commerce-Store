interface StarRatingProps {
    rating: number;
    size?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
};

export default function StarRating({
    rating,
    size = "md",
}: StarRatingProps) {
    const normalizedRating = Math.max(0, Math.min(5, rating));

    return (
        <div
            className={`flex items-center gap-1 ${sizeClasses[size]}`}
            role="img"
            aria-label={`${normalizedRating} out of 5 stars`}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={
                        star <= Math.round(normalizedRating)
                            ? "text-yellow-500"
                            : "text-muted-foreground/30"
                    }
                    aria-hidden="true"
                >
                    ★
                </span>
            ))}
        </div>
    );
}