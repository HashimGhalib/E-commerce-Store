import { ApiError } from "../utils/ApiError";
import type { Request, Response, NextFunction } from "express";

import type {
    ApiResponse as IApiResponse,
    AuthResponse,
} from "shared";

import type {
    RegisterUserInput,
    LoginUserInput,
} from "../validators/auth.validator";

import {
    registerUser,
    loginUser,
    refreshUserSession,
    logoutUser,
} from "../services/auth.service";

import { ApiResponse } from "../utils/ApiResponse";

const REFRESH_TOKEN_COOKIE = "refreshToken"; // a reusable constant for the cookie name

const isProduction = process.env.NODE_ENV === "production";

const refreshCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" as const : "lax" as const,
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

/**
 * Set the refresh token as an HTTP-only cookie.
 */
function setRefreshTokenCookie(
    res: Response,
    token: string
): void {
    res.cookie(
        REFRESH_TOKEN_COOKIE,
        token,
        refreshCookieOptions
    );
}

/**
 * Remove the refresh token cookie.
 */
function clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(
        REFRESH_TOKEN_COOKIE,
        {
            httpOnly: true,
            secure: isProduction,
            sameSite: refreshCookieOptions.sameSite,
            path: refreshCookieOptions.path,
        }
    );
}

/**
 * Send authentication response without exposing refresh token.
 */
function sendAuthResponse(
    res: Response<IApiResponse<AuthResponse>>,
    session: Awaited<ReturnType<typeof registerUser>>,
    statusCode: number,
    message: string
): void {
    setRefreshTokenCookie(res, session.refreshToken);

    const { refreshToken, ...authData } = session;

    ApiResponse.success(
        res,
        statusCode,
        authData,
        message
    );
}

/**
 * POST /api/auth/register
 */
export async function register(
    req: Request<{}, IApiResponse<AuthResponse>, RegisterUserInput>,
    res: Response<IApiResponse<AuthResponse>>,
    next: NextFunction
): Promise<void> {
    try {
        const session = await registerUser(req.body);

        sendAuthResponse(
            res,
            session,
            201,
            "Account created successfully."
        );
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/login
 */
export async function login(
    req: Request<{}, IApiResponse<AuthResponse>, LoginUserInput>,
    res: Response<IApiResponse<AuthResponse>>,
    next: NextFunction
): Promise<void> {
    try {
        const session = await loginUser(req.body);

        sendAuthResponse(
            res,
            session,
            200,
            "Login successful."
        );
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/refresh
 */
export async function refresh(
    req: Request,
    res: Response<IApiResponse<AuthResponse>>,
    next: NextFunction
): Promise<void> {
    try {
        const token = req.cookies?.[REFRESH_TOKEN_COOKIE];

        if (!token) {
            clearRefreshTokenCookie(res);
            return next(new ApiError(401, "Refresh token is missing."));
        }

        const session = await refreshUserSession(token);

        sendAuthResponse(
            res,
            session,
            200,
            "Session refreshed successfully."
        );
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/logout
 */
export async function logout(
    req: Request,
    res: Response<IApiResponse<void>>,
    next: NextFunction
): Promise<void> {
    try {
        const token = req.cookies?.[REFRESH_TOKEN_COOKIE];

        await logoutUser(token ?? "");

        clearRefreshTokenCookie(res);

        ApiResponse.success(
            res,
            200,
            undefined,
            "Logged out successfully."
        );
    } catch (error) {
        next(error);
    }
}
