export interface ProductVariant {
    id: string; // UUID
    name: string;
    value: string;
    stock: number;
}

export interface Product {
    id: string; // UUID
    name: string;
    slug: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    stock: number;
    variants?: ProductVariant[];

    createdAt: string;
    updatedAt: string;
}