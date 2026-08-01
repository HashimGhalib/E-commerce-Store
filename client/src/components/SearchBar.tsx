// components/layout/SearchBar.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProductSearch } from "@/hooks/useProductSearch";

export function SearchBar({ className }: { className?: string }) {
    const { query, setQuery, results, isLoading, isError, hasQuery, resetSearch } =
        useProductSearch();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={`relative w-full ${className ?? ""}`}>
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Search products..."
                className="pl-9 bg-muted/50 border-none focus-visible:ring-primary"
            />

            {hasQuery && isOpen && (
                <div className="absolute top-full mt-2 w-full rounded-md border border-border bg-background shadow-md z-50 max-h-80 overflow-y-auto">
                    {isLoading && (
                        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            Searching...
                        </div>
                    )}

                    {isError && (
                        <p className="py-6 text-center text-sm text-red-500">
                            Something went wrong. Try again.
                        </p>
                    )}

                    {!isLoading && !isError && results.length === 0 && (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            No products found.
                        </p>
                    )}

                    {!isLoading && results.length > 0 && (
                        <ul className="py-2">
                            {results.map((product) => (
                                <li key={String(product._id)}>
                                    <Link
                                        href={`/products/slug/${product.slug}`}
                                        onClick={() => {
                                            resetSearch();
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
                                    >
                                        <Image
                                            src={product.image[0] || ""}
                                            alt={product.name}
                                            width={36}
                                            height={36}
                                            className="h-9 w-9 rounded object-cover"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{product.name}</span>
                                            <span className="text-xs font-semibold text-primary">
                                                ${product.price.toFixed(2)}
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}