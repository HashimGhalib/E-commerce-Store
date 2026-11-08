
import { randomBytes, createHash } from "crypto";

const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7;

interface GeneratedRefreshToken {
    token: string;
    tokenHash: string;
    expiresAt: Date;
}

/**
 * Generates a secure refresh token.
 */
export function generateRefreshToken(): GeneratedRefreshToken {
    // Generate a cryptographically secure random token.
    const token = randomBytes(64).toString("hex");

    // Hash the token before storing it in MongoDB.
    const tokenHash = createHash("sha256")
        .update(token)
        .digest("hex");

    // Calculate the expiration date.
    const expiresAt = new Date(
        Date.now() +
        REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
    );

    return {
        token,
        tokenHash,
        expiresAt,
    };
}

/**
 * Hashes an existing refresh token for database lookup.
 */
export function hashRefreshToken(token: string): string {
    return createHash("sha256")
        .update(token)
        .digest("hex");
}
