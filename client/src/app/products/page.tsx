import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { getProducts, getCategories } from "@/lib/api";



interface SearchParamsProps {
    searchParams: Promise<{
        category?: string;
        sort?: string;
        search?: string;
        page?: string;
    }>;
}




export default async function ProductsPage({ searchParams }: SearchParamsProps) {
    // Await searchParams in Next.js 15+
    const resolvedParams = await searchParams;

    // Fetch filtered products & category list concurrently on the server
    const [products, categories] = await Promise.all([
        getProducts(resolvedParams),
        getCategories(),
    ]);

    return (
        <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-8">
            {/* Header */}
            <div className="space-y-2 border-b border-border pb-6">
                <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
                    All Products
                </h1>
                <p className="text-muted-foreground text-sm">
                    Browse our entire catalog with instant filtering and search.
                </p>
            </div>

            {/* Sidebar + Main Grid Layout */}
            <div className="flex flex-col gap-8 md:flex-row">
                <ProductFilters categories={categories} />

                <main className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                            Showing {products.length} {products.length === 1 ? "Product" : "Products"}
                        </span>
                    </div>

                    <ProductGrid products={products} />
                </main>
            </div>
        </div>
    );
}