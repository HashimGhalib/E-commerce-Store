import { ApiResponse, IProduct } from "shared";

function baseUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
}

export class HttpError extends Error {
    public readonly status: number;
    public readonly errors?: any[];

    constructor(message: string, status: number, errors?: any[]) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const res = await fetch(`${baseUrl()}${path}`, {
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
            (body as any).errors
        );
    }

    return body;
}

// ─── Helper for serializing query parameter objects ──────────────────────────
function buildQueryString(params?: Record<string, string | undefined>): string {
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

// ─── Refined API Functions ────────────────────────────────────────────────────

/**
 * Health status check
 */
export async function healthStatus(): Promise<ApiResponse<{ status: string }>> {
    return request<{ status: string }>("/v1/health");
}

/**
 * Search products by query string
 */
export async function searchProducts(query: string): Promise<IProduct[]> {
    if (!query.trim()) return [];

    const res = await request<IProduct[]>(
        `/products${buildQueryString({ search: query })}`
    );
    return res.data ?? [];
}

/**
 * Server-side fetch helper for featured products
 */
export async function getFeaturedProducts(): Promise<IProduct[]> {
    try {
        const res = await request<IProduct[]>("/products?featured=true&limit=12");
        return res.data ?? [];
    } catch (error) {
        console.error("Failed to fetch featured products:", error);
        return [];
    }
}

/**
 * Get products with dynamic filter parameters (category, sort, search, page)
 */
export async function getProducts(
    params?: Record<string, string | undefined>
): Promise<IProduct[]> {
    try {
        const res = await request<IProduct[]>(`/products${buildQueryString(params)}`);
        return res.data ?? [];
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
    }
}

/**
 * Get all categories
 */
export async function getCategories<T = any>(): Promise<T[]> {
    try {
        const res = await request<T[]>("/categories");
        return res.data ?? [];
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}