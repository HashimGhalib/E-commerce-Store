
"use client";

import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
    const { user, logout } = useAuth();

    return (
        <main className="container mx-auto px-4 py-12">
            <div className="mx-auto max-w-3xl rounded-xl border p-8">
                <h1 className="text-3xl font-bold">
                    My Account
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Welcome to your Goayo account.
                </p>

                <div className="mt-8 space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Full Name
                        </p>
                        <p className="font-medium">
                            {user?.firstName} {user?.lastName}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Email Address
                        </p>
                        <p className="font-medium">
                            {user?.email}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Account Role
                        </p>
                        <p className="font-medium capitalize">
                            {user?.role}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => void logout()}
                    className="mt-8 rounded-md bg-destructive px-5 py-3 text-white"
                >
                    Logout
                </button>
            </div>
        </main>
    );
}
