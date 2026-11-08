
import { User } from "../models/User.model";
import { RefreshToken } from "../models/RefreshToken";

import { ApiError } from "../utils/ApiError";
import { hashPassword, comparePassword } from "../utils/password";
import { generateAccessToken } from "../utils/jwt";

import {
    generateRefreshToken,
    hashRefreshToken,
} from "../utils/refresh-token";

import type {
    RegisterUserInput,
    LoginUserInput,
} from "../validators/auth.validator";

import type { AuthResponse, AuthUser } from "shared";

// Internal service result.
// The controller will put refreshToken in an HTTP-only cookie.
export type AuthSession = AuthResponse & {
    refreshToken: string;
};

/**
 * Converts a Mongoose user document into a safe response object.
 */
function toAuthUser(user: InstanceType<typeof User>): AuthUser {
    return {
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        provider: user.provider ?? "local",
        ...(user.image && { image: user.image }),
        role: user.role,
    };
}

/**
 * Creates an access token and a refresh token for a user.
 */
async function createSession(
    user: InstanceType<typeof User>
): Promise<AuthSession> {
    const accessToken = generateAccessToken(
        user._id.toString(),
        user.role
    );

    const refreshTokenData = generateRefreshToken();

    await RefreshToken.create({
        user: user._id,
        tokenHash: refreshTokenData.tokenHash,
        expiresAt: refreshTokenData.expiresAt,
    });

    return {
        user: toAuthUser(user),
        accessToken,
        refreshToken: refreshTokenData.token,
    };
}

/**
 * Register a new customer.
 */
export async function registerUser(
    input: RegisterUserInput
): Promise<AuthSession> {
    const { firstName, lastName, email, password, image } = input;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(
            409,
            "An account with this email already exists."
        );
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        provider: "local",
        role: "customer",
        ...(image && { image }),
    });

    return createSession(user);
}

/**
 * Authenticate an existing customer.
 */
export async function loginUser(
    input: LoginUserInput
): Promise<AuthSession> {
    const { email, password } = input;

    const user = await User.findOne({ email }).select("+password");

    if (!user || user.provider !== "local") {
        throw new ApiError(401, "Invalid email or password.");
    }

    const isPasswordValid = await comparePassword(
        password,
        user.password
    );

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password.");
    }

    return createSession(user);
}

/**
 * Exchange a valid refresh token for a new token pair.
 */
export async function refreshUserSession(
    token: string
): Promise<AuthSession> {
    if (!token) {
        throw new ApiError(401, "Refresh token is required.");
    }

    const tokenHash = hashRefreshToken(token);
    const now = new Date();

    const storedToken = await RefreshToken.findOne({
        tokenHash,
        revokedAt: null,
        expiresAt: { $gt: now },
    });

    if (!storedToken) {
        throw new ApiError(401, "Invalid or expired refresh token.");
    }

    const user = await User.findById(storedToken.user);

    if (!user) {
        throw new ApiError(401, "Invalid or expired refresh token.");
    }

    // Revoke the old token before issuing a replacement.
    // The conditional update prevents two simultaneous refreshes
    // from successfully using the same token.
    const result = await RefreshToken.updateOne(
        {
            _id: storedToken._id,
            revokedAt: null,
            expiresAt: { $gt: now },
        },
        {
            $set: { revokedAt: now },
        }
    );

    if (result.modifiedCount !== 1) {
        throw new ApiError(401, "Refresh token has already been used.");
    }

    return createSession(user);
}

/**
 * Revoke a refresh token during logout.
 */
export async function logoutUser(token: string): Promise<void> {
    if (!token) {
        return;
    }

    const tokenHash = hashRefreshToken(token);

    await RefreshToken.updateOne(
        {
            tokenHash,
            revokedAt: null,
        },
        {
            $set: { revokedAt: new Date() },
        }
    );
}
