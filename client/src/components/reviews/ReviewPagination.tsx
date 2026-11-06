import { Button } from "@/components/ui/button";

interface ReviewPaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function ReviewPagination({
    page,
    totalPages,
    onPageChange,
}: ReviewPaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t pt-5">
            <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                Previous
            </Button>

            <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
            </p>

            <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Next
            </Button>
        </div>
    );
}