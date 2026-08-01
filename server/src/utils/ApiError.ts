// server/src/utils/ApiError.ts
export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly errors?: any[];
    public readonly isOperational: boolean;

    constructor(
        statusCode: number,
        message: string,
        errors?: any[],
        isOperational = true,
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        if (errors !== undefined) {
            this.errors = errors;
        }

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}