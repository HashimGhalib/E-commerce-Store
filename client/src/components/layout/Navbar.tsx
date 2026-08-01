"use client";

import Link from "next/link";
import { ShoppingBag, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { SearchBar } from "@/components/SearchBar";

export function Navbar() {
    const cartItemCount = 3; // Placeholder state

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/90">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
                    <ShoppingBag className="h-6 w-6" />
                    <span>Goayo</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
                    <Link href="/products" className="transition-colors hover:text-primary">
                        Products
                    </Link>
                    <Link href="/categories" className="transition-colors hover:text-primary">
                        Categories
                    </Link>
                </nav>

                {/* Desktop search */}
                <div className="hidden md:flex flex-1 max-w-sm mx-8">
                    <SearchBar />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Link href="/login" className="hidden sm:inline-flex">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <User className="h-4 w-4" />
                            Sign In
                        </Button>
                    </Link>

                    <Link href="/cart">
                        <Button variant="outline" size="icon" className="relative">
                            <ShoppingBag className="h-5 w-5" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                    {cartItemCount}
                                </span>
                            )}
                        </Button>
                    </Link>

                    {/* Mobile menu */}
                    <Sheet>
                        <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted hover:text-foreground md:hidden">
                            <Menu className="h-6 w-6" />
                        </SheetTrigger>
                        <SheetContent side="right" className="px-4">
                            <SheetHeader>
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            </SheetHeader>

                            <div className="flex flex-col gap-6 px-4 mt-4">
                                <SearchBar />

                                <nav className="flex flex-col items-start gap-2 font-medium text-sm">
                                    <SheetClose>
                                        <Link href="/products" className="py-2 hover:text-primary">
                                            Products
                                        </Link>
                                    </SheetClose>
                                    <SheetClose>
                                        <Link href="/categories" className="py-2 hover:text-primary">
                                            Categories
                                        </Link>
                                    </SheetClose>
                                    <SheetClose>
                                        <Link href="/login" className="py-2 hover:text-primary">
                                            <Button aschild={true} variant="default" size="sm" className="gap-2">
                                                <User className="h-4 w-4" />
                                                Sign In
                                            </Button>
                                        </Link>
                                    </SheetClose>
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}