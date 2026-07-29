import { Router } from "express";
import { createCategorySchema } from "../validators/schemas";
import { validate } from "../middlewares/validate.middleware";
import {
    createCategory,
    getCategory,
    getCategoryTree,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller";

const router = Router();

// Public routes
router.get("/", getCategory);
router.get("/tree", getCategoryTree);
router.get("/slug/:slug", getCategoryBySlug);

// Write routes protected with Zod validation
router.post("/", validate(createCategorySchema), createCategory);
router.put("/:id", validate(createCategorySchema.partial()), updateCategory);
router.delete("/:id", deleteCategory);

export default router;