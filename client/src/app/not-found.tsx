import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="container mx-auto px-4 py-24 flex min-h-[70vh] flex-col items-center justify-center text-center">
            <span className="font-heading text-8xl font-black text-primary/20 select-none">
                404
            </span>

            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl -mt-6 mb-2">
                Page Not Found
            </h1>
            <p className="text-muted-foreground max-w-md text-sm sm:text-base mb-8">
                Sorry, we couldn’t find the page or product you were looking for. It might have been moved or removed.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link href="/products">
                    <Button className="gap-2">
                        <Search className="h-4 w-4" />
                        Browse All Products
                    </Button>
                </Link>
                <Link href="/">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Return Home
                    </Button>
                </Link>
            </div>
        </div>
    );
}