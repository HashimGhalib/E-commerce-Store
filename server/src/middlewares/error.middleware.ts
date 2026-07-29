// server/src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const errorHandler = (
    err: Error | ApiError | any,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors || undefined;

    // Handle Mongoose duplicate key error (11000)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {})[0] || "field";
        message = `A record with this ${field} already exists.`;
    }

    // Handle Mongoose CastError (e.g. invalid ObjectId)
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid format for field: ${err.path}`;
    }

    // Log non-operational (unexpected) server errors server-side
    if (statusCode === 500) {
        console.error("💥 UNEXPECTED ERROR:", err);
    }

    const isProduction = process.env.NODE_ENV === "production";

    res.status(statusCode).json({
        success: false,
        message: isProduction && statusCode === 500 ? "Internal Server Error" : message,
        ...(errors && { errors }),
        ...(!isProduction && { stack: err.stack }),
    });
};