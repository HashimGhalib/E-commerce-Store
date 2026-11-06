
import mongoose, { Schema, model } from "mongoose";
import { IReview } from "shared";
import { Product } from "./Product.model";

const reviewSchema = new Schema<IReview>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

// Prevent duplicate reviews per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Automatically update product ratings after saving a review
reviewSchema.post("save", async function (doc) {
    const ReviewModel = mongoose.model("Review");

    const [result] = await ReviewModel.aggregate([
        {
            $match: { product: doc.product },
        },
        {
            $group: {
                _id: "$product",
                average: { $avg: "$rating" },
                count: { $sum: 1 },
            },
        },
    ]);

    await Product.findByIdAndUpdate(doc.product, {
        ratingsAverage: result ? Math.round(result.average * 10) / 10 : 0,
        ratingsCount: result?.count ?? 0,
    });
});

export const Review = model<IReview>("Review", reviewSchema);
