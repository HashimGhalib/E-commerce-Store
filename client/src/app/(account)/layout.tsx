import Link from "next/link";
import { User, Package, Settings, LogOut } from "lucide-react";

interface AccountLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { label: "Profile", href: "/profile", icon: User },
    { label: "Orders", href: "/orders", icon: Package },
    { label: "Settings", href: "/settings", icon: Settings },
];

export default function AccountLayout({ children }: AccountLayoutProps) {
    return (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8 md:flex-row">
                {/* Account Sidebar Navigation */}
                <aside className="w-full shrink-0 md:w-64">
                    <div className="rounded-xl border border-border bg-card p-4 space-y-6">
                        <div className="border-b border-border pb-4 px-2">
                            <h2 className="font-heading text-lg font-bold">My Account</h2>
                            <p className="text-xs text-muted-foreground">Manage your orders and profile</p>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted text-foreground whitespace-nowrap"
                                    >
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="border-t border-border pt-4 px-2 hidden md:block">
                            <button
                                type="button"
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Account Content Area */}
                <main className="flex-1 rounded-xl border border-border bg-card p-6 shadow-sm min-h-[400px]">
                    {children}
                </main>
            </div>
        </div>
    );
}