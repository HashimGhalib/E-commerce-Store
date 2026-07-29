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

const router = Router();

// Public routes
router.get("/", getProducts);
router.get("/slug/:slug", getProductBySlug);

// Admin / Write routes protected with Zod middleware
router.post("/", validate(createProductSchema), createProduct);
router.put("/:id", validate(createProductSchema.partial()), updateProduct);
router.delete("/:id", deleteProduct);

export default router;