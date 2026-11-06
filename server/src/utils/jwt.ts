
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import type { Role } from "shared";

// JWT payload returned after successful verification
export interface AuthTokenPayload extends JwtPayload {
    userId: string;
    role: Role;
}

// Get JWT secret from environment variables
function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables.");
    }

    return secret;
}

// Generate access token
export function generateAccessToken(
    userId: string,
    role: Role
): string {

    const expiresIn = (
        process.env.JWT_EXPIRES_IN ?? "15m"
    ) as NonNullable<SignOptions["expiresIn"]>;

    return jwt.sign(
        {
            userId,
            role,
        },
        getJwtSecret(),
        {
            expiresIn,
        }
    );
}

// Verify access token
export function verifyAccessToken(
    token: string
): AuthTokenPayload {
    const decoded = jwt.verify(token, getJwtSecret());

    if (
        typeof decoded === "string" ||
        typeof decoded.userId !== "string" ||
        !["customer", "admin"].includes(decoded.role as string)
    ) {
        throw new Error("Invalid authentication token.");
    }

    return decoded as AuthTokenPayload;
}
