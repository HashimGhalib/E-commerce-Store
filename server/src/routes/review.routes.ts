
import { Router } from "express";
import { getProductReviews } from "../controllers/review.controller";

const router = Router();

// Get reviews belonging to a product
router.get(
    "/product/:productId",
    getProductReviews
);

export default router;
