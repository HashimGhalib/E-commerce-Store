import { NextFunction, Request, Response } from "express";
import { Category } from "../models/Category.model";
import { ApiResponse as IApiResponse, ICategory, CategoryTreeItem } from "shared";
import { CreateCategoryInput } from "../validators/schemas";
import slugify from "slugify";
import { ApiResponse } from "../utils/ApiResponse";


const buildCategoryTree = (
    categories: any[],
    parentId: string | null = null
): CategoryTreeItem[] => {
    const categoryTree: CategoryTreeItem[] = [];

    const children = categories.filter((cat) => {
        if (parentId === null) {
            return cat.parent === null || cat.parent === undefined;
        }
        return cat.parent && cat.parent.toString() === parentId.toString();
    });

    for (const child of children) {
        categoryTree.push({
            _id: child._id.toString(),
            name: child.name,
            slug: child.slug,
            description: child.description,
            parent: child.parent ? child.parent.toString() : null,
            children: buildCategoryTree(categories, child._id.toString()),
        });
    }

    return categoryTree;
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 */
export const createCategory = async (
    req: Request<{}, {}, CreateCategoryInput>,
    res: Response<IApiResponse<ICategory>>
): Promise<void> => {
    try {
        const { name, description, parent } = req.body;

        if (parent) {
            const parentExists = await Category.findById(parent);
            if (!parentExists) {
                res.status(404).json({ success: false, message: "Parent category not found" });
                return;
            }
        }

        const category = new Category({
            name,
            description,
            parent: parent || null,
        });

        await category.save();

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(400).json({ success: false, message: "A category with this name or slug already exists" });
            return;
        }
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};

/**
 * @desc    Get all categories as a flat list
 * @route   GET /api/categories
 */
export const getCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 6;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (req.query.slug) {
            filter.slug = req.query.slug;
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


        const [categories, total] = await Promise.all([
            Category.find(filter)
                .populate("parent", "name slug")
                .sort(sortOption)
                .skip(skip)
                .limit(limit),
            Category.countDocuments(filter)
        ]);

        ApiResponse.paginated(res, 200, categories, page, limit, total);
    } catch (error: any) {
        next(error);
    }
};

/**
 * @desc    Get nested hierarchical tree of all categories
 * @route   GET /api/categories/tree
 */
export const getCategoryTree = async (
    _req: Request,
    res: Response<IApiResponse<CategoryTreeItem[]>>
): Promise<void> => {
    try {
        const allCategories = await Category.find().lean();
        const tree = buildCategoryTree(allCategories);

        res.status(200).json({
            success: true,
            data: tree,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};

/**
 * @desc    Get single category by slug
 * @route   GET /api/categories/slug/:slug
 */
export const getCategoryBySlug = async (
    req: Request,
    res: Response<IApiResponse<ICategory>>
): Promise<void> => {
    try {
        const { slug } = req.params;

        const category = await Category.findOne({ slug: slug as string }).populate("parent", "name slug");

        if (!category) {
            res.status(404).json({ success: false, message: "Category not found" });
            return;
        }

        res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};

/**
 * @desc    Update category by ID
 * @route   PUT /api/categories/:id
 */
export const updateCategory = async (
    req: Request,
    res: Response<IApiResponse<ICategory>>
): Promise<void> => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.parent && updates.parent === id) {
            res.status(400).json({ success: false, message: "A category cannot be its own parent" });
            return;
        }

        if (updates.name) {
            updates.slug = slugify(updates.name, { lower: true, strict: true, trim: true });
        }

        if (updates.parent) {
            const parentExists = await Category.findById(updates.parent);
            if (!parentExists) {
                res.status(404).json({ success: false, message: "Parent category not found" });
                return;
            }
        }

        const category = await Category.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        }).populate("parent", "name slug");

        if (!category) {
            res.status(404).json({ success: false, message: "Category not found" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(400).json({ success: false, message: "A category with this name/slug already exists" });
            return;
        }
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};

/**
 * @desc    Delete category by ID
 * @route   DELETE /api/categories/:id
 */
export const deleteCategory = async (
    req: Request,
    res: Response<IApiResponse>
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ success: false, message: "Invalid category ID" });
            return;
        }

        await Category.updateMany({ parent: id }, { parent: null });

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            res.status(404).json({ success: false, message: "Category not found" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Category deleted and subcategories unlinked",
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};