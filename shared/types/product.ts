import type { Document, Types } from "mongoose";
import { ICategory } from "./category";

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
    image: string;
    category: Types.ObjectId | string | ICategory;
    stock: number;
    variants?: IProductVariant[];

    createdAt: string;
    updatedAt: string;
}

