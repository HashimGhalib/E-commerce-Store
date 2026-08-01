export default function ProfilePage() {
    return (
        <div className="space-y-6">
            <div className="border-b border-border pb-4">
                <h1 className="font-heading text-2xl font-bold">Profile Details</h1>
                <p className="text-sm text-muted-foreground">Update your personal information and address book.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 rounded-lg border border-border p-4 bg-muted/40">
                    <span className="text-xs font-semibold text-muted-foreground">Full Name</span>
                    <p className="font-medium text-sm">Alex Johnson</p>
                </div>
                <div className="space-y-1 rounded-lg border border-border p-4 bg-muted/40">
                    <span className="text-xs font-semibold text-muted-foreground">Email Address</span>
                    <p className="font-medium text-sm">alex.johnson@example.com</p>
                </div>
            </div>
        </div>
    );
}