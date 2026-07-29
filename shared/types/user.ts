import type { Role } from "../constants/roles";
import type { Document } from "mongoose";

export type AuthProvider = "local" | "google" | "github";

export interface IUser extends Document {
    firstName: string;
    lastName: string;

    email: string;
    password: string;
    provider?: AuthProvider

    image?: string;

    role: Role;

    createdAt: string;
    updatedAt: string;
}