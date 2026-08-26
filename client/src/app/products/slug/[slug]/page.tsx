import { Button } from "@/components/ui/button";
import { getProductBySlug } from "@/lib/api";
import Image from "next/image";


interface ProductPageProps {
    params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
    // 1. Await the params Promise to get the slug
    const { slug } = await params;

    // 2. Fetch product data using the extracted slug
    const product = await getProductBySlug(slug);

    return (
        <main className="container mx-auto max-w-7xl  px-2 sm:px-4 lg:px-8 py-8">
            {product && (
                <div key={product._id} className="flex flex-col gap-10 md:flex-row md:justify-center p-4">
                    <Image
                        src={product.image[0]}
                        alt={product.name}
                        width={500}
                        height={500}
                        className="h-auto w-full md:h-100 md:w-1/2 lg:w-1/3 rounded-lg"
                        priority
                    />

                    <div className="flex gap-10 justify-between md:justify-center md:flex-col">
                        <div className="flex flex-col gap-4">
                            <h3 className="font-heading font-bold text-lg md:text-5xl">{product.name}</h3>
                            <p className="text-muted-foreground text-sm md:text-md w-3/4 md:w-full">{product.description}</p>
                            <p className="text-primary font-bold text-lg md:text-2xl">${product.price}</p>
                        </div>

                        <Button size="lg" className="self-end md:self-start text-md px-5 rounded-full ">
                            Add to Cart
                        </Button>
                    </div>



                </div>
            )}

        </main>
    );
}