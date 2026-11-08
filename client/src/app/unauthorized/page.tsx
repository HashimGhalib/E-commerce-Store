
import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
            <h1 className="text-4xl font-bold">
                Access Denied
            </h1>

            <p className="mt-3 text-muted-foreground">
                You do not have permission to access this page.
            </p>

            <Link
                href="/"
                className="mt-6 rounded-md bg-primary px-6 py-3 text-primary-foreground"
            >
                Return to Home
            </Link>
        </main>
    );
}
