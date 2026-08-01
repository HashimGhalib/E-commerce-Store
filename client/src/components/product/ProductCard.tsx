import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { IProduct, ICategory } from "shared";


export function ProductCard({ product }: { product: IProduct }) {
    return (
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-4 text-card-foreground transition-all duration-200 hover:shadow-md hover:border-primary/30">
            <div>
                {/* Responsive Image Container */}
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                    <Image
                        src={product.image[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                    {product.category && (
                        <Badge className="absolute top-2.5 left-2.5 bg-background/80 text-foreground backdrop-blur-md">
                            {(product.category as ICategory)?.name}
                        </Badge>
                    )}
                </div>

                {/* Content */}
                <div className="mt-4 space-y-1">
                    <Link
                        href={`/products/${product._id}`}
                        className="font-heading font-semibold text-base line-clamp-1 hover:text-primary transition-colors"
                    >
                        {product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {product.description}
                    </p>
                </div>
            </div>

            {/* Footer / Price & Call to Action */}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="font-heading font-bold text-lg text-primary">
                    ${product.price.toFixed(2)}
                </span>
                <Link href={`/products/slug/${product.slug}`}>
                    <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        View
                    </Button>
                </Link>
            </div>
        </div>
    );
}