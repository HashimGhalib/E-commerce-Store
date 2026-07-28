export interface OrderItem {
    id: string; // UUID
    productId: string; // Product UUID
    quantity: number;
    price: number;
}

export interface Order {
    id: string; // UUID
    userId: string; // User UUID

    items: OrderItem[];

    total: number;

    status:
    | "pending"
    | "paid"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

    createdAt: string;
    updatedAt: string;
}