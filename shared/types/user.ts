import type { Role } from "../constants/roles";

export interface User {
    id: string; // UUID

    firstName: string;
    lastName: string;

    email: string;
    password: string;

    image?: string;

    role: Role;

    createdAt: string;
    updatedAt: string;
}