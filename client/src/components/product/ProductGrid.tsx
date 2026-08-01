import { IProduct } from "shared";
import { ProductCard } from "./ProductCard";



export function ProductGrid({ products }: { products: IProduct[] }) {
    if (!products || products.length === 0) {
        return (
            <div className="flex min-h-[200px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">No featured products found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
                <ProductCard key={String(product._id)} product={product} />
            ))}
        </div>
    );
}