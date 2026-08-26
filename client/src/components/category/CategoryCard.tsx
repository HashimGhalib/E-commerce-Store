import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { ICategory } from "shared";


export function CategoryCard({ category }: { category: ICategory }) {
    return (
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-4 text-card-foreground transition-all duration-200 hover:shadow-md hover:border-primary/30">
            <div>
                {/* Responsive Image Container */}


                {/* Content */}
                <div className="mt-4 space-y-1">
                    <Link
                        href={`/products/slug/${category.slug}`}
                        className="font-heading font-semibold text-base line-clamp-1 hover:text-primary transition-colors"
                    >
                        {category.name}
                    </Link>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {category.description}
                    </p>
                </div>
            </div>

            {/* Footer / Price & Call to Action */}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">

                <Link href={`/products/slug/${category.slug}`}>
                    <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        View
                    </Button>
                </Link>
            </div>
        </div>
    );
}