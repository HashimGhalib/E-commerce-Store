import { Request, Response, NextFunction } from "express";
import { Product } from "../models/Product.model";
import { Category } from "../models/Category.model";
import { CreateProductInput } from "../validators/schemas";
import slugify from "slugify";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

/**
 * @desc    Create a new product
 * @route   POST /api/products
 */
export const createProduct = async (
    req: Request<{}, {}, CreateProductInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { category } = req.body;

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            throw new ApiError(404, "Category not found");
        }

        const product = new Product(req.body);
        await product.save();

        ApiResponse.success(res, 201, product, "Product created successfully");
    } catch (error: any) {
        if (error.code === 11000) {
            next(new ApiError(400, "A product with this name or slug already exists"));
            return;
        }
        next(error);
    }
};

/**
 * @desc    Get all products (with optional search, category filter, pagination)
 * @route   GET /api/products
 */
export const getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (req.query.category) {
            filter.category = req.query.category;
        }

        if (req.query.search) {
            filter.$text = { $search: req.query.search as string };
        }

        // Dynamic sorting logic
        const sortQuery = (req.query.sort as string) || "";
        let sortOption: Record<string, 1 | -1> = {
            createdAt: -1
        }

        switch (sortQuery) {
            case "price_asc":
                sortOption = { price: 1 };
                break;
            case "price_desc":
                sortOption = { price: -1 };
                break;
            case "name_asc":
                sortOption = { name: 1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate("category", "name slug")
                .sort(sortOption)
                .skip(skip)
                .limit(limit),
            Product.countDocuments(filter),
        ]);

        ApiResponse.paginated(res, 200, products, page, limit, total);
    } catch (error: any) {
        next(error);
    }
};

/**
 * @desc    Get single product by human-readable slug
 * @route   GET /api/products/slug/:slug
 */
export const getProductBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { slug } = req.params;

        const product = await Product.findOne({ slug: slug as string }).populate("category", "name slug description");

        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        ApiResponse.success(res, 200, product);
    } catch (error: any) {
        next(error);
    }
};

/**
 * @desc    Update an existing product by ID
 * @route   PUT /api/products/:id
 */
export const updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // 1. Fetch current product to compare existing fields
        const currentProduct = await Product.findById(id);
        if (!currentProduct) {
            throw new ApiError(404, "Product not found");
        }

        // 2. Handle slug updates safely
        if (updates.name && updates.name !== currentProduct.name) {
            const newSlug: string = slugify(updates.name, { lower: true, strict: true, trim: true });

            // Ensure no OTHER product possesses this slug
            const slugExists = await Product.findOne({ slug: newSlug as string, _id: { $ne: id as any } });
            if (slugExists) {
                throw new ApiError(400, "A product with this name already exists");
            }

            updates.slug = newSlug;
        } else {
            // Don't overwrite slug if name is unchanged or omitted
            delete updates.slug;
        }

        // 3. Verify category if updating category
        if (updates.category) {
            const categoryExists = await Category.findById(updates.category);
            if (!categoryExists) {
                throw new ApiError(404, "Category not found");
            }
        }

        // 4. Perform the update
        const product = await Product.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        }).populate("category", "name slug");

        ApiResponse.success(res, 200, product!, "Product updated successfully");
    } catch (error: any) {
        if (error.code === 11000) {
            next(new ApiError(400, "A product with this name or slug already exists"));
            return;
        }
        next(error);
    }
};

/**
 * @desc    Delete product by ID
 * @route   DELETE /api/products/:id
 */
export const deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        ApiResponse.success(res, 200, undefined, "Product deleted successfully");
    } catch (error: any) {
        next(error);
    }
};