import { Router } from "express";
import { createProductSchema } from "../validators/schemas";
import { validate } from "../middlewares/validate.middleware";
import {
    createProduct,
    getProducts,
    getProductBySlug,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controller";

import { authenticate, authorize } from "../middlewares/auth.middleware";


const router = Router();

// Public routes
router.get("/", getProducts);
router.get("/slug/:slug", getProductBySlug);

// Admin / Write routes protected with Zod middleware
router.post("/", authenticate, authorize("admin"), validate(createProductSchema), createProduct);
router.patch("/:id", authenticate, authorize("admin"), validate(createProductSchema.partial()), updateProduct);
router.delete("/:id", authenticate, authorize("admin"), deleteProduct);

export default router;