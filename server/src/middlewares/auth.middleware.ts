
import type { RequestHandler } from "express";
import type { Role } from "shared";

import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

/**
 * Verifies the JWT access token and authenticates the user.
 */
export const authenticate: RequestHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check whether the Authorization header exists.
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(
            new ApiError(401, "Authentication required. Please log in.")
        );
    }

    // Extract the token from the Authorization header.
    const token = authHeader.slice(7).trim();

    if (!token) {
        return next(
            new ApiError(401, "Authentication token is missing.")
        );
    }

    try {
        // Verify the token and decode its payload.
        const decoded = verifyAccessToken(token);

        // Attach authenticated user information to the request.
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };

        // Continue to the next middleware or controller.
        next();
    } catch {
        return next(
            new ApiError(401, "Invalid or expired authentication token.")
        );
    }
};

/**
 * Restricts access to users with specific roles.
 */
export function authorize(...allowedRoles: Role[]): RequestHandler {
    return (req, res, next) => {
        // Ensure authentication has already taken place.
        if (!req.user) {
            return next(
                new ApiError(401, "Authentication required.")
            );
        }

        // Check whether the user's role is permitted.
        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new ApiError(403, "You do not have permission to perform this action.")
            );
        }

        next();
    };
}
