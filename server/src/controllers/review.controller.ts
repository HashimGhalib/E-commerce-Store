
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

import { Review } from "../models/Review.model";
import { Product } from "../models/Product.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

export const getProductReviews = async (
    req: Request<
        { productId: string }, //ReqParams
        {}, //ResBody
        {}, //ReqBody
        { page?: string; limit?: string } //reqQuery
    >,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { productId } = req.params;

        // 1. Validate the product ID
        if (!Types.ObjectId.isValid(productId)) {
            throw new ApiError(400, "Invalid product ID");
        }

        // 2. Confirm that the product exists
        const productExists = await Product.exists({ _id: productId });

        if (!productExists) {
            throw new ApiError(404, "Product not found");
        }

        // 3. Calculate pagination values
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(
            50,
            Math.max(1, Number(req.query.limit) || 10)
        );

        const skip = (page - 1) * limit;

        // 4. Retrieve reviews and total count
        const [reviews, totalReviews] = await Promise.all([
            Review.find({ product: productId })
                .populate("user", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Review.countDocuments({ product: productId }),
        ]);

        // 5. Send standardized paginated response
        ApiResponse.paginated(
            res,
            200,
            reviews,
            page,
            limit,
            totalReviews,
            "Reviews retrieved successfully"
        );
    } catch (error) {
        next(error);
    }
};
