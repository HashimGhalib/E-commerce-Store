
import { z } from "zod";

// ==========================================
// USER REGISTRATION
// ==========================================

export const registerUserSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(1, "First name is required"),

    lastName: z
        .string()
        .trim()
        .min(1, "Last name is required"),

    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .toLowerCase(),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters long"),

    image: z
        .string()
        .url("Must be a valid URL")
        .optional(),
});

// ==========================================
// USER LOGIN
// ==========================================

export const loginUserSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .toLowerCase(),

    password: z
        .string()
        .min(1, "Password is required"),
});

// ==========================================
// TYPESCRIPT TYPES
// ==========================================

export type RegisterUserInput = z.infer<
    typeof registerUserSchema
>;

export type LoginUserInput = z.infer<
    typeof loginUserSchema
>;
