import type { Document, Types } from "mongoose";

export interface IReview extends Document {
    product: Types.ObjectId;
    user: Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReviewUser {
    _id: string;
    name: string;
}

export interface ReviewResponse {
    _id: string;
    product: string;
    user: ReviewUser;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}