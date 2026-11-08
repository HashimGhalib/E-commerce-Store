
"use client";

import Link from "next/link";
import { useState } from "react";

import {
    ShoppingBag,
    Menu,
    User,
    LogOut,
    LayoutDashboard,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

import { SearchBar } from "@/components/SearchBar";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
    const cartItemCount = 3; // Placeholder state

    const [isOpen, setIsOpen] = useState(false);

    const { user, isLoading, isAuthenticated, logout } = useAuth();

    const handleClose = () => setIsOpen(false);

    async function handleLogout() {
        handleClose();

        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/90">
            <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-6 px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link
                    href="/"
                    className="flex shrink-0 items-center gap-2 font-heading text-xl font-bold text-primary"
                >
                    <ShoppingBag className="h-6 w-6" />
                    <span>Goayo</span>
                </Link>

                {/* Desktop Navigation and Search */}
                <div className="hidden min-w-0 items-center gap-10 md:flex">
                    <nav className="flex shrink-0 items-center gap-8 text-sm font-medium text-muted-foreground">
                        <Link
                            href="/products"
                            className="transition-colors hover:text-primary"
                        >
                            Products
                        </Link>

                        <Link
                            href="/categories"
                            className="transition-colors hover:text-primary"
                        >
                            Categories
                        </Link>
                    </nav>

                    <div className="w-full max-w-sm">
                        <SearchBar />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center justify-end gap-3">

                    {/* Desktop Authentication */}
                    <div className="hidden items-center gap-2 sm:flex">
                        {isLoading ? (
                            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
                        ) : isAuthenticated ? (
                            <>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="max-w-28 truncate">
                                        {user?.firstName}
                                    </span>
                                </div>

                                {user?.role === "admin" && (
                                    <Link href="/admin">
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <LayoutDashboard className="h-4 w-4" />
                                            Dashboard
                                        </Button>
                                    </Link>
                                )}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Link href="/auth">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <User className="h-4 w-4" />
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Shopping Cart */}
                    <Link href="/cart">
                        <Button
                            variant="outline"
                            size="icon"
                            className="relative"
                            aria-label="Shopping cart"
                        >
                            <ShoppingBag className="h-5 w-5" />

                            {cartItemCount > 0 && (
                                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                    {cartItemCount}
                                </span>
                            )}
                        </Button>
                    </Link>

                    {/* Mobile Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted hover:text-foreground md:hidden"
                            aria-label="Open navigation menu"
                        >
                            <Menu className="h-6 w-6" />
                        </SheetTrigger>

                        <SheetContent side="right" className="px-4">
                            <SheetHeader>
                                <SheetTitle className="text-left font-heading text-xl">
                                    Goayo
                                </SheetTitle>
                            </SheetHeader>

                            <div className="mt-4 flex flex-col gap-6 px-4">

                                {/* Mobile Search */}
                                <SearchBar />

                                {/* Navigation Links */}
                                <nav className="flex flex-col items-start gap-2 text-sm font-medium">
                                    <Link
                                        href="/products"
                                        onClick={handleClose}
                                        className="w-full py-2 hover:text-primary"
                                    >
                                        Products
                                    </Link>

                                    <Link
                                        href="/categories"
                                        onClick={handleClose}
                                        className="w-full py-2 hover:text-primary"
                                    >
                                        Categories
                                    </Link>

                                    <Link
                                        href="/cart"
                                        onClick={handleClose}
                                        className="w-full py-2 hover:text-primary"
                                    >
                                        Shopping Cart
                                    </Link>
                                </nav>

                                {/* Mobile Authentication */}
                                <div className="border-t pt-5">
                                    {isLoading ? (
                                        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                                    ) : isAuthenticated ? (
                                        <div className="flex flex-col gap-3">

                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                    <User className="h-5 w-5" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold">
                                                        {user?.firstName} {user?.lastName}
                                                    </p>

                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {user?.email}
                                                    </p>
                                                </div>
                                            </div>

                                            {user?.role === "admin" && (
                                                <Link
                                                    href="/admin"
                                                    onClick={handleClose}
                                                    className="flex items-center gap-2 py-2 text-sm hover:text-primary"
                                                >
                                                    <LayoutDashboard className="h-4 w-4" />
                                                    Admin Dashboard
                                                </Link>
                                            )}

                                            <Button
                                                variant="outline"
                                                className="w-full justify-start gap-2"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </Button>
                                        </div>
                                    ) : (
                                        <Link href="/auth" onClick={handleClose}>
                                            <Button className="w-full gap-2">
                                                <User className="h-4 w-4" />
                                                Sign In / Register
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
