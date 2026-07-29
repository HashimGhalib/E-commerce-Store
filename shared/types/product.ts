import type { Document, Types } from "mongoose";

export interface ProductParams {
    slug: string;
}

export interface IProductVariant {
    name: string;
    value: string[];
    stock: number;
}

export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    price: number;
    images: string[];
    category: Types.ObjectId;
    stock: number;
    variants?: IProductVariant[];

    createdAt: string;
    updatedAt: string;
}

