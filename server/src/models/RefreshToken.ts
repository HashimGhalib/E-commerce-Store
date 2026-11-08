
import { Schema, model, Types, Document } from "mongoose";

export interface IRefreshToken extends Document {
    user: Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
    revokedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        tokenHash: {
            type: String,
            required: true,
            unique: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        revokedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// MongoDB automatically removes expired refresh-token records.
refreshTokenSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

export const RefreshToken = model<IRefreshToken>(
    "RefreshToken",
    refreshTokenSchema
);
