import { Schema, model } from "mongoose";
import { IReview } from "shared";


const reviewSchema = new Schema<IReview>(
    {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

// Compound index to prevent duplicate reviews per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export const Review = model<IReview>("Review", reviewSchema);