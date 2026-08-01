import { Package } from "lucide-react";

export default function OrdersPage() {
    return (
        <div className="space-y-6">
            <div className="border-b border-border pb-4">
                <h1 className="font-heading text-2xl font-bold">Order History</h1>
                <p className="text-sm text-muted-foreground">Check the status of recent orders and downloads.</p>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                <Package className="h-10 w-10 text-muted-foreground/60 mb-3" />
                <h3 className="font-semibold text-base">No orders yet</h3>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                    When you place orders, they will appear here with tracking status.
                </p>
            </div>
        </div>
    );
}