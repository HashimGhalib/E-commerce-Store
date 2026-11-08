
import { ApiResponse, IProduct, ICategory } from "shared";
import type { PaginatedResponse, ReviewResponse } from "shared";

// ─── Base API URL ─────────────────────────────────────────────────────────────

export function getApiBaseUrl(): string {
    return (
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5000/api"
    );
}

// ─── HTTP Error Handler ──────────────────────────────────────────────────────

export class HttpError extends Error {
    public readonly status: number;
    public readonly errors?: unknown[];

    constructor(message: string, status: number, errors?: unknown[]) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
}

// ─── Standard API Request Helper ─────────────────────────────────────────────

async function request<T>(
    path: string,
    init?: RequestInit
): Promise<ApiResponse<T>> {
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            // TODO: forward auth headers when JWT is implemented
            ...init?.headers,
        },
        cache: init?.cache ?? "no-store",
    });

    // Handle 204 No Content
    if (res.status === 204) {
        return {
            success: true,
            message: "No Content",
            data: undefined as unknown as T,
        };
    }

    const body: ApiResponse<T> = await res.json();

    if (!res.ok) {
        throw new HttpError(
            body.message ?? `Request failed with status ${res.status}`,
            res.status,
            (body as { errors?: unknown[] }).errors
        );
    }

    return body;
}

// ─── Paginated API Request Helper ────────────────────────────────────────────

async function paginatedRequest<T>(
    path: string,
    init?: RequestInit
): Promise<PaginatedResponse<T>> {
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            // TODO: forward auth headers when JWT is implemented
            ...init?.headers,
        },
        cache: init?.cache ?? "no-store",
    });

    const body: PaginatedResponse<T> = await res.json();

    if (!res.ok) {
        throw new HttpError(
            body.message ?? `Request failed with status ${res.status}`,
            res.status,
            (body as { errors?: unknown[] }).errors
        );
    }

    return body;
}

// ─── Query String Helper ─────────────────────────────────────────────────────

function buildQueryString(
    params?: Record<string, string | undefined>
): string {
    if (!params) return "";

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value);
        }
    });

    const query = searchParams.toString();

    return query ? `?${query}` : "";
}

// ─── Product API Functions ───────────────────────────────────────────────────

/**
 * Search products by query string.
 */
export async function searchProducts(
    query: string
): Promise<IProduct[]> {
    if (!query.trim()) return [];

    const res = await paginatedRequest<IProduct>(
        `/products${buildQueryString({ search: query })}`
    );

    return res.data ?? [];
}

/**
 * Server-side fetch helper for featured products.
 */
export async function getFeaturedProducts(): Promise<IProduct[]> {
    try {
        const res = await paginatedRequest<IProduct>("/products?limit=12");

        return res.data ?? [];
    } catch (error) {
        console.error("Failed to fetch featured products:", error);

        return [];
    }
}

/**
 * Get products with dynamic filter parameters.
 * Supports category, sort, search and page.
 */
export async function getProducts(
    params?: Record<string, string | undefined>
): Promise<PaginatedResponse<IProduct>> {
    try {
        const res = await paginatedRequest<IProduct>(
            `/products${buildQueryString(params)}`
        );

        return res;
    } catch (error) {
        console.error("Failed to fetch products:", error);

        return {
            success: false,
            data: [],
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 1,
        };
    }
}

/**
 * Get a product by its slug.
 */
export async function getProductBySlug(
    slug: string
): Promise<IProduct | null> {
    try {
        const res = await request<IProduct>(
            `/products/slug/${encodeURIComponent(slug)}`
        );

        return res.data ?? null;
    } catch (error) {
        console.error("Failed to fetch product:", error);

        return null;
    }
}

// ─── Category API Functions ──────────────────────────────────────────────────

/**
 * Get all categories with optional query parameters.
 */
export async function getCategories(
    params?: Record<string, string | undefined>
): Promise<PaginatedResponse<ICategory>> {
    try {
        const res = await paginatedRequest<ICategory>(
            `/categories${buildQueryString(params)}`
        );

        return res;
    } catch (error) {
        console.error("Failed to fetch categories:", error);

        return {
            success: false,
            data: [],
            page: 1,
            limit: 6,
            total: 0,
            totalPages: 1,
        };
    }
}

// ─── Review API Functions ────────────────────────────────────────────────────

/**
 * Get paginated reviews for a specific product.
 */
export async function getProductReviews(
    productId: string,
    params?: {
        page?: number;
        limit?: number;
    }
): Promise<PaginatedResponse<ReviewResponse>> {
    const query = new URLSearchParams({
        page: String(params?.page ?? 1),
        limit: String(params?.limit ?? 10),
    });

    return paginatedRequest<ReviewResponse>(
        `/reviews/product/${encodeURIComponent(productId)}?${query.toString()}`
    );
}
