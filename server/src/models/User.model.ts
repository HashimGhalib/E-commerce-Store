
import { Schema, model } from "mongoose";
import { IUser } from "shared";

const userSchema = new Schema<IUser>(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        provider: {
            type: String,
            enum: ["local", "google", "github"],
            default: "local",
        },
        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
            index: true,
        },
        image: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export const User = model<IUser>("User", userSchema);
