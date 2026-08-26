import { ICategory } from "shared";
import { CategoryCard } from "./CategoryCard";



export function CategoryGrid({ categories }: { categories: ICategory[] }) {
    if (!categories || categories.length === 0) {
        return (
            <div className="flex min-h-[200px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">No featured products found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
                <CategoryCard key={String(category._id)} category={category} />
            ))}
        </div>
    );
}