import { Skeleton } from "@/components/ui/skeleton";


export default function Loading() {
    return (
        <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
            {/* Hero Header Skeleton */}
            <section className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
                <Skeleton className="h-10 w-3/4 sm:w-1/2 rounded-lg" />
                <Skeleton className="h-5 w-full sm:w-4/5 rounded-md" />
            </section>

            {/* Featured Grid Skeleton */}
            <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <Skeleton className="h-7 w-40 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>

                {/* Product Cards Grid Placeholder */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-4 space-y-4"
                        >
                            {/* Image Aspect Ratio Skeleton */}
                            <Skeleton className="aspect-square w-full rounded-lg" />

                            {/* Title & Description Skeletons */}
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-3/4 rounded" />
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-4 w-2/3 rounded" />
                            </div>

                            {/* Price & Button Footer Skeletons */}
                            <div className="flex items-center justify-between pt-3 border-t border-border">
                                <Skeleton className="h-6 w-16 rounded" />
                                <Skeleton className="h-8 w-20 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}