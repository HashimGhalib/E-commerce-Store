import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border bg-muted/30">
            <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">

                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold text-primary">
                            <ShoppingBag className="h-5 w-5" />
                            <span>Goayo</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            A high-performance e-commerce store built with Next.js, Express, and MongoDB.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-heading text-sm font-semibold text-foreground">Shop</h4>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/products" className="hover:text-foreground">All Products</Link></li>
                            <li><Link href="/categories" className="hover:text-foreground">Categories</Link></li>
                            <li><Link href="/deals" className="hover:text-foreground">Featured Deals</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-heading text-sm font-semibold text-foreground">Account</h4>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/login" className="hover:text-foreground">Sign In</Link></li>
                            <li><Link href="/cart" className="hover:text-foreground">Shopping Cart</Link></li>
                            <li><Link href="/orders" className="hover:text-foreground">Order History</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-heading text-sm font-semibold text-foreground">Legal</h4>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                        </ul>
                    </div>

                </div>

                <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} STORE Inc. All rights reserved.
                </div>
            </div>
        </footer>
    );
}