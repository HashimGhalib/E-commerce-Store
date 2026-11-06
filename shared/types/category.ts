import { Document, Types } from "mongoose";

export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    parent?: Types.ObjectId | string | null;

    createdAt: Date;
    updatedAt: Date;
}

export interface CategoryTreeItem {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    parent: string | null;
    children: CategoryTreeItem[];
}