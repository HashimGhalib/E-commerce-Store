import { z } from "zod";

// ==========================================
// 1. CATEGORY SCHEMA
// ==========================================
export const createCategorySchema = z.object({
    name: z.string().min(1, "Category name is required").trim(),
    slug: z.string().min(1, "Slug is required").trim().toLowerCase().optional(), // Can be auto-generated on backend if omitted
    description: z.string().trim().optional(),
    parent: z.string().nullable().optional(), // MongoDB ObjectId string
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

// ==========================================
// 2. PRODUCT & VARIANT SCHEMAS
// ==========================================
export const productVariantSchema = z.object({
    name: z.string().min(1, "Variant name is required"),
    value: z.array(z.string().min(1)).min(1, "At least one variant value option is required"),
    stock: z.number().int().min(0, "Stock cannot be negative").default(0),
});

export const createProductSchema = z.object({
    name: z.string().min(1, "Product name is required").trim(),
    slug: z.string().min(1).trim().toLowerCase().optional(), // Auto-generated via slugify if omitted
    description: z.string().min(10, "Description must be at least 10 characters long"),
    price: z.number().positive("Price must be greater than 0"),
    images: z.array(z.string().url("Must be a valid image URL")).min(1, "At least one image is required"),
    category: z.string().min(1, "Category ID is required"), // MongoDB ObjectId string
    stock: z.number().int().min(0, "Stock cannot be negative").default(0),
    variants: z.array(productVariantSchema).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

// ==========================================
// 3. REVIEW SCHEMA
// ==========================================
export const createReviewSchema = z.object({
    product: z.string().min(1, "Product ID is required"), // MongoDB ObjectId string
    user: z.string().min(1, "User ID is required"),       // MongoDB ObjectId string
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
    comment: z.string().min(3, "Comment must be at least 3 characters").trim(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ==========================================
// 4. USER SCHEMAS (Auth & Profile)
// ==========================================
export const registerUserSchema = z.object({
    firstName: z.string().min(1, "First name is required").trim(),
    lastName: z.string().min(1, "Last name is required").trim(),
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    provider: z.enum(["local", "google", "github"]).default("local"),
    role: z.enum(["customer", "admin"]).default("customer"),
    image: z.string().url("Must be a valid URL").optional(),
});

export const loginUserSchema = z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    password: z.string().min(1, "Password is required"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;