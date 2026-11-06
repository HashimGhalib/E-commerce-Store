
import { Button } from "@/components/ui/button";
import ReviewSection from "@/components/reviews/ReviewSection";
import { getProductBySlug } from "@/lib/api";
import Image from "next/image";

interface ProductPageProps {
    params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({
    params,
}: ProductPageProps) {
    const { slug } = await params;

    const product = await getProductBySlug(slug);

    if (!product) {
        return (
            <main className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold">
                    Product not found
                </h1>

                <p className="mt-2 text-muted-foreground">
                    The product you are looking for does not exist.
                </p>
            </main>
        );
    }

    return (
        <main className="container mx-auto max-w-7xl px-2 py-8 sm:px-4 lg:px-8">
            {/* Product Details */}
            <div
                key={product._id}
                className="flex flex-col gap-10 p-4 md:flex-row md:justify-center"
            >
                <Image
                    src={product.image[0]}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="h-auto w-full rounded-lg md:h-100 md:w-1/2 lg:w-1/3"
                    priority
                />

                <div className="flex flex-col justify-between gap-10 md:justify-center">
                    <div className="flex flex-col gap-4">
                        <h1 className="font-heading text-lg font-bold md:text-5xl">
                            {product.name}
                        </h1>

                        <p className="w-3/4 text-sm text-muted-foreground md:w-full md:text-md">
                            {product.description}
                        </p>

                        <p className="text-lg font-bold text-primary md:text-2xl">
                            ${product.price}
                        </p>
                    </div>

                    <Button
                        size="lg"
                        className="self-end rounded-full px-5 text-md md:self-start"
                    >
                        Add to Cart
                    </Button>
                </div>
            </div>

            {/* Product Reviews */}
            <ReviewSection
                productId={product._id.toString()}
                averageRating={product.ratingsAverage ?? 0}
                totalReviews={product.ratingsCount ?? 0}
            />
        </main>
    );
}
