"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
}

export function PaginationControls({
    currentPage,
    totalPages,
}: PaginationControlsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (totalPages <= 1) return null;

    const updatePage = (newPage: number) => {
        // 1. Copy active search parameters (preserves category, sort, search, etc.)
        const params = new URLSearchParams(searchParams.toString());

        // 2. Update or set the 'page' query param (e.g. ?page=3)
        params.set("page", newPage.toString());

        // 3. Push the new URL with updated params back into the router
        router.push(`${pathname}?${params.toString()}`, { scroll: true });
    };

    return (
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-border">
            {/* Decreases page & updates URL: ?page=X-1 */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => updatePage(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
            </Button>

            {/* Shows active page from URL */}
            <span className="text-sm font-medium text-muted-foreground">
                Page {currentPage} of {totalPages}
            </span>

            {/* Increases page & updates URL: ?page=X+1 */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => updatePage(currentPage + 1)}
                disabled={currentPage >= totalPages}
            >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
    );
}