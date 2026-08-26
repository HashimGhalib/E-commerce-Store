import { CategoryGrid } from "@/components/category/CategoryGrid";
import { CategoryFilters } from "@/components/category/CategoryFilters";
import { getCategories } from "@/lib/api";
import { PaginationControls } from "@/components/PaginationControls";



interface SearchParamsProps {
    searchParams: Promise<{
        category?: string;
        sort?: string;
        search?: string;
        page?: string;
    }>;
}




export default async function CategoriesPage({ searchParams }: SearchParamsProps) {
    // Await searchParams in Next.js 15+
    const resolvedParams = await searchParams;

    const currentPage = Number(resolvedParams.page) || 1;

    // Fetch filtered category list concurrently on the server
    const categories = await getCategories(resolvedParams);

    return (
        <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-8">
            {/* Header */}
            <div className="space-y-2 border-b border-border pb-6">
                <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
                    All Categories
                </h1>
                <p className="text-muted-foreground text-sm">
                    Browse our entire catalog with instant filtering and search.
                </p>
            </div>

            {/* Sidebar + Main Grid Layout */}
            <div className="flex flex-col gap-8 md:flex-row">
                <CategoryFilters categories={categories.data} />

                <main className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                            Showing {categories.data?.length} {categories.data?.length === 1 ? "Category" : "Categories"}
                        </span>
                    </div>

                    <CategoryGrid categories={categories.data} />

                    {/* Pagination */}
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={categories.totalPages}
                    />
                </main>
            </div>
        </div>
    );
}