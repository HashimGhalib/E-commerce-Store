"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CategoryOption {
    _id: string;
    name: string;
    slug: string;
}

interface ProductFiltersProps {
    categories?: CategoryOption[];
}

export function ProductFilters({ categories = [] }: ProductFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Active query parameters
    const activeCategory = searchParams.get("category") || "";
    const activeSort = searchParams.get("sort") || "";
    const initialSearch = searchParams.get("search") || "";

    const [searchTerm, setSearchTerm] = useState(initialSearch);

    // Helper to update URL search params immutably
    const updateQueryParam = useCallback(
        (key: string, value: string | null) => {
            const params = new URLSearchParams(searchParams.toString());

            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }

            // Reset to page 1 whenever filters change
            params.delete("page");

            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        },
        [searchParams, pathname, router]
    );

    // Debounce search input changes before updating URL
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== initialSearch) {
                updateQueryParam("search", searchTerm.trim() || null);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchTerm, initialSearch, updateQueryParam]);

    const clearAllFilters = () => {
        setSearchTerm("");
        router.push(pathname, { scroll: false });
    };

    const hasActiveFilters = Boolean(activeCategory || activeSort || initialSearch);

    return (
        <aside className="w-full space-y-6 md:w-64 shrink-0">
            <div className="rounded-xl border border-border bg-card p-5 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2 font-heading font-bold text-base">
                        <Filter className="h-4 w-4 text-primary" />
                        <span>Filters</span>
                    </div>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                        >
                            Reset
                        </Button>
                    )}
                </div>

                {/* Debounced Search Filter */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-8 text-sm"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Sort Select */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Sort By</label>
                    <select
                        value={activeSort}
                        onChange={(e) => updateQueryParam("sort", e.target.value || null)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">Newest Arrivals</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="name_asc">Name: A to Z</option>
                    </select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Category</label>
                    <div className="flex flex-col gap-1">
                        <button
                            type="button"
                            onClick={() => updateQueryParam("category", null)}
                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm text-left transition-colors ${!activeCategory
                                ? "bg-primary text-primary-foreground font-semibold"
                                : "hover:bg-muted text-foreground"
                                }`}
                        >
                            All Categories
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                type="button"
                                onClick={() => updateQueryParam("category", cat._id)}
                                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm text-left transition-colors ${activeCategory === (cat.slug || cat.name)
                                    ? "bg-primary text-primary-foreground font-semibold"
                                    : "hover:bg-muted text-foreground"
                                    }`}
                            >
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}